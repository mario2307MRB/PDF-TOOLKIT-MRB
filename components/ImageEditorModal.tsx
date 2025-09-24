
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SparklesIcon } from './icons';
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

  const handleAdjustWithAI = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const mimeType = currentImage.substring(currentImage.indexOf(':') + 1, currentImage.indexOf(';'));
      const base64Data = currentImage.substring(currentImage.indexOf(',') + 1);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      if (imagePart?.inlineData) {
        const newBase64 = imagePart.inlineData.data;
        const newMimeType = imagePart.inlineData.mimeType;
        setCurrentImage(`data:${newMimeType};base64,${newBase64}`);
      } else {
        throw new Error("La IA no devolvió una imagen. Intenta con otro prompt.");
      }

    } catch (err: any) {
      console.error("AI adjustment failed:", err);
      setError(err.message || "Ocurrió un error al ajustar la imagen.");
    } finally {
      setLoading(false);
    }
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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
              onClick={handleAdjustWithAI}
              disabled={loading || !prompt}
              className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="h-5 w-5" />
              Ajustar
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 flex-shrink-0">
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
