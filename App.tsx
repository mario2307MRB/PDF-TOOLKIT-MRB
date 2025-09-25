
import React, { useState } from 'react';
import { usePdf } from './hooks/usePdf';
import FileUploader from './components/FileUploader';
import PdfEditor from './components/PdfEditor';
import { LogoIcon } from './components/icons';
import FilePreviewer from './components/FilePreviewer';
import Spinner from './components/Spinner';
import SuccessScreen from './components/SuccessScreen';
import type { CompressionLevel } from './types';
import CameraModal from './components/CameraModal';
import ImageEditorModal from './components/ImageEditorModal';

interface SelectedFile {
  file: File;
  id: string;
}

export interface GeneratedPdf {
  blob: Blob;
  filename: string;
}

const App: React.FC = () => {
  const {
    pages,
    loading,
    error,
    processingMessage,
    addFiles,
    deletePage,
    reorderPages,
    rotatePage,
    savePdf,
    reset,
    addImageAsPage,
  } = usePdf();

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);
  const [generatedPdf, setGeneratedPdf] = useState<GeneratedPdf | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showImageEditorModal, setShowImageEditorModal] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);

  const handleInitialFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFilesWithId = Array.from(files).map(file => ({
        file,
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`
      }));
      setSelectedFiles(prev => [...prev, ...newFilesWithId]);
    }
    event.target.value = '';
  };
  
  const handleImageFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToEdit(e.target?.result as string);
        setShowImageEditorModal(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset input
  };
  
  const handlePhotoCaptured = (imageDataUrl: string) => {
    setShowCameraModal(false);
    setImageToEdit(imageDataUrl);
    setShowImageEditorModal(true);
  };
  
  const handleImageConfirmed = async (imageDataUrl: string) => {
    setShowImageEditorModal(false);
    setImageToEdit(null);
  
    // If there are files selected for preview, process them first.
    if (selectedFiles.length > 0) {
      // Process the selected PDF files
      await addFiles(selectedFiles.map(sf => sf.file));
      // Clear the selection so we don't process them again
      setSelectedFiles([]);
    }
    
    // Now process the new image and add it as a page
    await addImageAsPage(imageDataUrl);
  };

  const handleAddMoreToEditor = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await addFiles(Array.from(files));
    }
    event.target.value = '';
  };

  const handleConfirmAndProcess = async (filesToProcess: File[]) => {
    await addFiles(filesToProcess);
    setSelectedFiles([]);
  };

  const handleSavePdf = async (compressionLevel: CompressionLevel) => {
    const result = await savePdf(compressionLevel);
    if (result) {
      // Trigger download
      const link = document.createElement('a');
      const url = URL.createObjectURL(result.blob);
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Store file for sharing
      setGeneratedPdf(result);
      setIsSaveSuccess(true);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
    setIsSaveSuccess(false);
    setGeneratedPdf(null);
  };

  const renderContent = () => {
    if (isSaveSuccess) {
      return <SuccessScreen onStartOver={handleReset} generatedPdf={generatedPdf} />;
    }
    if (pages.length > 0) {
      return (
        <PdfEditor
          pages={pages}
          onDeletePage={deletePage}
          onReorderPages={reorderPages}
          onRotatePage={rotatePage}
          onSave={handleSavePdf}
          onAddFiles={handleAddMoreToEditor}
          onImageFileChange={handleImageFileSelected}
          onTakePhoto={() => setShowCameraModal(true)}
          onReset={handleReset}
          loading={loading}
          processingMessage={processingMessage}
        />
      );
    }
    if (selectedFiles.length > 0) {
      return (
        <FilePreviewer
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          onConfirm={handleConfirmAndProcess}
          onCancel={() => setSelectedFiles([])}
          onAddFiles={handleInitialFileSelect}
          loading={loading}
          onImageFileChange={handleImageFileSelected}
          onTakePhoto={() => setShowCameraModal(true)}
        />
      );
    }
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white shadow-lg border-2 border-dashed border-gray-300 min-h-[400px]">
          <Spinner />
          <p className="mt-4 text-lg font-semibold text-gray-700">{processingMessage || 'Procesando archivos...'}</p>
          <p className="text-gray-500">Esto puede tardar unos momentos.</p>
        </div>
      );
    }
    return <FileUploader 
              onFileChange={handleInitialFileSelect}
              onImageFileChange={handleImageFileSelected}
              onTakePhoto={() => setShowCameraModal(true)}
           />;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 antialiased dark:bg-dark">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-light tracking-tight">
                PDF Toolkit Pro
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
        {error && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm space-y-1">
        <p className="font-bold text-gray-700 dark:text-gray-300">
          Creado Por Mario Reyes B. Copiapó Atacama Chile 2025
        </p>
      </footer>
      
      {showCameraModal && (
        <CameraModal
          onCapture={handlePhotoCaptured}
          onClose={() => setShowCameraModal(false)}
        />
      )}
      {showImageEditorModal && imageToEdit && (
        <ImageEditorModal
          imageDataUrl={imageToEdit}
          onConfirm={handleImageConfirmed}
          onClose={() => {
            setShowImageEditorModal(false);
            setImageToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
