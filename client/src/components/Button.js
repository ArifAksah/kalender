import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, size = 'md' }) => {
  const base = "font-medium rounded-lg transition-all inline-flex items-center justify-center gap-2 shadow-sm";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-200",
    secondary: "bg-white hover:bg-blue-50 text-blue-700 border border-blue-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "hover:bg-blue-50 text-blue-600 shadow-none"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
