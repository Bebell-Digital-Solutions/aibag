
import React from 'react';

const LoadingIndicator: React.FC = () => (
  <div className="flex flex-col gap-2 w-full">
    <div className="loading-bar-anim h-3 rounded-sm w-full"></div>
    <div className="loading-bar-anim h-3 rounded-sm w-4/5"></div>
    <div className="loading-bar-anim h-3 rounded-sm w-3/5"></div>
  </div>
);

export default LoadingIndicator;
