import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { Mail, Lock } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { fetchCurrentUser } from "../../slices/authSlice";

export default function EmailChangeDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const currentEmail = user?.email || "";

  // Reset form when dialog closes
  const handleClose = () => {
    if (!requesting && !verifying) {
      setNewEmail("");
      setOtp("");
      setOtpSent(false);
      onClose();
    }
  };

  // Step 1: Request email change (sends OTP to new email)
  const handleRequestEmailChange = async () => {
    if (!newEmail) {
      Swal.fire({
        icon: "warning",
        title: "Missing Email",
        text: "Please enter your new email address.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    // Check if same as current email
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      Swal.fire({
        icon: "warning",
        title: "Same Email",
        text: "New email must be different from your current email.",
      });
      return;
    }

    setRequesting(true);
    try {
      const response = await api.post("/user/request-email-change", {
        newEmail: newEmail.toLowerCase(),
      });

      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: response.data.message || "A verification code has been sent to your new email address.",
        timer: 2000,
        showConfirmButton: false,
      });

      setOtpSent(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.response?.data?.message || "Failed to send verification code.",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Step 2: Verify OTP and complete email change
  const handleVerifyEmailChange = async () => {
    if (!otp) {
      Swal.fire({
        icon: "warning",
        title: "Missing OTP",
        text: "Please enter the verification code.",
      });
      return;
    }

    if (otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Verification code must be 6 digits.",
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post("/user/verify-email-change", {
        otp,
      });

      Swal.fire({
        icon: "success",
        title: "Email Changed",
        text: response.data.message || "Your email has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh user data to get updated email
      await dispatch(fetchCurrentUser());

      // Reset and close
      setNewEmail("");
      setOtp("");
      setOtpSent(false);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error.response?.data?.message || "Invalid or expired verification code.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="email-change-dialog-title"
    >
      <DialogTitle id="email-change-dialog-title">Change Email Address</DialogTitle>

      <DialogContent>
        {/* Current Email (Read-only) */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Current Email"
            value={currentEmail}
            disabled
            InputProps={{
              startAdornment: (
                <Mail size={18} className="mr-2 text-gray-400" />
              ),
            }}
          />
        </Box>

        {/* New Email Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="New Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={otpSent || requesting || verifying}
            placeholder="Enter your new email"
            InputProps={{
              startAdornment: (
                <Mail size={18} className="mr-2 text-gray-400" />
              ),
            }}
          />
        </Box>

        {/* Info Alert */}
        {!otpSent && (
          <Alert severity="info" sx={{ mb: 2 }}>
            A verification code will be sent to your new email address.
          </Alert>
        )}

        {/* OTP Field (shown after request) */}
        {otpSent && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Verification Code"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only digits
                if (value.length <= 6) {
                  setOtp(value);
                }
              }}
              disabled={verifying}
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6, style: { textAlign: "center", letterSpacing: "0.5em", fontSize: "1.2rem" } }}
              InputProps={{
                startAdornment: (
                  <Lock size={18} className="mr-2 text-gray-400" />
                ),
              }}
            />
            <Alert severity="success" sx={{ mt: 2 }}>
              Verification code sent to <strong>{newEmail}</strong>. Check your inbox.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={requesting || verifying}>
          Cancel
        </Button>

        {!otpSent ? (
          <Button
            onClick={handleRequestEmailChange}
            variant="contained"
            disabled={requesting}
            startIcon={requesting ? <CircularProgress size={16} /> : null}
          >
            {requesting ? "Sending..." : "Send Verification Code"}
          </Button>
        ) : (
          <Button
            onClick={handleVerifyEmailChange}
            variant="contained"
            color="success"
            disabled={verifying}
            startIcon={verifying ? <CircularProgress size={16} /> : null}
          >
            {verifying ? "Verifying..." : "Verify & Change Email"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
