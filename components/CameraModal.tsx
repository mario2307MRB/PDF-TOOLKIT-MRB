import React, { useState, useRef, useEffect, useCallback } from 'react';
import Spinner from './Spinner';

interface CameraModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setLoading(true);
    setError(null);
    setCapturedImage(null);
    setImageAspectRatio(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("La cámara no es compatible con este navegador.");
      setLoading(false);
      return;
    }

    try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissions.state === 'denied') {
            setError("El acceso a la cámara fue denegado. Por favor, habilítelo en la configuración de su navegador.");
            setLoading(false);
            return;
        }
    } catch (e) {
        console.warn("Permissions API no es soportada, procediendo con getUserMedia.", e);
    }
    
    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    let stream: MediaStream | null = null;
    for (const constraint of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        break; 
      } catch (err) {
        console.warn("No se pudo obtener stream con la restricción:", constraint, err);
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      setError("No se pudo acceder a la cámara. Por favor, compruebe los permisos y que no esté en uso por otra aplicación.");
      setLoading(false);
    }
  }, [stopCamera]);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && !loading) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        const img = new Image();
        img.onload = () => {
          setImageAspectRatio(img.width / img.height);
          setCapturedImage(dataUrl);
          stopCamera();
        };
        img.src = dataUrl;
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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 space-y-4 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold text-gray-800 flex-shrink-0">Tomar Foto</h2>
        
        <div 
          className="relative flex-grow min-h-0 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            aspectRatio: capturedImage && imageAspectRatio ? `${imageAspectRatio}` : 'auto'
          }}
        >
            {loading && <Spinner />}
            {error && !loading && <p className="text-red-500 px-4 text-center">{error}</p>}
            {!capturedImage ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  onCanPlay={() => setLoading(false)}
                  className={`w-full h-full object-cover ${loading || error ? 'hidden' : 'block'}`} 
                />
            ) : (
                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-end items-center gap-3 flex-shrink-0 border-t pt-4">
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