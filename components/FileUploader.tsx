
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, ImageIcon, CameraIcon } from './icons';

interface FileUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTakePhoto: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, onImageFileChange, onTakePhoto }) => {
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

  const handleAddImageClick = () => {
    imageInputRef.current?.click();
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white shadow-lg border-2 border-dashed border-gray-300 min-h-[400px]">
      <div className="text-primary mb-4">
        <UploadIcon className="h-16 w-16" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Arrastra y suelta tus archivos PDF aquí
      </h2>
      <p className="text-gray-500 mb-6">o haz clic para seleccionar archivos</p>
      <div className="flex items-center gap-4">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Seleccionar PDFs
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="relative" ref={imageDropdownRef}>
            <button
              onClick={() => setShowImageDropdown(prev => !prev)}
              className="cursor-pointer bg-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 h-full"
              aria-haspopup="true"
              aria-expanded={showImageDropdown}
            >
              <ImageIcon className="h-5 w-5" />
              Añadir Imagen
            </button>
            {showImageDropdown && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
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

      </div>
      <p className="mt-6 text-sm text-gray-500 max-w-md text-center">
        Tus archivos se procesan localmente en tu navegador. Ningún dato se sube a un servidor.
      </p>
    </div>
  );
};

export default FileUploader;
