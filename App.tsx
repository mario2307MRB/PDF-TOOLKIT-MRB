
import React, { useState } from 'react';
import { usePdf } from './hooks/usePdf';
import FileUploader from './components/FileUploader';
import PdfEditor from './components/PdfEditor';
import { LogoIcon } from './components/icons';
import FilePreviewer from './components/FilePreviewer';
import Spinner from './components/Spinner';

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
  } = usePdf();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleInitialFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(prev => {
        const existingFileNames = new Set(prev.map(f => f.name));
        const newUniqueFiles = Array.from(files).filter(f => !existingFileNames.has(f.name));
        return [...prev, ...newUniqueFiles];
      });
    }
    event.target.value = '';
  };

  const handleAddMoreToEditor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
    event.target.value = '';
  };

  const handleConfirmAndProcess = async (filesToProcess: File[]) => {
    await addFiles(filesToProcess);
    setSelectedFiles([]);
  };

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
  };

  const renderContent = () => {
    if (pages.length > 0) {
      return (
        <PdfEditor
          pages={pages}
          onDeletePage={deletePage}
          onReorderPages={reorderPages}
          onRotatePage={rotatePage}
          onSave={savePdf}
          onAddFiles={handleAddMoreToEditor}
          onReset={handleReset}
          loading={loading}
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
    return <FileUploader onFileChange={handleInitialFileSelect} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
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

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>
          Creado con ❤️ por un experto en React y Gemini.
        </p>
      </footer>
    </div>
  );
};

export default App;
