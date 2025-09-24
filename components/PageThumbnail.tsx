
import React from 'react';
import type { PdfPage } from '../types';
import { TrashIcon, RotateLeftIcon, RotateRightIcon } from './icons';

interface PageThumbnailProps {
  page: PdfPage;
  index: number;
  onDelete: () => void;
  isDragging: boolean;
  onRotate: (direction: 'left' | 'right') => void;
}

const PageThumbnail: React.FC<PageThumbnailProps> = ({ page, index, onDelete, isDragging, onRotate }) => {
  const handleRotate = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation(); // Evita que comience el arrastre
    e.preventDefault();
    onRotate(direction);
  };

  const rotationClasses: { [key: number]: string } = {
    0: 'rotate-0',
    90: 'rotate-90',
    180: 'rotate-180',
    270: 'rotate-[270deg]',
  };
  
  return (
    <div
      className={`relative group border-2 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-grab ${
        isDragging ? 'opacity-50 border-primary scale-105' : 'border-transparent'
      }`}
    >
      <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
        <img 
          src={page.thumbnailUrl} 
          alt={`Página ${index + 1}`} 
          className={`transition-transform duration-300 ease-in-out max-w-full max-h-full ${rotationClasses[page.rotation] || 'rotate-0'}`} 
        />
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors duration-300 flex flex-col justify-between p-2 text-white">
        {/* Fila superior */}
        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs font-bold bg-black bg-opacity-50 rounded px-1.5 py-0.5 truncate max-w-[calc(100%-3rem)]">{page.docName} (p.{page.pageNumberInDoc})</p>
          <button
            onClick={onDelete}
            className="bg-red-500 rounded-full p-1.5 shadow-lg hover:bg-red-600 transform hover:scale-110 flex-shrink-0"
            aria-label="Eliminar página"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        {/* Fila inferior */}
        <div className="flex justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1">
          <button
            onClick={(e) => handleRotate(e, 'left')}
            className="bg-gray-700 rounded-full p-1.5 shadow-lg hover:bg-gray-800 transform hover:scale-110"
            aria-label="Girar a la izquierda"
          >
            <RotateLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => handleRotate(e, 'right')}
            className="bg-gray-700 rounded-full p-1.5 shadow-lg hover:bg-gray-800 transform hover:scale-110"
            aria-label="Girar a la derecha"
          >
            <RotateRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

       <div className="absolute bottom-1 left-2 bg-gray-800 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
        {index + 1}
      </div>
    </div>
  );
};

export default PageThumbnail;
