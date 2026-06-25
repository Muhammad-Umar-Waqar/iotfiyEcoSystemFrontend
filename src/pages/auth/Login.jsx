// import { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser, fetchCurrentUser } from '../../slices/authSlice';
// import api from '../../services/api';
// import Swal from 'sweetalert2';

// const Login = () => {
//   const [isRegisterMode, setIsRegisterMode] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { loading: authLoading } = useSelector((state) => state.auth);
//   const { pendingPlan, pendingCustomPlan } = useSelector((state) => state.subscription);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const toggleMode = () => {
//     setIsRegisterMode(!isRegisterMode);
//     setFormData({ name: '', email: '', password: '', confirmPassword: '' });
//     setShowPassword(false);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Fields',
//         text: 'Please fill in both email and password.',
//       });
//       return;
//     }

//     try {
//       // Step 1: Login to get token
//       const result = await dispatch(
//         loginUser({ email: formData.email, password: formData.password })
//       ).unwrap();

//       // Step 2: Fetch full user data from /auth/me (with populated venues)
//       await dispatch(fetchCurrentUser()).unwrap();

//       Swal.fire({
//         icon: 'success',
//         title: 'Login Successful',
//         text: `Welcome, ${result.user.name}!`,
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       // Check if there's a pending plan or custom plan
//       if (pendingPlan || pendingCustomPlan) {
//         navigate('/select-plan');
//         return;
//       }

//       // Check if redirected from select-plan
//       const from = location.state?.from;
//       if (from === '/select-plan') {
//         navigate('/select-plan');
//         return;
//       }

//       // Role-based routing
//       if (result.user.role === 'admin') {
//         navigate('/admin/management');
//       } else if (result.user.role === 'manager') {
//         navigate('/management');
//       } else {
//         navigate('/management');
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Login Failed',
//         text: error.message || 'Invalid credentials.',
//       });
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!formData.name || !formData.email || !formData.password) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Fields',
//         text: 'Please fill in all fields.',
//       });
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Password Mismatch',
//         text: 'Passwords do not match.',
//       });
//       return;
//     }

