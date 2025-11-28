import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/70 backdrop-blur-sm border border-blue-100 rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-md transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
