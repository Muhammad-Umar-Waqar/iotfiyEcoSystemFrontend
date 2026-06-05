import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Email',
        text: 'Please enter your email address.',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });

      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: response.data.message || 'Password reset link has been sent to your email.',
        timer: 3000,
        showConfirmButton: true,
      });

      // Optionally redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: error.response?.data?.message || 'Failed to send reset email. Please try again.',
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
              <h3 className="text-slate-900 text-2xl font-semibold">Forgot Password</h3>
              <p className="text-slate-500 text-sm mt-2">
                Enter your email address and we'll send you a password reset link
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter your email"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute left-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0-10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?{' '}
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

export default ForgotPassword;
