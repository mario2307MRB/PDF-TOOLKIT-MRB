
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Spinner from './Spinner';

interface CameraModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Por favor, compruebe los permisos.");
    } finally {
        setLoading(false);
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Tomar Foto</h2>
        
        <div className="relative aspect-video bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            {loading && <Spinner />}
            {error && <p className="text-red-500 px-4 text-center">{error}</p>}
            {!capturedImage ? (
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${loading || error ? 'hidden' : 'block'}`} />
            ) : (
                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-end items-center gap-3">
          <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          {capturedImage ? (
            <>
              <button onClick={handleRetake} className="py-2 px-4 rounded-lg bg-secondary text-white font-semibold hover:opacity-90 transition-opacity">
                Tomar de Nuevo
              </button>
              <button onClick={handleConfirm} className="py-2 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors">
                Usar Foto
              </button>
            </>
          ) : (
            <button onClick={handleCapture} disabled={loading || !!error} className="py-2 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:bg-gray-400">
              Capturar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