//     if (formData.password.length < 8) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Weak Password',
//         text: 'Password must be at least 8 characters long.',
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await api.post('/auth/register', {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Registration Successful',
//         text: response.data.message || 'Please verify OTP sent to your email.',
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       navigate('/verify-otp', { state: { email: formData.email } });
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Registration Failed',
//         text: error.response?.data?.message || 'Something went wrong.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = isRegisterMode ? handleRegister : handleLogin;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100  px-5 sm:px-16 md:px-24 lg:px-32">
//       <div className="grid md:grid-cols-2 rounded-4xl items-stretch max-w-7xl w-full bg-white shadow-lg overflow-hidden ">
//         {/* Left (Form) Section */}
//         <div className="p-12 w-full">
//           <form className="space-y-3 lg:p-3" onSubmit={onSubmit}>
//             <div className="mb-8 text-center md:text-left">
//               <img src="/logo.png" alt="IoTify Logo" className="h-10 mx-auto md:mx-0 mb-4" />
//               <h3 className="text-slate-900 text-2xl font-semibold">
//                 {isRegisterMode ? 'Create Account' : 'Log in to your Account'}
//               </h3>
//               <p className="text-slate-500 text-sm mt-2">
//                 {isRegisterMode
//                   ? 'Register as a Manager to get started'
//                   : 'Welcome Back! Select method to log in'}
//               </p>
//             </div>

//             {/* Name Field - Only for Register */}
//             {isRegisterMode && (
//               <div>
//                 <label htmlFor="name" className="sr-only">Full Name</label>
//                 <div className="relative flex items-center">
//                   <input
//                     id="name"
//                     name="name"
//                     type="text"
//                     value={formData.name}
//                     onChange={onChange}
//                     className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
//                     placeholder="Full Name"
//                   />
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="#bbb"
//                     stroke="#bbb"
//                     className="w-[18px] h-[18px] absolute left-4"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//                   </svg>
//                 </div>
//               </div>
//             )}

//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="sr-only">Email</label>
//               <div className="relative flex items-center">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={onChange}
//                   className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
//                   placeholder="Email"
//                 />
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="#bbb"
//                   stroke="#bbb"
//                   className="w-[18px] h-[18px] absolute left-4"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M12 12c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0-10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
//                 </svg>
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="sr-only">Password</label>
//               <div className="relative flex items-center">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={onChange}
//                   className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
//                   placeholder={isRegisterMode ? 'Password (min 8 characters)' : 'Password'}
//                 />
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="#bbb"
//                   stroke="#bbb"
//                   className="w-[18px] h-[18px] absolute left-4"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
//                 </svg>
//                 <svg
//                   onClick={() => setShowPassword(!showPassword)}
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="#bbb"
//                   stroke="#bbb"
//                   className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
//                   viewBox="0 0 128 128"
//                 >
//                   {showPassword ? (
//                     <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" />
//                   ) : (
//                     <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
//                   )}
//                 </svg>
//               </div>
//             </div>

//             {/* Confirm Password Field - Only for Register */}
//             {isRegisterMode && (
//               <div>
//                 <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
//                 <div className="relative flex items-center">
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={onChange}
//                     className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
//                     placeholder="Confirm Password"
//                   />
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="#bbb"
//                     stroke="#bbb"
//                     className="w-[18px] h-[18px] absolute left-4"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
//                   </svg>
//                 </div>
//               </div>
//             )}

//             {/* Forgot Password - Only for Login */}
//             {!isRegisterMode && (
//               <div className="flex flex-wrap items-center justify-end gap-4">
//                 <div className="text-sm">
//                   <NavLink to="/forgot-password" className="text-blue-600 hover:underline font-medium">
//                     Forgot Password
//                   </NavLink>
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="!mt-12">
//               <button
//                 type="submit"
//                 disabled={loading || authLoading}
//                 className={`w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white focus:outline-none ${
//                   (loading || authLoading) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
//                 }`}
//               >
//                 {loading || authLoading
//                   ? (isRegisterMode ? 'Registering...' : 'Logging in...')
//                   : (isRegisterMode ? 'Register' : 'Log In')}
//               </button>
//             </div>

//             {/* Toggle Link */}
//             <p className="text-center text-sm text-gray-600 mt-6">
//               {isRegisterMode ? (
//                 <>
//                   Have an Account?{' '}
//                   <button
//                     type="button"
//                     onClick={toggleMode}
//                     className="text-blue-600 hover:underline font-medium"
//                   >
//                     Sign In
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Don't have an account?{' '}
//                   <button
//                     type="button"
//                     onClick={toggleMode}
//                     className="text-blue-600 hover:underline font-medium"
//                   >
//                     Register Now
//                   </button>
//                 </>
//               )}
//             </p>
//           </form>
//         </div>

//         {/* Right (Images) Section */}
//         <div
//           style={{ backgroundColor: '#EAEAEA' }}
//           className="h-full hidden md:flex flex-col items-center justify-between p-12"
//         >
//           <div className="flex-grow flex items-center justify-center p-4">
//             <img
//               src="/login-image.png"
//               className="w-full h-auto object-contain"
//               alt="IoT HVAC Control"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };







// export default Login;
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchCurrentUser } from '../../slices/authSlice';
import api from '../../services/api';
import Swal from 'sweetalert2';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { pendingPlan, pendingCustomPlan } = useSelector((state) => state.subscription);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in both email and password.',
      });
      return;
    }

    try {
      setLoading(true);
      // Step 1: Login to get token
      const result = await dispatch(
        loginUser({ email: formData.email, password: formData.password })
      ).unwrap();

      // Step 2: Fetch full user data from /auth/me (with populated venues)
      await dispatch(fetchCurrentUser()).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome, ${result.user.name}!`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Check if there's a pending plan or custom plan
      if (pendingPlan || pendingCustomPlan) {
        navigate('/select-plan');
        return;
      }

      // Check if redirected from select-plan
      const from = location.state?.from;
      if (from === '/select-plan') {
        navigate('/select-plan');
        return;
      }

      // Role-based routing
      if (result.user.role === 'admin') {
        navigate('/admin/management');
      } else if (result.user.role === 'manager') {
        navigate('/management');
      } else {
        navigate('/management');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
      });
      return;
    }

    if (formData.password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: response.data.message || 'Please verify OTP sent to your email.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = isRegisterMode ? handleRegister : handleLogin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100  px-5 sm:px-16 ">
      <div className="min-h-[60vh] grid md:grid-cols-2 rounded-4xl  place-items-center max-w-6xl w-full bg-white shadow-lg overflow-hidden ">
        {/* Left (Form) Section */}
        <div className="p-10 lg:p-18 w-full">
          <form className="space-y-3 lg:p-3" onSubmit={onSubmit}>
            <div className="mb-8 text-center md:text-left">
              <img src="/logo.png" alt="IoTify Logo" className="h-10 mx-auto md:mx-0 mb-4" />
              <h3 className="text-slate-900 text-2xl font-semibold">
                {isRegisterMode ? 'Create Account' : 'Log in to your Account'}
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                {isRegisterMode
                  ? 'Register as a Manager to get started'
                  : 'Welcome Back! Select method to log in'}
              </p>
            </div>

            {/* Name Field - Only for Register */}
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <div className="relative flex items-center">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
                    placeholder="Full Name"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-[18px] h-[18px] absolute left-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
                  placeholder="Email"
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={onChange}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder={isRegisterMode ? 'Password (min 8 characters)' : 'Password'}
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

            {/* Confirm Password Field - Only for Register */}
            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
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
                </div>
              </div>
            )}

            {/* Forgot Password - Only for Login */}
            {!isRegisterMode && (
              <div className="flex flex-wrap items-center justify-end gap-4">
                <div className="text-sm">
                  <NavLink to="/forgot-password" className="text-blue-600 hover:underline font-medium">
                    Forgot Password
                  </NavLink>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="!mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white focus:outline-none ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {loading
                  ? (isRegisterMode ? 'Registering...' : 'Logging in...')
                  : (isRegisterMode ? 'Register' : 'Log In')}
              </button>
            </div>

            {/* Toggle Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              {isRegisterMode ? (
                <>
                  Have an Account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Register Now
                  </button>
                </>
              )}
            </p>
          </form>
        </div>

        {/* Right (Images) Section */}
        <div
          style={{ backgroundColor: '#EAEAEA' }}
          className="h-full hidden md:flex flex-col items-center justify-between "
        >
          <div className="flex-grow flex items-center justify-center ">
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

export default Login;
