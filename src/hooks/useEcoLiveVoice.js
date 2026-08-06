/**
 * Eco Live Voice — WebRTC speech-to-speech via OpenAI Realtime.
 * Separate from mic → STT → /help/chat/stream.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5054";
const END_LIVE_SESSION_TOOL = "endLiveVoiceSession";

/**
 * Soft fallback if model forgets the end tool.
 * NOTE: plain "thank you so much" is NOT enough — needs clear hang-up intent.
 */
function looksLikeEndCallIntent(text) {
  const t = String(text || "").toLowerCase();
  if (!t) return false;
  return (
    /\b(end|close|stop|hang\s*up)\b.{0,24}\b(call|session|conversation)\b/.test(t) ||
    /\b(call|session)\b.{0,16}\b(end|band|khatam)\b/.test(t) ||
    /\b(you can end|please end|go ahead and end)\b/.test(t) ||
    /\b(that'?s all|that is all|i'?m done|im done|nothing else)\b/.test(t) ||
    /\b(goodbye|good bye|bye bye)\b/.test(t) ||
    /\bthank(s| you).{0,80}\b(your time|for your time)\b/.test(t) ||
    /\b(shukriya|shukria).{0,40}\b(time|waqt|band|end|khatam)\b/.test(t) ||
    /\b(bas itna|bas itni|ab band|call band|session band|khatam karo)\b/.test(t)
  );
}

