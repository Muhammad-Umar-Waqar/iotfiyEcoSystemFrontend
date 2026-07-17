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
import TriggerEventModal from "./TriggerEventModal";
import { Plus, CalendarClock } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const TriggerEventsSection = ({
  selectedDevice,
  externalOpen = false,
  onExternalClose,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);

  const isModalOpen = openModal || externalOpen;

  const handleModalClose = () => {
    setOpenModal(false);
    onExternalClose?.();
  };

  const fetchEvents = async () => {
    try {
      const deviceId = selectedDevice?.deviceId;
      if (!deviceId) return;

      console.log(`🔄 [TriggerEventsSection] fetchEvents called for device: ${deviceId}`);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/trigger/events/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(`✅ [TriggerEventsSection] Events fetched for ${deviceId}:`, res.data);
      const fetchedEvents =
        res.data?.schedules ||
        res.data?.events ||
        (Array.isArray(res.data) ? res.data : []) ||
        [];
      console.log(`📋 [TriggerEventsSection] Fetched ${fetchedEvents.length} trigger events`);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to fetch trigger events:", err);
      // Don't show error if no events found (404)
      if (err.response?.status !== 404) {
        console.error("Unexpected error fetching trigger events:", err);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDevice?.deviceId]);

  const addEvent = async (newEvent) => {
    try {
      const deviceId = selectedDevice?.deviceId;
      if (!deviceId) return;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/trigger/create-event`,
        {
          deviceId,
          startTime: newEvent.startTime,
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
        title: "Trigger Event Created",
        text: res.data.message || "Trigger schedule created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh events from backend
      await fetchEvents();

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Could not create trigger event",
      });
    }
  };

  const eventKey = (event) => String(event?._id ?? event?.id ?? "");

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const previousEvents = events;

    try {
      setWorking(true);

      // Optimistic UI update — remove immediately so the list doesn't wait on refetch
      setEvents((prev) =>
        prev.filter((e) => eventKey(e) !== String(deleteTarget))
      );
      setDeleteOpen(false);

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/trigger/delete/${deleteTarget}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setDeleteTarget(null);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Trigger event deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // Sync from API, but keep the deleted id out if the list is briefly stale
      const deviceId = selectedDevice?.deviceId;
      if (deviceId) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/trigger/events/${deviceId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const fetchedEvents =
            res.data?.schedules ||
            res.data?.events ||
            (Array.isArray(res.data) ? res.data : []) ||
            [];
          setEvents(
            fetchedEvents.filter((e) => eventKey(e) !== String(deleteTarget))
          );
        } catch (fetchErr) {
          console.error("Failed to refresh trigger events after delete:", fetchErr);
        }
      }
    } catch (err) {
      console.error(err);
      // Restore list if delete failed
      setEvents(previousEvents);
      setDeleteOpen(false);
      setDeleteTarget(null);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Could not delete trigger event",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const toggleEventStatus = async (event) => {
    try {
      const nextStatus = event.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/trigger/${event._id || event.id}/status`,
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
        title: res.data.message || "Status updated successfully",
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
            Trigger Events
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
          <p className="text-sm font-medium text-slate-400">No trigger events yet</p>
          <p className="text-xs text-slate-300 mt-0.5">
            Click "Add Event" to create a trigger schedule
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
                key={eventKey(event) || `${event.startTime}-${event.status}`}
                event={event}
                onToggle={() => toggleEventStatus(event)}
                onDelete={() => handleDeleteClick(event._id || event.id)}
                isTriggerEvent={true}
              />
            ))}
          </div>
        </div>
      )}

      <TriggerEventModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSave={addEvent}
      />

      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete trigger event?</DialogTitle>

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

export default TriggerEventsSection;
