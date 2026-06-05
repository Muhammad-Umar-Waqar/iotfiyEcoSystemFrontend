import React from 'react';

const InputField = ({ label, id, name, type, value, onchange, placeholder, icon }) => {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onchange}
          className="w-full text-sm text-slate-800 bg-white pl-10 pr-4 py-3 rounded-lg outline-blue-600"
          placeholder={placeholder}
        />
        <div className="absolute left-3 text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InputField;