/** After generation finishes, wait for WebRTC jitter buffer / slow network to finish playing. */
function playbackTailMs(spokenText) {
  const words = String(spokenText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  // Base buffer for laggy networks + small per-word cushion
  return Math.min(14000, Math.max(3500, 2800 + words * 120));
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseToolArgs(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * @param {object} opts
 * @param {(msg: { role: 'user'|'bot', text: string, live?: boolean }) => void} opts.onChatMessage
 * @param {(status: string) => void} [opts.onStatus]
 * @param {(err: string) => void} [opts.onError]
 * @param {() => void} [opts.onEnded]
 */
export async function startEcoLiveVoice(opts = {}) {
  const { onChatMessage, onStatus, onError, onEnded } = opts;

  const sessionRes = await fetch(`${API_BASE}/help/realtime/session`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: "{}",
  });
  const sessionData = await sessionRes.json().catch(() => ({}));
  if (!sessionRes.ok || !sessionData.success || !sessionData.clientSecret) {
    throw new Error(sessionData.message || "Could not start live voice session.");
  }

  const ephemeralKey = sessionData.clientSecret;
  const pc = new RTCPeerConnection();
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  audioEl.setAttribute("playsinline", "true");

  const remoteStream = new MediaStream();
  pc.ontrack = (e) => {
    e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
    audioEl.srcObject = remoteStream;
  };

  const localStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

  const dc = pc.createDataChannel("oai-events");

  /** @type {Map<string, { name: string, arguments: string }>} */
  const pendingCalls = new Map();
  let lastUserTranscript = "";
  let lastAssistantSpoken = "";
  let assistantTranscriptBuf = "";
  let closed = false;

  /**
   * pendingEnd: user/model wants hang-up.
   * We only stop AFTER the farewell audio response has finished generating
   * + a playback tail (so the sentence is not cut mid-way).
   */
  let pendingEnd = false;
  /** Skip stop on the same turn that only contained the end tool (wait for goodbye audio). */
  let awaitGoodbyeAfterEndTool = false;
  let endStopTimer = null;
  let endHardCapTimer = null;

  const sendEvent = (payload) => {
    if (dc.readyState === "open") {
      dc.send(JSON.stringify(payload));
    }
  };

  const clearEndTimers = () => {
    if (endStopTimer != null) {
      clearTimeout(endStopTimer);
      endStopTimer = null;
    }
    if (endHardCapTimer != null) {
      clearTimeout(endHardCapTimer);
      endHardCapTimer = null;
    }
  };

  const stop = () => {
    if (closed) return;
    closed = true;
    clearEndTimers();
    try {
      sendEvent({ type: "response.cancel" });
    } catch {
      /* ignore */
    }
    try {
      dc.close();
    } catch {
      /* ignore */
    }
    try {
      pc.close();
    } catch {
      /* ignore */
    }
    localStream.getTracks().forEach((t) => t.stop());
    remoteStream.getTracks().forEach((t) => t.stop());
    audioEl.srcObject = null;
    audioEl.remove();
    onStatus?.("");
    onEnded?.();
  };

  const armHardCap = () => {
    if (endHardCapTimer != null) return;
    // Absolute safety so a hung session still closes
    endHardCapTimer = setTimeout(() => stop(), 20000);
  };

  /** Call only when farewell speech generation is done — then wait for playback. */
  const scheduleStopAfterPlayback = (spoken) => {
    if (closed || !pendingEnd) return;
    onStatus?.("Goodbye — finishing…");
    if (endStopTimer != null) clearTimeout(endStopTimer);
    const delay = playbackTailMs(spoken || lastAssistantSpoken);
    endStopTimer = setTimeout(() => stop(), delay);
    armHardCap();
  };

  const markPendingEnd = (statusText) => {
    if (closed) return;
    pendingEnd = true;
    onStatus?.(statusText || "Wrapping up…");
    armHardCap();
  };

  const runToolAndReply = async (callId, name, argsJson) => {
    const isEnd = name === END_LIVE_SESSION_TOOL;

    if (isEnd) {
      markPendingEnd("Ending call…");
      // If model already spoke goodbye in this turn, finish after that audio plays.
      // If not, request one goodbye response, then stop after THAT audio completes.
      const alreadySaidGoodbye = Boolean(String(lastAssistantSpoken || "").trim());
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({
            ok: true,
            endSession: true,
            message:
              "Client will end the session only after your goodbye audio finishes playing.",
          }),
        },
      });

      if (alreadySaidGoodbye) {
        awaitGoodbyeAfterEndTool = false;
        scheduleStopAfterPlayback(lastAssistantSpoken);
      } else {
        awaitGoodbyeAfterEndTool = true;
        sendEvent({ type: "response.create" });
      }
      return;
    }

    onStatus?.("Looking that up…");
    try {
      const res = await fetch(`${API_BASE}/help/realtime/tool`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name,
          arguments: parseToolArgs(argsJson),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const result = data.result ?? { error: data.message || "Tool failed" };
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(result),
        },
      });
      sendEvent({ type: "response.create" });
    } catch (err) {
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify({ error: err?.message || "Tool failed" }),
        },
      });
      sendEvent({ type: "response.create" });
    }
  };

  const formatAndPushBot = async (spoken) => {
    const text = String(spoken || "").trim();
    if (!text) return;
    try {
      const res = await fetch(`${API_BASE}/help/realtime/format-chat`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          spokenText: text,
          userText: lastUserTranscript,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const chatText =
        res.ok && data.success && data.text ? String(data.text).trim() : text;
      onChatMessage?.({ role: "bot", text: chatText, live: true });
    } catch {
      onChatMessage?.({ role: "bot", text, live: true });
    }
  };

  const handleServerEvent = async (event) => {
    if (!event?.type || closed) return;

    switch (event.type) {
      case "session.created":
      case "session.updated":
        if (!pendingEnd) onStatus?.("Listening — say Hey Eco");
        break;

      case "input_audio_buffer.speech_started":
        if (!pendingEnd) onStatus?.("Listening…");
        // User started talking again — cancel a pending hang-up from a soft false start
        if (pendingEnd && !awaitGoodbyeAfterEndTool && endStopTimer != null) {
          // If we're mid playback-tail and user speaks, still allow interrupt; keep pendingEnd
        }
        assistantTranscriptBuf = "";
        break;

      case "input_audio_buffer.speech_stopped":
        if (!pendingEnd) onStatus?.("Thinking…");
        break;

      case "conversation.item.input_audio_transcription.completed": {
        const t = String(event.transcript || "").trim();
        if (t) {
          lastUserTranscript = t;
          onChatMessage?.({ role: "user", text: t, live: true });
          if (looksLikeEndCallIntent(t)) {
            // Do NOT stop yet — wait until Eco finishes the full spoken reply.
            markPendingEnd("Wrapping up…");
          }
        }
        break;
      }

      case "response.output_audio_transcript.delta":
        assistantTranscriptBuf += event.delta || "";
        break;

      case "response.output_audio_transcript.done": {
        const spoken = String(
          event.transcript || assistantTranscriptBuf || ""
        ).trim();
        assistantTranscriptBuf = "";
        if (spoken) {
          lastAssistantSpoken = spoken;
          await formatAndPushBot(spoken);
        }

        if (pendingEnd) {
          // Full farewell line generated — wait for it to finish playing, then close.
          awaitGoodbyeAfterEndTool = false;
          scheduleStopAfterPlayback(spoken);
        } else {
          onStatus?.("Listening — say Hey Eco");
        }
        break;
      }

      case "response.output_item.done": {
        const item = event.item;
        if (item?.type === "function_call" && item.call_id) {
          pendingCalls.set(item.call_id, {
            name: item.name,
            arguments: item.arguments || "{}",
          });
        }
        break;
      }

      case "response.done": {
        const output = event.response?.output || [];
        const calls = output.filter(
          (o) => o?.type === "function_call" && o.call_id
        );
        if (calls.length) {
          pendingCalls.clear();
          for (const call of calls) {
            await runToolAndReply(call.call_id, call.name, call.arguments);
          }
          // Do NOT stop here — tool turn may have cut speech; goodbye audio may follow.
        } else if (pendingCalls.size) {
          const entries = [...pendingCalls.entries()];
          pendingCalls.clear();
          for (const [callId, meta] of entries) {
            await runToolAndReply(callId, meta.name, meta.arguments);
          }
        } else if (pendingEnd && awaitGoodbyeAfterEndTool) {
          // Goodbye response finished with no audio transcript event — still close safely.
          scheduleStopAfterPlayback(lastAssistantSpoken);
        }
        // Never stop immediately on response.done when audio may still be playing.
        break;
      }

      case "error": {
        const msg =
          event.error?.message ||
          event.message ||
          "Live voice error. Please try again.";
        console.error("[EcoLiveVoice]", event);
        onError?.(msg);
        break;
      }

      default:
        break;
    }
  };

  dc.addEventListener("open", () => {
    onStatus?.("Connected — say Hey Eco");
  });

  dc.addEventListener("message", (e) => {
    let event;
    try {
      event = JSON.parse(e.data);
    } catch {
      return;
    }
    handleServerEvent(event);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  });

  if (!sdpRes.ok) {
    const errText = await sdpRes.text().catch(() => "");
    throw new Error(errText || "WebRTC handshake failed.");
  }

  const answerSdp = await sdpRes.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  const interrupt = () => {
    try {
      sendEvent({ type: "response.cancel" });
    } catch {
      /* ignore */
    }
  };

  return { stop, interrupt, pc, audioEl };
}
