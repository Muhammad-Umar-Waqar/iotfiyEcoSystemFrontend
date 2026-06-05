import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields.',
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });

      Swal.fire({
        icon: 'success',
        title: 'Password Reset',
        text: response.data.message || 'Your password has been reset successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.response?.data?.message || 'Invalid or expired reset link.',
      });
    } finally {
      setLoading(false);
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
              <h3 className="text-slate-900 text-2xl font-semibold">Reset Your Password</h3>
              <p className="text-slate-500 text-sm mt-2">
                Enter your new password below
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="New Password (min 8 characters)"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute left-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
                </svg>
                <svg
                  onClick={() => setShowPassword(!showPassword)}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                  viewBox="0 0 128 128"
                >
                  {showPassword ? (
                    <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" />
                  ) : (
                    <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
                  )}
                </svg>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Confirm Password"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute left-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
                </svg>
                <svg
                  onClick={() => setShowConfirm(!showConfirm)}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                  viewBox="0 0 128 128"
                >
                  {showConfirm ? (
                    <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" />
                  ) : (
                    <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
                  )}
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <div className="!mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white focus:outline-none ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600 mt-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </form>
        </div>

        {/* Right (Images) Section */}
        <div
          style={{ backgroundColor: '#EAEAEA' }}
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

export default ResetPassword;
