
import React from 'react';

interface SpinnerProps {
  small?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ small = false }) => {
  const sizeClasses = small ? 'h-5 w-5' : 'h-12 w-12';
  const borderClasses = small ? 'border-2' : 'border-4';

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses} ${borderClasses} border-primary border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Cargando..."
      ></div>
    </div>
  );
};

export default Spinner;
