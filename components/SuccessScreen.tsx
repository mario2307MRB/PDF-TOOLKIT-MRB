
import React from 'react';
import { RefreshIcon } from './icons';

interface SuccessScreenProps {
  onStartOver: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onStartOver }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white shadow-lg border-2 border-dashed border-green-300 min-h-[400px]">
      <div className="text-green-500 mb-4">
        <svg className="h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ¡PDF Guardado Exitosamente!
      </h2>
      <p className="text-gray-500 mb-6">Tu documento ha sido descargado.</p>
      <button
        onClick={onStartOver}
        className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <RefreshIcon className="h-5 w-5" />
        Comenzar de Nuevo
      </button>
    </div>
  );
};

export default SuccessScreen;
