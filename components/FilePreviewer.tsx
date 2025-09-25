
import React, { useState, useRef, useEffect } from 'react';
import { FilePdfIcon, TrashIcon, PlusIcon, RefreshIcon, ImageIcon, CameraIcon, UploadIcon } from './icons';
import Spinner from './Spinner';

interface SelectedFile {
  file: File;
  id: string;
}

interface FilePreviewerProps {
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  onConfirm: (files: File[]) => void;
  onCancel: () => void;
  onAddFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  onImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTakePhoto: () => void;
}

const FilePreviewer: React.FC<FilePreviewerProps> = ({ files, onFilesChange, onConfirm, onCancel, onAddFiles, loading, onImageFileChange, onTakePhoto }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const imageDropdownRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageDropdownRef.current && !imageDropdownRef.current.contains(event.target as Node)) {
        setShowImageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const target = e.currentTarget;
    // Simple visual feedback by scaling up the target
    target.style.transform = 'scale(1.05)';
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };
  
  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.transform = 'scale(1)';
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      return;
    };
    
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

  const handleAddImageClick = () => {
    imageInputRef.current?.click();
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-[200px] py-2">
        {files.map((selectedFile, index) => {
          const { file, id } = selectedFile;
          return (
            <div
              key={id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(index, e)}
              onDragLeave={handleDragLeave}
              onDragEnd={() => setDraggedIndex(null)}
              className={`relative group p-4 border rounded-lg flex flex-col items-center text-center cursor-grab transition-all duration-200 ${
                draggedIndex === index 
                  ? 'opacity-50 scale-105 shadow-2xl border-primary' 
                  : 'bg-gray-50 shadow-sm hover:shadow-md hover:border-primary'
              }`}
            >
              <button
                onClick={() => handleDeleteFile(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1.5 rounded-full transition-colors bg-white/50 opacity-0 group-hover:opacity-100"
                aria-label={`Eliminar ${file.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <FilePdfIcon className="h-16 w-16 text-red-500 mb-3 flex-shrink-0" />
              <div className="flex-grow min-w-0 w-full">
                <p className="font-semibold text-gray-800 truncate text-sm" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="border-t pt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={handleAddFilesClick}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Añadir más PDFs
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf"
          onChange={onAddFiles}
          className="hidden"
        />

        <div className="relative" ref={imageDropdownRef}>
          <button
            onClick={() => setShowImageDropdown(prev => !prev)}
            className="flex items-center gap-2 bg-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition-colors duration-200 h-full"
            aria-haspopup="true"
            aria-expanded={showImageDropdown}
          >
            <ImageIcon className="h-5 w-5" />
            Añadir Imagen
          </button>
          {showImageDropdown && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg z-20 border">
              <button
                onClick={() => { handleAddImageClick(); setShowImageDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <UploadIcon className="h-5 w-5" /> Subir Imagen
              </button>
              <button
                onClick={() => { onTakePhoto(); setShowImageDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <CameraIcon className="h-5 w-5" /> Tomar Foto
              </button>
            </div>
          )}
        </div>
        <input type="file" ref={imageInputRef} accept="image/png, image/jpeg" onChange={onImageFileChange} className="hidden" />

        <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
        >
            <RefreshIcon className="h-5 w-5" />
            Cancelar
        </button>
        <button
            onClick={() => onConfirm(files.map(f => f.file))}
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
