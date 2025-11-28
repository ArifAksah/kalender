import React from 'react';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      {message && <p className="mt-4 text-blue-600 text-sm">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
