
import React, { useState, useRef } from 'react';
import { FilePdfIcon, TrashIcon, DragHandleIcon, PlusIcon, RefreshIcon } from './icons';
import Spinner from './Spinner';

interface FilePreviewerProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onConfirm: (files: File[]) => void;
  onCancel: () => void;
  onAddFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

const FilePreviewer: React.FC<FilePreviewerProps> = ({ files, onFilesChange, onConfirm, onCancel, onAddFiles, loading }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.style.borderTop = 'none';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    e.currentTarget.style.borderTop = '2px solid #4f46e5';
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newFiles = [...files];
    const [removed] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, removed);
    onFilesChange(newFiles);
    setDraggedIndex(null);
  };
  
  const handleDeleteFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleAddFilesClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Prepara tus archivos ({files.length})
          </h2>
          <p className="text-gray-600">
            Arrastra los archivos para definir su orden en el documento final.
          </p>
        </div>
      </div>

      <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.lastModified}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${draggedIndex === index ? 'shadow-lg bg-indigo-50 scale-105' : 'bg-gray-50 shadow-sm hover:shadow-md'}`}
          >
            <button className="cursor-grab text-gray-400 hover:text-gray-600 mr-3 touch-none">
                <DragHandleIcon className="h-6 w-6" />
            </button>
            <FilePdfIcon className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button
              onClick={() => handleDeleteFile(index)}
              className="ml-4 text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors"
              aria-label={`Eliminar ${file.name}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
      
      <div className="border-t pt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={handleAddFilesClick}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Añadir más
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
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
        >
            <RefreshIcon className="h-5 w-5" />
            Cancelar
        </button>
        <button
            onClick={() => onConfirm(files)}
            disabled={loading || files.length === 0}
            className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed min-w-[200px]"
        >
            {loading ? <Spinner small /> : 'Confirmar y Procesar'}
        </button>
      </div>
    </div>
  );
};

export default FilePreviewer;
