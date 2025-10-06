import { useRef, Suspense, useState, useEffect } from 'react';
import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Html } from '@react-three/drei';
import { analyzeGeometry, ModelAnalysis } from '../utils/modelAnalysis';
import { Object3D } from 'three';
import THREE, { STLLoader, OBJLoader } from '../utils/threeInstance';

interface ModelViewerProps {
  file: File | null;
  fileType: string;
  onAnalysis?: (analysis: ModelAnalysis) => void;
  uploadPrompt?: string;
  onDimensions?: (dims: { x: number; y: number; z: number }) => void;
  onOrientationChange?: (rotation: { x: number; y: number; z: number }) => void;
  scaleFactor?: number;
  url?: string;
}

// Use window.matchMedia instead of navigator.userAgent
const isMobile = () => {
  return window.matchMedia('(max-width: 768px)').matches;
};

// Aggiungi questa funzione per calcolare la posizione ottimale
const calculateOptimalRotation = (geometry: THREE.BufferGeometry | THREE.Group) => {
  let bbox: THREE.Box3;
  
  if (geometry instanceof THREE.BufferGeometry) {
    bbox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position as THREE.BufferAttribute);
  } else {
    bbox = new THREE.Box3().setFromObject(geometry);
  }

  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Calcola il rapporto tra le dimensioni
  const ratio = {
    xy: size.x / size.y,
    xz: size.x / size.z,
    yz: size.y / size.z
  };

  // Determina la rotazione ottimale
  const rotation = new THREE.Vector3(0, 0, 0);

  // Se l'oggetto è più alto che largo, ruotalo di 90 gradi
  if (size.z > size.x && size.z > size.y) {
    rotation.x = Math.PI / 2;
  }
  // Se l'oggetto è più largo che alto, ruotalo di 90 gradi
  else if (size.x > size.z && size.x > size.y) {
    rotation.z = Math.PI / 2;
  }

  // Calcola il centro
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  return {
    rotation,
    center,
    size
  };
};

interface PlacementPlane {
  normal: THREE.Vector3;
  area: number;
  rotation: THREE.Euler;
  position: THREE.Vector3;
  dimensions: THREE.Vector2;
}

function getLargeFlatFaces(geometry: THREE.BufferGeometry, thresholdArea = 100): PlacementPlane[] {
  const position = geometry.attributes.position;
  const index = geometry.index;
  const faces: PlacementPlane[] = [];

  if (!index) return faces;

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    const va = new THREE.Vector3().fromBufferAttribute(position, a);
    const vb = new THREE.Vector3().fromBufferAttribute(position, b);
    const vc = new THREE.Vector3().fromBufferAttribute(position, c);

    const ab = new THREE.Vector3().subVectors(vb, va);
    const ac = new THREE.Vector3().subVectors(vc, va);
    const normal = new THREE.Vector3().crossVectors(ab, ac).normalize();

    const area = 0.5 * ab.cross(ac).length();
    if (area > thresholdArea) {
      const centroid = new THREE.Vector3().add(va).add(vb).add(vc).divideScalar(3);

      faces.push({
        normal,
        area,
        position: centroid,
        rotation: new THREE.Euler(),
        dimensions: new THREE.Vector2(Math.sqrt(area), Math.sqrt(area)),
      });
    }
  }
  return faces;
}

