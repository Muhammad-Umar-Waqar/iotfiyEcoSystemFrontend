import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ label, id, name, value, onchange, placeholder, icon }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onchange}
          className="w-full text-sm text-slate-800 bg-white pl-10 pr-10 py-3 rounded-lg outline-blue-600"
          placeholder={placeholder}
        />
        {/* Left-side icon (e.g., Lock) */}
        <div className="absolute left-3 text-gray-400 ">
          {icon}
        </div>
        {/* Toggle eye icon */}
        <div
          className="absolute right-4 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      </div>
    </div>
  );
};

export default PasswordField;
