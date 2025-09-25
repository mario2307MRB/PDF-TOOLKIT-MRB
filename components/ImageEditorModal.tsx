import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SparklesIcon, DocumentScannerIcon } from './icons';
import Spinner from './Spinner';

interface ImageEditorModalProps {
  imageDataUrl: string;
  onConfirm: (imageDataUrl: string) => void;
  onClose: () => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageDataUrl, onConfirm, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState(imageDataUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImageWithAI = async (aiPrompt: string) => {
    if (!aiPrompt) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("Error de configuración: La clave de API no fue encontrada. Por favor, configure la variable de entorno 'API_KEY'.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const mimeType = currentImage.substring(currentImage.indexOf(':') + 1, currentImage.indexOf(';'));
      const base64Data = currentImage.substring(currentImage.indexOf(',') + 1);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: aiPrompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      if (response.promptFeedback?.blockReason) {
        throw new Error(`Solicitud bloqueada por seguridad: ${response.promptFeedback.blockReason}. Intente con una imagen o prompt diferente.`);
      }

      const candidate = response.candidates?.[0];

      if (!candidate) {
        throw new Error("La IA no generó ninguna respuesta. Verifique su conexión o inténtelo de nuevo.");
      }
      
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`La IA finalizó inesperadamente por: ${candidate.finishReason}.`);
      }

      const imagePart = candidate.content?.parts.find(part => part.inlineData);
      
      if (imagePart?.inlineData) {
        const newBase64 = imagePart.inlineData.data;
        const newMimeType = imagePart.inlineData.mimeType;
        setCurrentImage(`data:${newMimeType};base64,${newBase64}`);
      } else {
        const textPart = candidate.content?.parts.find(part => part.text);
        if (textPart?.text) {
             throw new Error(`La IA respondió con texto en lugar de una imagen: "${textPart.text}"`);
        }
        throw new Error("La IA no devolvió una imagen. Intenta con otro prompt.");
      }

    } catch (err: any) {
      console.error("AI adjustment failed:", err);
      let errorMessage = "Ocurrió un error al ajustar la imagen. Inténtelo de nuevo.";
      if (err instanceof Error && err.message) {
        if (err.message.includes('API key')) {
            errorMessage = "Error de API: La clave proporcionada no es válida. Verifique su variable de entorno 'API_KEY'.";
        } else if (err.message.includes('400')) { // Bad request, maybe prompt issue
            errorMessage = "La IA no pudo procesar la solicitud. Intente con un prompt diferente o una imagen distinta.";
        } else {
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdjustWithPrompt = () => {
    processImageWithAI(prompt);
  };
  
  const handleEnhanceDocument = () => {
    const documentPrompt = "Actúa como un escáner de documentos: recorta la imagen para que se ajuste al documento, corrige la perspectiva, elimina las sombras y mejora el contraste del texto para una máxima claridad.";
    processImageWithAI(documentPrompt);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl p-6 space-y-4 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold text-gray-800 flex-shrink-0">Editar Imagen con IA</h2>
        
        <div className="relative flex-grow min-h-0 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
              <Spinner />
              <p className="mt-2 font-semibold text-gray-700">La IA está trabajando...</p>
            </div>
          )}
          <img src={currentImage} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex-shrink-0 space-y-3">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: añadir un sombrero, cambiar el fondo a una playa"
              className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
              aria-label="Prompt de ajuste de imagen"
            />
            <button
              onClick={handleAdjustWithPrompt}
              disabled={loading || !prompt}
              className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="h-5 w-5" />
              Ajustar
            </button>
          </div>
          <div className="border-t pt-3 mt-3 text-center">
             <button
              onClick={handleEnhanceDocument}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-primary text-primary font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-50 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <DocumentScannerIcon className="h-5 w-5" />
              Mejorar Documento
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 flex-shrink-0 border-t pt-4 mt-2">
          <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(currentImage)} className="py-2 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors">
            Añadir a PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;