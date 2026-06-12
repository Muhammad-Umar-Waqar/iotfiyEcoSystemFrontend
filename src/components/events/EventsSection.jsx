import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import { hasCollision } from "./eventUtils";
import { Plus, CalendarClock } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useScheduler } from "../../contexts/SchedulerContext";

const EventsSection = ({
  selectedDevice,
  externalOpen = false,
  onExternalClose,
  onEventsChange,
  onToggleChange,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const { setEvents: setContextEvents, fetchToggleStatus } = useScheduler();

  const isModalOpen = openModal || externalOpen;

  const handleModalClose = () => {
    setOpenModal(false);
    onExternalClose?.();
  };
  //FaRaZ
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);

  // ✅ NEW: Fetch current/next event status and mark events
  const fetchAndMarkEvents = async (deviceId, allEvents) => {
    try {
      console.log(`🔵 [EventsSection] Calling API: /event/get/${deviceId}`);

      // Fetch current/next event status from backend
      const statusRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(`✅ [EventsSection] API Response for ${deviceId}:`, statusRes.data);

      if (statusRes.data && statusRes.data.event) {
        const { type, event } = statusRes.data;

        console.log(`🎯 [EventsSection] Marking event ${event._id} as ${type}`);

        // Mark the matching event with type and merge additional fields (duration, isOvernight, etc.)
        const markedEvents = allEvents.map(e => {
          if (e._id === event._id) {
            // ✅ Merge all fields from API response including duration
            return { ...e, ...event, type };
          }
          return e;
        });

        console.log(`📦 [EventsSection] Marked events:`, markedEvents);
        return markedEvents;
      }

      console.log(`⚠️ [EventsSection] No event in response, returning unmarked events`);
      return allEvents;
    } catch (err) {
      console.error(`❌ [EventsSection] Failed to fetch current/next status:`, err);
      return allEvents;
    }
  };

  const fetchEvents = async () => {
    try {
      const deviceId = selectedDevice?.deviceId;
      if (!deviceId) return;

      console.log(`🔄 [EventsSection] fetchEvents called for device: ${deviceId}`);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(`✅ [EventsSection] Events fetched for ${deviceId}:`, res);
      const fetchedEvents = res.data.events || [];
      console.log(`📋 [EventsSection] Fetched ${fetchedEvents.length} events`);
      setEvents(fetchedEvents);

      // ✅ Fetch current/next status and mark events with type
      const markedEvents = await fetchAndMarkEvents(deviceId, fetchedEvents);

      // ✅ Sync marked events to global context so SchedulerDeviceCard sees the changes
      console.log(`🔄 [EventsSection] Syncing ${markedEvents.length} marked events to context`);
      setContextEvents(deviceId, markedEvents);

      // ✅ Also fetch toggle status to update ON/OFF state
      await fetchToggleStatus(deviceId);

      console.log(`✅ [EventsSection] fetchEvents completed for ${deviceId}`);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDevice?.deviceId]);

  // const addEvent = (newEvent) => {
  //   const collision = hasCollision(events, newEvent);

  //   if (collision) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Time Conflict",
  //       text: "An event already exists within this time range. Please choose a different time slot.",
  //       confirmButtonText: "Got it",
  //       confirmButtonColor: "#3B82F6",
  //       background: "#ffffff",
  //       color: "#1e293b",
  //       customClass: {
  //         popup: "rounded-2xl shadow-xl",
  //         title: "text-base font-semibold",
  //         htmlContainer: "text-sm text-slate-500",
  //         confirmButton: "rounded-lg text-sm font-semibold px-5 py-2",
  //       },
  //       buttonsStyling: true,
  //     });
  //     return;
  //   }

  //   const updated = [newEvent, ...events];
  //   onEventsChange?.(updated);

  //   setTimeout(() => {
  //     scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  //   }, 50);

  //   Swal.fire({
  //     icon: "success",
  //     title: "Event Created",
  //     text: `Scheduled ${newEvent.command} from ${newEvent.start} to ${newEvent.end}.`,
  //     timer: 2000,
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     toast: true,
  //     position: "bottom-end",
  //     background: "#ffffff",
  //     color: "#1e293b",
  //     customClass: {
  //       popup: "rounded-xl shadow-lg border border-slate-100",
  //       title: "text-sm font-semibold",
  //       htmlContainer: "text-xs text-slate-400",
  //     },
  //   });
  // };

  const addEvent = async (newEvent) => {
    try {
      const deviceId = selectedDevice?.deviceId;
      if (!deviceId) return;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/event/create`,
        {
          deviceId,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          days: newEvent.days,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Event Created",
        text: "Schedule created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // ✅ Refresh events from backend
      await fetchEvents();

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Could not create event",
      });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setWorking(true);

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/event/delete/${deleteTarget}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updated = events.filter((e) => e._id !== deleteTarget);
      onEventsChange?.(updated);

      setDeleteOpen(false);
      setDeleteTarget(null);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Event deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      
      await fetchEvents();
      
      
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not delete event",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  //   const toggleEvent = (id) => {
  //   const target = events.find((e) => e.id === id);
  //   if (!target) return;

  //   const updated = events.map((e) =>
  //     e.id === id ? { ...e, enabled: !e.enabled } : e
  //   );
  //   onEventsChange?.(updated);

  //   // If we just disabled a currently-running event, move toggle to OFF
  //   if (target.enabled) {
  //     const now = new Date();
  //     const nowM = now.getHours() * 60 + now.getMinutes();
  //     const s = toMinutes(target.start);
  //     const en = toMinutes(target.end);
  //     const wasRunning = en > s ? nowM >= s && nowM < en : nowM >= s || nowM < en;
  //     if (wasRunning) onToggleChange?.("off");
  //   }

  //   // ... Swal toast unchanged
  // };


  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toMinutes = (t = "") => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };



  // const toggleEvent = (id) => {
  //   const target = events.find((e) => e.id === id);
  //   if (!target) return;

  //   const updated = events.map((e) =>
  //     e.id === id ? { ...e, enabled: !e.enabled } : e
  //   );
  //   onEventsChange?.(updated);


  //   // If we just disabled a currently-running event, move toggle to OFF
  //   if (target.enabled) {
  //     const now = new Date();
  //     const nowM = now.getHours() * 60 + now.getMinutes();
  //     const s = toMinutes(target.start);
  //     const en = toMinutes(target.end);
  //     const wasRunning = en > s ? nowM >= s && nowM < en : nowM >= s || nowM < en;
  //     if (wasRunning) onToggleChange?.("off");
  //   }

  //   Swal.fire({
  //     toast: true,
  //     position: "bottom-end",
  //     icon: !target.enabled ? "success" : "info",
  //     title: !target.enabled ? "Event Activated" : "Event Deactivated",
  //     timer: 1500,
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     background: "#ffffff",
  //     color: "#1e293b",
  //     customClass: {
  //       popup: "rounded-xl shadow-lg border border-slate-100",
  //       title: "text-sm font-semibold",
  //     },
  //   });
  // };

  const toggleEventStatus = async (event) => {
    try {
      const nextStatus = event.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/event/${event._id}/status`,
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: res.data.message,
        timer: 1500,
        showConfirmButton: false,
      });

      // refresh list from backend (source of truth)
      await fetchEvents();

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Status update failed",
      });
    }
  };

  if (!selectedDevice) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-slate-400" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
            Events
          </h2>
          {events.length > 0 && (
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          )}
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <CalendarClock size={28} className="text-slate-300 mb-2" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-400">No events yet</p>
          <p className="text-xs text-slate-300 mt-0.5">
            Click "Add Event" to create a schedule
          </p>
        </div>
      ) : (
        <div className="mt-2 min-w-0 w-full overflow-hidden">
          
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 min-w-0"
          style={{ scrollbarWidth: "thin" }}
        >
          {events.map((event) => (
            <EventCard
              key={event.id || event._id}
              event={event}
              onToggle={() => toggleEventStatus(event)}
              onDelete={() => handleDeleteClick(event._id)}
            />
          ))}
        </div>
     </div>
      )}

      <EventModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSave={addEvent}
      />



      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete event?</DialogTitle>

        <DialogContent dividers>
          This action cannot be undone.
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={working}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={working}
            endIcon={working ? <CircularProgress size={18} /> : null}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};



export default EventsSection;