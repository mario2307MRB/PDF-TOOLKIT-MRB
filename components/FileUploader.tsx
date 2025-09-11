
import React from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white shadow-lg border-2 border-dashed border-gray-300 min-h-[400px]">
      <div className="text-primary mb-4">
        <UploadIcon className="h-16 w-16" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Arrastra y suelta tus archivos PDF aquí
      </h2>
      <p className="text-gray-500 mb-6">o haz clic para seleccionar archivos</p>
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-hover transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        Seleccionar Archivos
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".pdf"
        onChange={onFileChange}
        className="hidden"
      />
      <p className="mt-6 text-sm text-gray-500 max-w-md text-center">
        Tus archivos se procesan localmente en tu navegador. Ningún dato se sube a un servidor.
      </p>
    </div>
  );
};

export default FileUploader;
