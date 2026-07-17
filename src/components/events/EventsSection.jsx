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
  onScheduleRefresh,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const { setEvents: setContextEvents, eventsRefreshMap = {} } = useScheduler() ?? {};

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
          // 404 used to mean "no events" — treat as empty list
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 404,
        }
      );

      const fetchedEvents =
        res.status === 404 ? [] : res.data?.events || [];
      console.log(`📋 [EventsSection] Fetched ${fetchedEvents.length} events`);
      setEvents(fetchedEvents);

      const markedEvents =
        fetchedEvents.length > 0
          ? await fetchAndMarkEvents(deviceId, fetchedEvents)
          : [];

      setContextEvents(deviceId, markedEvents);
      console.log(`✅ [EventsSection] fetchEvents completed for ${deviceId}`);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDevice?.deviceId, eventsRefreshMap?.[selectedDevice?.deviceId]]);

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
          ...(selectedDevice?.deviceType === "AC"
            ? {
                command: newEvent.command || "ON",
                setTemperature: newEvent.setTemperature,
              }
            : {}),
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
      onScheduleRefresh?.(deviceId);

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
    const deviceId = selectedDevice?.deviceId;
    const targetId = String(deleteTarget);
    const previousEvents = events;

    try {
      setWorking(true);

      // Optimistic UI — remove immediately (dashboard + context)
      const updated = events.filter((e) => String(e._id) !== targetId);
      setEvents(updated);
      if (deviceId) setContextEvents(deviceId, updated);
      onEventsChange?.(updated);

      setDeleteOpen(false);
      setDeleteTarget(null);

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/event/delete/${deleteTarget}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Event deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchEvents();
      onScheduleRefresh?.(deviceId);
    } catch (err) {
      console.error(err);
      // Rollback if API failed
      setEvents(previousEvents);
      if (deviceId) setContextEvents(deviceId, previousEvents);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Could not delete event",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };


  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toMinutes = (t = "") => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };



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
          {/* {events.length > 0 && (
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          )} */}
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
        deviceType={selectedDevice?.deviceType}
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