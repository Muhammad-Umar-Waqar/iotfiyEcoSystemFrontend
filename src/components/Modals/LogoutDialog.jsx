import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  TextField,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import { fetchCurrentUser } from "../../slices/authSlice";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function LogoutDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Sign out?",
  description = "Are you sure you want to sign out? You will need to log in again to access the system.",
}) {
  const { user, token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);

  // Email change states
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset email change form when switching tabs
    if (newValue === 0) {
      resetEmailChangeForm();
    }
  };

  const resetEmailChangeForm = () => {
    setNewEmail("");
    setOtp("");
    setOtpSent(false);
    setError("");
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.trim()) {
      setError("Please enter a new email address");
      return;
    }

    if (newEmail === user?.email) {
      setError("New email must be different from current email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setRequestLoading(true);

    try {
      const response = await fetch(`${BASE}/user/request-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request email change");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "OTP sent to your new email address!",
        confirmButtonText: "OK",
      });
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to send OTP",
        confirmButtonText: "OK",
      });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!otp || !otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    setError("");
    setVerifyLoading(true);

    try {
      const response = await fetch(`${BASE}/user/verify-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Email changed successfully!",
        confirmButtonText: "OK",
      });

      await dispatch(fetchCurrentUser()).unwrap();
      
      resetEmailChangeForm();
      setTabValue(0);
      onClose();

      // Optionally reload user data or update Redux state
      window.location.reload(); // Simple approach to refresh user data
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Invalid OTP",
        confirmButtonText: "OK",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleClose = () => {
    resetEmailChangeForm();
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      aria-labelledby="account-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="account-dialog-title">Account Settings</DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="account tabs">
          <Tab label="Logout" id="account-tab-0" aria-controls="account-tabpanel-0" />
          <Tab label="Change Email" id="account-tab-1" aria-controls="account-tabpanel-1" />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <DialogContentText id="logout-dialog-description">
            {description}
          </DialogContentText>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <TextField
              label="Current Email"
              value={user?.email || ""}
              disabled
              fullWidth
              variant="outlined"
            />

            <TextField
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={otpSent || requestLoading}
              fullWidth
              variant="outlined"
              placeholder="Enter new email address"
            />

            {!otpSent ? (
              <Button
                variant="contained"
                onClick={handleRequestEmailChange}
                disabled={requestLoading || !newEmail}
                startIcon={requestLoading ? <CircularProgress size={16} /> : null}
                fullWidth
              >
                {requestLoading ? "Sending OTP..." : "Request Change"}
              </Button>
            ) : (
              <>
                <Alert severity="info">
                  An OTP has been sent to {newEmail}. Please check your email and enter the code below.
                </Alert>

                <TextField
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={verifyLoading}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter 6-digit OTP"
                  inputProps={{ maxLength: 6 }}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    disabled={verifyLoading}
                    fullWidth
                  >
                    Change Email
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleVerifyEmailChange}
                    disabled={verifyLoading || !otp}
                    startIcon={verifyLoading ? <CircularProgress size={16} /> : null}
                    fullWidth
                  >
                    {verifyLoading ? "Verifying..." : "Verify & Change"}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading || requestLoading || verifyLoading}>
          Cancel
        </Button>

        {tabValue === 0 && (
          <Button
            onClick={onConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Signing out..." : "Logout"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
