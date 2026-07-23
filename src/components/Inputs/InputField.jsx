import React from 'react';

const InputField = ({
  label,
  id,
  name,
  type,
  value,
  onchange,
  placeholder,
  icon,
  disabled = false,
}) => {
  return (
    <div>
      <label htmlFor={id || name} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onchange}
          disabled={disabled}
          className={`w-full text-sm text-slate-800 bg-white pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[var(--eco-primary)]/30 focus:border-[var(--eco-primary)] ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
        />
        {icon ? (
          <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InputField;
