
import React from 'react';
import { RefreshIcon, ShareIcon } from './icons';
import type { GeneratedPdf } from '../App';

interface SuccessScreenProps {
  onStartOver: () => void;
  generatedPdf: GeneratedPdf | null;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onStartOver, generatedPdf }) => {
  const canShare = !!navigator.share;

  const handleShare = async () => {
    if (!generatedPdf || !navigator.share) {
      console.error("Web Share API not supported or no file to share.");
      return;
    }

    const file = new File([generatedPdf.blob], generatedPdf.filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Documento PDF',
          text: `Aquí está el documento PDF: ${generatedPdf.filename}`,
        });
      } catch (error) {
        console.log('Error al compartir', error);
      }
    } else {
      console.log("No se puede compartir este archivo.");
      // Opcional: mostrar un mensaje al usuario.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white shadow-lg border-2 border-dashed border-green-300 min-h-[400px]">
      <div className="text-green-500 mb-4">
        <svg className="h-16 w-16" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ¡PDF Guardado Exitosamente!
      </h2>
      <p className="text-gray-500 mb-6">Tu documento ha sido descargado.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <RefreshIcon className="h-5 w-5" />
          Comenzar de Nuevo
        </button>
        {canShare && generatedPdf && (
           <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <ShareIcon className="h-5 w-5" />
            Compartir
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessScreen;
