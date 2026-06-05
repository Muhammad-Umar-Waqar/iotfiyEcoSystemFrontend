
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";


export default function LogoutDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Sign out?",
  description = "Are you sure you want to sign out? You will need to log in again to access the system.",
}) {
  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
    >
      <DialogTitle id="logout-dialog-title">{title}</DialogTitle>

      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Signing out..." : "Logout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
