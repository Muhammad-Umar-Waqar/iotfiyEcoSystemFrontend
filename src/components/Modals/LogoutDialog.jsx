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

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    "& fieldset": { borderColor: "#E5EBF2" },
    "&:hover fieldset": { borderColor: "var(--eco-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--eco-primary)" },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--eco-primary)",
  },
};

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
  const isAdmin = user?.role === "admin";
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
        confirmButtonColor: "#0292FF",
      });
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to send OTP",
        confirmButtonText: "OK",
        confirmButtonColor: "#0292FF",
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
        confirmButtonColor: "#0292FF",
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
        confirmButtonColor: "#0292FF",
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
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px !important",
          overflow: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5EBF2",
          boxShadow: "0 12px 40px rgba(7, 81, 141, 0.14)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        id="account-dialog-title"
        sx={{
          color: "var(--eco-text)",
          fontWeight: 700,
          fontSize: "1.15rem",
          pb: 1.5,
          borderBottom: "1px solid #E5EBF2",
          background: "linear-gradient(180deg, #F5FAFE 0%, #FFFFFF 100%)",
        }}
      >
        Account Settings
      </DialogTitle>

      {!isAdmin && (
        <Box sx={{ borderBottom: "1px solid #E5EBF2", px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="account tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: "var(--eco-primary)", height: 3, borderRadius: 2 },
            }}
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 44,
                color: "var(--eco-text-muted)",
                "&.Mui-selected": { color: "var(--eco-primary)" },
              },
            }}
          >
            <Tab label="Logout" id="account-tab-0" aria-controls="account-tabpanel-0" />
            <Tab label="Change Email" id="account-tab-1" aria-controls="account-tabpanel-1" />
          </Tabs>
        </Box>
      )}

      <DialogContent sx={{ pt: 2.5, backgroundColor: "#FAFCFE" }}>
        <TabPanel value={tabValue} index={0}>
          <DialogContentText
            id="logout-dialog-description"
            sx={{ color: "var(--eco-text-muted)", fontSize: "0.95rem", lineHeight: 1.55 }}
          >
            {description}
          </DialogContentText>
        </TabPanel>

        {!isAdmin && (
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
                sx={textFieldSx}
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
                sx={textFieldSx}
              />

              {!otpSent ? (
                <Button
                  variant="contained"
                  onClick={handleRequestEmailChange}
                  disabled={requestLoading || !newEmail}
                  startIcon={requestLoading ? <CircularProgress size={16} color="inherit" /> : null}
                  fullWidth
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "0.5rem",
                    py: 1.1,
                    backgroundColor: "var(--eco-primary)",
                    boxShadow: "0 4px 12px rgba(2, 146, 255, 0.28)",
                    "&:hover": { backgroundColor: "var(--eco-primary-hover)" },
                  }}
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
                    sx={textFieldSx}
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
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "0.5rem",
                        borderColor: "#DCE6F0",
                        color: "var(--eco-text-label)",
                        "&:hover": {
                          borderColor: "var(--eco-primary)",
                          backgroundColor: "var(--eco-primary-softer)",
                        },
                      }}
                    >
                      Change Email
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleVerifyEmailChange}
                      disabled={verifyLoading || !otp}
                      startIcon={verifyLoading ? <CircularProgress size={16} color="inherit" /> : null}
                      fullWidth
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "0.5rem",
                        backgroundColor: "var(--eco-primary)",
                        boxShadow: "0 4px 12px rgba(2, 146, 255, 0.28)",
                        "&:hover": { backgroundColor: "var(--eco-primary-hover)" },
                      }}
                    >
                      {verifyLoading ? "Verifying..." : "Verify & Change"}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </TabPanel>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #E5EBF2",
          backgroundColor: "#FFFFFF",
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading || requestLoading || verifyLoading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "var(--eco-text-muted)",
            borderRadius: "0.5rem",
            "&:hover": { backgroundColor: "var(--eco-primary-softer)", color: "var(--eco-text)" },
          }}
        >
          Cancel
        </Button>

        {tabValue === 0 && (
          <Button
            onClick={onConfirm}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "0.5rem",
              backgroundColor: "#EF4444",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.28)",
              "&:hover": { backgroundColor: "#DC2626" },
            }}
          >
            {loading ? "Signing out..." : "Logout"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