function Model({ file, fileType, onDimensions, scaleFactor = 1, url }: ModelViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faces, setFaces] = useState<PlacementPlane[]>([]);
  const modelRef = useRef<THREE.Mesh | THREE.Group>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-rotation for better user experience
  useFrame((state) => {
    if (modelRef.current) {
      // Rotazione lenta e continua sull'asse Y per mostrare il modello
      modelRef.current.rotation.y += 0.003;
    }
  });

  const orientModelToFace = (face: PlacementPlane) => {
    if (!modelRef.current) return;

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      face.normal,
      new THREE.Vector3(0, 1, 0)
    );

    modelRef.current.setRotationFromQuaternion(quaternion);

    // Aggiorna la posizione per mantenere il modello sul piano
    const bbox = new THREE.Box3().setFromObject(modelRef.current);
    const minY = bbox.min.y;
    modelRef.current.position.y -= minY;
  };

  useEffect(() => {
    if (!file && !url) return;

    setIsLoading(true);
    setError(null);

    const loadModel = () => {
      // Determine loader based on file extension
      let loader;
      const lowercaseFileType = fileType.toLowerCase();
      
      if (lowercaseFileType === 'stl') {
        loader = new STLLoader();
      } else if (lowercaseFileType === 'obj') {
        loader = new OBJLoader();
      } else {
        console.error(`Unsupported file type: ${fileType}`);
        setError(`Tipo di file non supportato: ${fileType}`);
        setIsLoading(false);
        return;
      }
      
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            if (fileType.toLowerCase() === 'stl') {
              const result = (loader as STLLoader).parse(reader.result as ArrayBuffer);
              handleStlResult(result);
            } else {
              const result = (loader as OBJLoader).parse(reader.result as string);
              handleObjResult(result);
            }
          } catch (err) {
            console.error('Error processing model:', err);
            setError('Errore nel processamento del modello 3D');
          } finally {
            setIsLoading(false);
          }
        };

        reader.onerror = () => {
          console.error('Error reading file');
          setError('Errore nella lettura del file');
          setIsLoading(false);
        };

        if (fileType.toLowerCase() === 'stl') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      } else if (url) {
        try {
          // Add timeout to catch stalled requests
          const timeoutId = setTimeout(() => {
            if (isLoading) {
              setError('Timeout nel caricamento del modello');
              setIsLoading(false);
            }
          }, 30000); // 30 second timeout

          // Funzione per creare un proxy per aggirare CORS se necessario
          const createCorsProxyUrl = (originalUrl: string): string => {
            // Approccio semplificato: usa direttamente la URL di base
            if (originalUrl.includes('firebasestorage.googleapis.com')) {
              // Crea una URL pulita senza parametri aggiuntivi
              const baseUrl = originalUrl.split('?')[0];
              // Aggiungi solo il parametro essenziale per il download e un timestamp per evitare cache
              return `${baseUrl}?alt=media&t=${Date.now()}`;
            }
            
            return originalUrl;
          };
          
          const loadWithFetch = async () => {
            try {
              // URL di base senza parametri aggiuntivi
              const baseUrl = url.split('?')[0];
              const simpleUrl = `${baseUrl}?alt=media&t=${Date.now()}`;
              
              console.log("Attempting to fetch 3D model with simplified URL:", simpleUrl);
              
              try {
                // Approccio 1: fetch semplice senza headers personalizzati
                const response = await fetch(simpleUrl);
                
                if (response.ok) {
                  console.log("Simple fetch succeeded!");
                  await handleSuccessfulResponse(response);
                  clearTimeout(timeoutId);
                  return;
                }
                
                console.log("Simple fetch failed with status:", response.status);
                
                // Approccio 2: prova con un modo alternativo
                console.log("Trying alternative method...");
                
                // Crea un tag <a> che apre l'URL in un nuovo tab (per verificare se è accessibile)
                const linkElement = document.createElement('a');
                linkElement.href = simpleUrl;
                linkElement.target = '_blank';
                linkElement.style.display = 'none';
                document.body.appendChild(linkElement);
                
                // Mostra il messaggio di errore ma con link alla risorsa
                setError(`Impossibile caricare automaticamente il modello 3D. 
                          <a href="${simpleUrl}" target="_blank" class="text-blue-400 underline">
                            Clicca qui per visualizzarlo in una nuova finestra.
                          </a>`);
                
                // Libera le risorse
                document.body.removeChild(linkElement);
                setIsLoading(false);
                clearTimeout(timeoutId);
              } catch (error) {
                console.error("All fetch methods failed:", error);
                setError('Impossibile caricare il modello 3D. Controlla le impostazioni CORS del server.');
                setIsLoading(false);
                clearTimeout(timeoutId);
              }
            } catch (error) {
              console.error('Error in model loading process:', error);
              setError('Errore nel caricamento del modello 3D');
              setIsLoading(false);
              clearTimeout(timeoutId);
            }
          };
          
          // Helper to handle a successful response
          const handleSuccessfulResponse = async (response: Response) => {
            if (lowercaseFileType === 'stl') {
              const arrayBuffer = await response.arrayBuffer();
              const result = (loader as STLLoader).parse(arrayBuffer);
              handleStlResult(result);
            } else {
              const text = await response.text();
              const result = (loader as OBJLoader).parse(text);
              handleObjResult(result);
            }
          };

          loadWithFetch();
        } catch (err: any) {
          console.error('Error loading model from URL:', err);
          setError('Errore nel caricamento del modello 3D');
          setIsLoading(false);
        }
      }
    };

    const handleStlResult = (result: THREE.BufferGeometry) => {
      result.computeBoundingBox();
      const bbox = result.boundingBox!;
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      
      // Centra il modello alla base invece che al centro
      result.translate(-center.x, -bbox.min.y, -center.z);
      
      const size = new THREE.Vector3();
      bbox.getSize(size);
      
      // Arrotondiamo le dimensioni a 2 decimali
      const roundedSize = {
        x: parseFloat(size.x.toFixed(2)),
        y: parseFloat(size.y.toFixed(2)),
        z: parseFloat(size.z.toFixed(2))
      };
      
      onDimensions?.(roundedSize);
      
      if (!result.hasAttribute('normal')) {
        result.computeVertexNormals();
      }

      // Calcola le facce piane
      const faces = getLargeFlatFaces(result);
      setFaces(faces);
      
      setGeometry(result);
    };

    const handleObjResult = (result: THREE.Group) => {
      const bbox = new THREE.Box3().setFromObject(result);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      
      // Centra il modello alla base invece che al centro
      result.position.set(-center.x, -bbox.min.y, -center.z);
      
      const size = new THREE.Vector3();
      bbox.getSize(size);
      
      // Arrotondiamo le dimensioni a 2 decimali
      const roundedSize = {
        x: parseFloat(size.x.toFixed(2)),
        y: parseFloat(size.y.toFixed(2)),
        z: parseFloat(size.z.toFixed(2))
      };
      
      onDimensions?.(roundedSize);
      
      setGeometry(result);
    };

    loadModel();
  }, [file, url, fileType]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        <Html position={[0, 1.5, 0]}>
          <div className="bg-black/70 text-red-500 p-3 rounded text-center"
              dangerouslySetInnerHTML={{ __html: error }}
          />
        </Html>
      </mesh>
    );
  }

  if (!geometry) return null;

  if (geometry instanceof THREE.BufferGeometry) {
    const size = new THREE.Vector3();
    geometry.boundingBox?.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 4 / maxDim : 1;

    return (
      <>
        <mesh 
          ref={modelRef as any}
          scale={[scale, scale, scale]}
          position={[0, 0, 0]}
        >
          <primitive object={geometry} attach="geometry" />
          <meshPhysicalMaterial
            color={0xdddddd}
            metalness={0.2}
            roughness={0.3}
            clearcoat={0.4}
            clearcoatRoughness={0.2}
            reflectivity={1}
            envMapIntensity={0.5}
          />
        </mesh>
      </>
    );
  }

  const bbox = new THREE.Box3().setFromObject(geometry);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 4 / maxDim : 1;

  return (
    <primitive 
      ref={modelRef as any}
      object={geometry} 
      scale={[scale, scale, scale]}
      position={[0, 0.5, 0]}
    />
  );
}

