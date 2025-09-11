
import React from 'react';
import { usePdf } from './hooks/usePdf';
import FileUploader from './components/FileUploader';
import PdfEditor from './components/PdfEditor';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const {
    pages,
    loading,
    error,
    processingMessage,
    handleFileChange,
    deletePage,
    reorderPages,
    rotatePage,
    savePdf,
    reset,
  } = usePdf();

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
        {pages.length === 0 ? (
          <FileUploader onFileChange={handleFileChange} loading={loading} processingMessage={processingMessage} />
        ) : (
          <PdfEditor
            pages={pages}
            onDeletePage={deletePage}
            onReorderPages={reorderPages}
            onRotatePage={rotatePage}
            onSave={savePdf}
            onAddFiles={handleFileChange}
            onReset={reset}
            loading={loading}
          />
        )}
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
