import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams(); // Token from URL (sub-user flow)
  const email = location.state?.email;

  // Determine if this is sub-user setup flow or regular registration
  const isSubUserFlow = !!token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Please enter a valid 6-digit OTP.',
      });
      return;
    }

    setLoading(true);
    try {
      let response;

      if (isSubUserFlow) {
        // Sub-user setup flow - use token-based endpoint
        const res = await fetch(`${BASE}/auth/verify-otp/${encodeURIComponent(token)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Verification failed");
        response = { data };
      } else {
        // Regular registration flow
        response = await api.post('/auth/verify-otp', { otp });
      }

      Swal.fire({
        icon: 'success',
        title: 'Verification Successful',
        text: response.data.message || 'Your account has been verified.',
        timer: 2000,
        showConfirmButton: false,
      });

      // Navigate based on flow
      if (isSubUserFlow) {
        navigate('/login'); // Sub-user can now login
      } else {
        navigate('/select-plan'); // Regular user goes to plan selection
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: error.response?.data?.message || error.message || 'Invalid or expired OTP.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSubUserFlow) {
      // For sub-user flow, they need to contact manager
      Swal.fire({
        icon: "info",
        title: "Resend OTP",
        text: "Please contact your manager to resend the setup link.",
      });
      return;
    }

    // Regular registration flow resend
    try {
      await api.post('/auth/resend-otp', { email });
      Swal.fire({
        icon: 'success',
        title: 'OTP Resent',
        text: 'A new OTP has been sent to your email.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to resend OTP.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-5 sm:px-16 md:px-24 lg:px-32">
      <div className="grid md:grid-cols-2 rounded-4xl items-stretch max-w-7xl w-full bg-white shadow-lg overflow-hidden">
        {/* Left (Form) Section */}
        <div className="p-12 w-full">
          <form className="space-y-3 lg:p-3" onSubmit={handleSubmit}>
            <div className="mb-8 text-center md:text-left">
              <img src="/logo.png" alt="Logo" className="h-10 mx-auto md:mx-0 mb-4" />
              <h3 className="text-slate-900 text-2xl font-semibold">Verify Your Account</h3>
              <p className="text-slate-500 text-sm mt-2">
                {email
                  ? `Enter the 6-digit OTP sent to ${email}`
                  : "Enter the 6-digit OTP sent to your email"
                }
              </p>
            </div>

            {/* OTP Field */}
            <div>
              <label htmlFor="otp" className="sr-only">OTP Code</label>
              <div className="relative flex items-center">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600 text-center tracking-widest text-lg font-semibold"
                  placeholder="000000"
                  maxLength={6}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute left-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>

            {/* Resend OTP Link */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Didn't receive the code?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="!mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white focus:outline-none ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600 mt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </form>
        </div>

        {/* Right (Images) Section */}
        <div
          style={{ backgroundColor: "#EAEAEA" }}
          className="h-full hidden md:flex flex-col items-center justify-between p-12"
        >
          <div className="flex-grow flex items-center justify-center p-4">
            <img
              src="/login-image.png"
              className="w-full h-auto object-contain"
              alt="IoT HVAC Control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