export default function ModelViewer({ file, fileType, onDimensions, url }: ModelViewerProps) {
  if (!file && !url) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
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
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <Suspense fallback={
          <Html center>
            <div className="loading">
              <div className="spinner"></div>
              <p>Caricamento...</p>
            </div>
          </Html>
        }>
          <ErrorBoundary>
            <Model file={file} fileType={fileType} onDimensions={onDimensions} url={url} />
          </ErrorBoundary>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls enableZoom={true} autoRotate={false} />
        </Suspense>
        <ContactShadows position={[0, -1.5, 0]} blur={2.5} scale={10} far={1.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

// Componente per la gestione degli errori di rendering
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorMessage: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMessage: error.message || 'Errore di visualizzazione' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ModelViewer error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="text-center p-4 bg-white/80 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-red-800">Errore di visualizzazione</p>
            <p className="text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: this.state.errorMessage }} />
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

// Aggiungo un nuovo componente alla fine del file per la sezione preventivo
export const ModelViewerPreventivo: React.FC<ModelViewerProps> = (props) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Gestione degli errori di caricamento
  useEffect(() => {
    // Reset dell'errore quando cambiano le props
    setLoadError(null);
  }, [props.file, props.url]);
  
  // Se c'è un errore o non ci sono né file né URL, mostra un placeholder
  if (loadError || (!props.file && !props.url)) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: '#1a1a1a', 
        borderRadius: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: loadError ? '#ff6b6b' : '#666',
        flexDirection: 'column'
      }}>
        {loadError ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style={{ fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: loadError }} />
          </>
        ) : (
          <p style={{ fontSize: '14px' }}>Anteprima 3D non disponibile</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', borderRadius: '8px' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows
        gl={{ antialias: true }}
        onError={(error) => {
          console.error("Canvas error:", error);
          setLoadError("Errore rendering 3D");
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1}
          position={[5, 10, 5]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white', textAlign: 'center' }}>
              Caricamento...
            </div>
          </Html>
        }>
          <Model {...props} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls 
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.8}
          minDistance={2}
          maxDistance={20}
        />
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.6}
          scale={10}
          blur={1}
          far={5}
        />
      </Canvas>
    </div>
  );
}; 

// Rimuovo la funzione complessa e aggiungo una più semplice
export const captureModelThumbnail = async (canvasElement: HTMLCanvasElement): Promise<string> => {
  try {
    // Cattura il contenuto del canvas come data URL
    const dataURL = canvasElement.toDataURL('image/jpeg', 0.8);
    return dataURL;
  } catch (error) {
    console.error('Error capturing thumbnail:', error);
    throw error;
  }
}; 