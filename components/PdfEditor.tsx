
import React, { useState, useRef } from 'react';
import type { PdfPage, CompressionLevel } from '../types';
import PageThumbnail from './PageThumbnail';
import { SaveIcon, PlusIcon, RefreshIcon } from './icons';
import Spinner from './Spinner';

interface PdfEditorProps {
  pages: PdfPage[];
  onDeletePage: (pageId: string) => void;
  onReorderPages: (startIndex: number, endIndex: number) => void;
  onRotatePage: (pageId: string, direction: 'left' | 'right') => void;
  onSave: (compressionLevel: CompressionLevel) => void;
  onAddFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  loading: boolean;
  processingMessage?: string;
}

const PdfEditor: React.FC<PdfEditorProps> = ({
  pages,
  onDeletePage,
  onReorderPages,
  onRotatePage,
  onSave,
  onAddFiles,
  onReset,
  loading,
  processingMessage,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('high');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;

    if (e.clientX < midX) {
        target.style.borderLeft = '3px solid #4f46e5';
        target.style.borderRight = 'none';
    } else {
        target.style.borderLeft = 'none';
        target.style.borderRight = '3px solid #4f46e5';
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderLeft = 'none';
    e.currentTarget.style.borderRight = 'none';
  };

  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragLeave(e);
    if (draggedIndex === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const dropAfter = e.clientX > midX;

    let targetIndex = index;
    if (dropAfter && draggedIndex < index) {
      // no change needed
    } else if (!dropAfter && draggedIndex > index) {
      // no change needed
    } else if (dropAfter) {
      targetIndex = index + 1;
    }

    if (draggedIndex !== targetIndex) {
        const finalTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        onReorderPages(draggedIndex, finalTargetIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleAddFilesClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-lg">
          <Spinner />
          <p className="mt-4 text-lg font-semibold text-gray-700">{processingMessage || 'Procesando...'}</p>
          <p className="text-gray-500">Esto puede tardar unos momentos.</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4 sticky top-16 z-10">
        <h2 className="text-xl font-semibold text-gray-700">Editor de Páginas ({pages.length} páginas)</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddFilesClick}
            className="flex items-center gap-2 bg-white border border-primary text-primary font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            Añadir más archivos
          </button>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".pdf"
            onChange={onAddFiles}
            className="hidden"
          />
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
          >
            <RefreshIcon className="h-5 w-5" />
            Empezar de nuevo
          </button>
          
          <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-3 ml-1">
            <label htmlFor="compression-level" className="text-sm font-medium text-gray-600 whitespace-nowrap">Compresión:</label>
            <select
                id="compression-level"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(e.target.value as CompressionLevel)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                aria-label="Nivel de compresión del PDF"
            >
                <option value="low">Estándar (Más rápido)</option>
                <option value="high">Máxima (Mejor compresión)</option>
            </select>
          </div>

          <button
            onClick={() => onSave(compressionLevel)}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner small /> : <SaveIcon className="h-5 w-5" />}
            Guardar PDF
          </button>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="text-center text-gray-600 -mt-4">
          <p className="bg-indigo-50 text-indigo-700 rounded-lg py-2 px-4 inline-block shadow-sm">
            💡 Arrastra y suelta las páginas para cambiar su orden.
          </p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-inner min-h-[400px]">
        {pages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((page, index) => (
              <div 
                key={page.id} 
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(index, e)}
              >
                <PageThumbnail
                  page={page}
                  index={index}
                  onDelete={() => onDeletePage(page.id)}
                  onRotate={(direction) => onRotatePage(page.id, direction)}
                  onDragStart={() => handleDragStart(index)}
                  isDragging={draggedIndex === index}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Todas las páginas han sido eliminadas. Puedes añadir más archivos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
