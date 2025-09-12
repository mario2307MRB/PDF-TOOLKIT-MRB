
import React, { useState, useCallback, useEffect } from 'react';
import type { PdfPage, CompressionLevel } from '../types';

declare const pdfjsLib: any;
declare const PDFLib: any;

interface StoredPdfDoc {
  id: string;
  doc: any; // PDFLib.PDFDocument
}

export const usePdf = () => {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [storedDocs, setStoredDocs] = useState<StoredPdfDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  useEffect(() => {
    // Configure pdf.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    }
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);

    const newPages: PdfPage[] = [];
    const newDocs: StoredPdfDoc[] = [];

    try {
      for (const file of files) {
        setProcessingMessage(`Procesando ${file.name}...`);
        const docId = `${file.name}-${Date.now()}`;
        
        const arrayBuffer = await file.arrayBuffer();
        
        // Load with pdf-lib for later manipulation
        const pdfLibDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        newDocs.push({ id: docId, doc: pdfLibDoc });

        // Load with pdf.js for rendering thumbnails
        const pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        for (let j = 1; j <= pdfJsDoc.numPages; j++) {
          setProcessingMessage(`Renderizando página ${j} de ${pdfJsDoc.numPages} en ${file.name}`);
          const page = await pdfJsDoc.getPage(j);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            newPages.push({
              id: `${docId}-page-${j}`,
              docId: docId,
              originalPageIndex: j - 1,
              thumbnailUrl: canvas.toDataURL(),
              docName: file.name,
              pageNumberInDoc: j,
              rotation: 0,
            });
          }
        }
      }
      
      setPages(prev => [...prev, ...newPages]);
      setStoredDocs(prev => [...prev, ...newDocs]);

    } catch (e) {
      console.error(e);
      setError('Hubo un error al procesar los archivos PDF. Asegúrese de que sean válidos.');
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
  }, []);

  const reorderPages = useCallback((startIndex: number, endIndex: number) => {
    setPages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const rotatePage = useCallback((pageId: string, direction: 'left' | 'right') => {
    setPages(prev =>
      prev.map(p => {
        if (p.id === pageId) {
          let newRotation = p.rotation;
          if (direction === 'right') {
            newRotation = (p.rotation + 90) % 360;
          } else {
            newRotation = (p.rotation - 90 + 360) % 360;
          }
          return { ...p, rotation: newRotation };
        }
        return p;
      })
    );
  }, []);

  const savePdf = useCallback(async (compressionLevel: CompressionLevel = 'high'): Promise<boolean> => {
    if (pages.length === 0) {
      setError('No hay páginas para guardar.');
      return false;
    }
    setLoading(true);
    setError(null);
    setProcessingMessage('Creando el nuevo PDF...');
    
    try {
      const newPdfDoc = await PDFLib.PDFDocument.create();
      for (const page of pages) {
        const sourceDoc = storedDocs.find(d => d.id === page.docId)?.doc;
        if (sourceDoc) {
          const [copiedPage] = await newPdfDoc.copyPages(sourceDoc, [page.originalPageIndex]);
          if (page.rotation !== 0) {
            copiedPage.setRotation(PDFLib.degrees(page.rotation));
          }
          newPdfDoc.addPage(copiedPage);
        }
      }

      const saveOptions: { useObjectStreams?: boolean } = {};

      if (compressionLevel === 'high') {
        saveOptions.useObjectStreams = true;
      } else { // 'low'
        saveOptions.useObjectStreams = false;
      }

      const pdfBytes = await newPdfDoc.save(saveOptions);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `documento-unido-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;

    } catch (e) {
      console.error(e);
      setError('Hubo un error al guardar el PDF.');
      return false;
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  }, [pages, storedDocs]);

  const reset = useCallback(() => {
    setPages([]);
    setStoredDocs([]);
    setError(null);
    setLoading(false);
    setProcessingMessage('');
  }, []);

  return {
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
  };
};
