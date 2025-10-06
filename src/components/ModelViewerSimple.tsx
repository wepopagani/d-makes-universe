import React, { useRef, useEffect, useState } from 'react';
// Non facciamo l'import dinamico ma usiamo lo script nel file HTML

interface ModelViewerSimpleProps {
  file?: File | null;
  fileType?: string;
  url?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  onProgress?: (progress: number) => void;
  onDimensions?: (dimensions: { x: number; y: number; z: number }) => void;
}

const ModelViewerSimple: React.FC<ModelViewerSimpleProps> = ({ 
  file, 
  fileType, 
  url, 
  onError,
  onLoad,
  onProgress
}) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const modelRef = useRef<HTMLElement | null>(null);

  // Imposta handlers per eventi di model-viewer
  useEffect(() => {
    const modelViewerElement = modelRef.current;
    if (!modelViewerElement) return;

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = (event: any) => {
      setIsLoading(false);
      const errorMessage = event.detail?.sourceError?.message || 'Errore nel caricamento del modello 3D';
      setLoadError(errorMessage);
      onError?.(new Error(errorMessage));
    };

    const handleProgress = (event: any) => {
      if (event.detail && event.detail.totalProgress !== undefined) {
        onProgress?.(event.detail.totalProgress * 100);
      }
    };

    modelViewerElement.addEventListener('load', handleLoad);
    modelViewerElement.addEventListener('error', handleError);
    modelViewerElement.addEventListener('progress', handleProgress);

    return () => {
      modelViewerElement.removeEventListener('load', handleLoad);
      modelViewerElement.removeEventListener('error', handleError);
      modelViewerElement.removeEventListener('progress', handleProgress);
    };
  }, [modelRef, onLoad, onError, onProgress]);

  // Gestisce il file caricato dall'utente
  useEffect(() => {
    if (file) {
      setIsLoading(true);
      setLoadError(null);
      
      // Revoca l'URL precedente se esiste
      if (modelUrl && modelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
      
      // Crea un nuovo URL per il file
      const newUrl = URL.createObjectURL(file);
      setModelUrl(newUrl);
      
      // Aggiungi il gestore di pulizia per revocare l'URL quando il componente viene smontato
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else if (url) {
      setIsLoading(true);
      setLoadError(null);
      
      // Aggiungi un parametro di cache busting all'URL
      const urlWithCache = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      setModelUrl(urlWithCache);
    } else {
      setModelUrl(null);
    }
  }, [file, url]);
  
  // Se c'è un errore di caricamento
  if (loadError) {
    return (
      <div className="w-full h-full bg-red-50 flex items-center justify-center">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-sm text-red-600">
            {loadError}
          </p>
        </div>
      </div>
    );
  }
  
  // Se non c'è un modello da visualizzare
  if (!file && !url) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Nessun file selezionato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-700">Caricamento del modello 3D...</p>
          </div>
        </div>
      )}
      <model-viewer
        ref={modelRef}
        src={modelUrl || ''}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        exposure="0.5"
        environment-image="neutral"
        alt="Modello 3D"
        loading="lazy"
        reveal="auto"
        interaction-prompt="auto"
        camera-orbit="0deg 75deg 2m"
        style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }}
      >
        <div slot="poster" className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Caricamento del modello 3D...</p>
          </div>
        </div>
        <div slot="progress-bar" className="w-full h-1 bg-gray-200 absolute bottom-0 left-0">
          <div id="progress" className="h-full bg-blue-500" style={{ width: '0%' }}></div>
        </div>
      </model-viewer>
    </div>
  );
};

export default ModelViewerSimple;
