import React from 'react';

const EmptyState = ({ icon = '📭', title = 'No data', message = 'Nothing to show here yet.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
