import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { User, UserX } from "lucide-react";

const SuspendUserDialog = ({
  open,
  onClose,
  onConfirm,
  user,
  loading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Suspension reason is required");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle className="font-semibold text-gray-800">
       <div className="text-center  py-3 flex items-center justify-center gap-2">
         Suspend <span><UserX/></span>
       </div> 
        <div className="text-sm md:text-md lg:text-lg xl:text-xl text-gray-600 mb-3 text-center font-semibold">{user?.email || user?.name}</div>
      </DialogTitle>

      <DialogContent>
        <p className="text-sm text-gray-600 mb-3">
          Please provide a reason for suspending this user.
        </p>

        <TextField
          autoFocus
          multiline
          minRows={3}
          fullWidth
          placeholder="Enter suspension reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error}
        />
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? "Suspending..." : "Suspend"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuspendUserDialog;
