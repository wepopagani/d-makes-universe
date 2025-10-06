import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelViewer from './ModelViewer';
import OrientationControls from './OrientationControls';
import CostCalculator from './CostCalculator';

interface ModelViewerAdvancedProps {
  file: File | null;
  fileType: string;
  material?: string;
  quality?: string;
  infill?: number;
  onDimensionsChange?: (dimensions: { x: number; y: number; z: number }) => void;
  onCostChange?: (cost: any) => void;
  onOrientationChange?: (rotation: { x: number; y: number; z: number }) => void;
}

const ModelViewerAdvanced: React.FC<ModelViewerAdvancedProps> = ({
  file,
  fileType,
  material = 'pla',
  quality = 'normal',
  infill = 20,
  onDimensionsChange,
  onCostChange,
  onOrientationChange
}) => {
  const [modelDimensions, setModelDimensions] = useState<{ x: number; y: number; z: number } | undefined>();
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isCalculatingOptimal, setIsCalculatingOptimal] = useState(false);
  const modelRef = useRef<any>(null);

  // Handle dimension changes from ModelViewer
  const handleDimensionsChange = (dims: { x: number; y: number; z: number }) => {
    setModelDimensions(dims);
    onDimensionsChange?.(dims);
  };

  // Handle rotation controls
  const handleRotate = (axis: 'x' | 'y' | 'z', angle: number) => {
    const newRotation = {
      ...currentRotation,
      [axis]: currentRotation[axis] + angle
    };
    
    setCurrentRotation(newRotation);
    onOrientationChange?.(newRotation);
    
    // Apply rotation to 3D model if ref exists
    if (modelRef.current) {
      // This will be implemented when we integrate with the actual ModelViewer
      console.log('Applying rotation:', newRotation);
    }
  };

  // Reset orientation
  const handleReset = () => {
    const resetRotation = { x: 0, y: 0, z: 0 };
    setCurrentRotation(resetRotation);
    onOrientationChange?.(resetRotation);
  };

  // Calculate optimal orientation
  const handleOptimalOrientation = async () => {
    if (!modelDimensions) return;
    
    setIsCalculatingOptimal(true);
    
    try {
      // Simulated optimal orientation calculation
      // In futuro questo sarà una chiamata API al server
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Algoritmo semplificato per orientamento ottimale
      const optimalRotation = calculateOptimalOrientation(modelDimensions);
      
      setCurrentRotation(optimalRotation);
      onOrientationChange?.(optimalRotation);
      
    } catch (error) {
      console.error('Error calculating optimal orientation:', error);
    } finally {
      setIsCalculatingOptimal(false);
    }
  };

  // Algoritmo semplificato per calcolare orientamento ottimale
  const calculateOptimalOrientation = (dims: { x: number; y: number; z: number }) => {
    // Logica semplificata: metti la dimensione più grande come base
    const { x, y, z } = dims;
    
    if (z > x && z > y) {
      // Se Z è la dimensione maggiore, ruota per metterla come base
      return { x: Math.PI / 2, y: 0, z: 0 };
    } else if (y > x && y > z) {
      // Se Y è la dimensione maggiore, ruota per metterla come base  
      return { x: 0, y: 0, z: Math.PI / 2 };
    } else {
      // X è già la base, mantieni orientamento standard
      return { x: 0, y: 0, z: 0 };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Visualizzatore 3D - Colonna principale */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-6 h-full">
            <div className="h-[500px] w-full">
              <ModelViewer
                ref={modelRef}
                file={file}
                fileType={fileType}
                onDimensions={handleDimensionsChange}
                onOrientationChange={onOrientationChange}
                scaleFactor={1}
              />
            </div>
            
            {/* Info rapide sotto il viewer */}
            {modelDimensions && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Dimensioni Modello</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Larghezza:</span>
                    <span className="ml-2 font-mono">{modelDimensions.x.toFixed(1)}mm</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Profondità:</span>
                    <span className="ml-2 font-mono">{modelDimensions.y.toFixed(1)}mm</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Altezza:</span>
                    <span className="ml-2 font-mono">{modelDimensions.z.toFixed(1)}mm</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pannello controlli - Colonna laterale */}
      <div className="space-y-6">
        <Tabs defaultValue="orientation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orientation">Orientamento</TabsTrigger>
            <TabsTrigger value="cost">Costi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orientation" className="space-y-4">
            <OrientationControls
              onRotate={handleRotate}
              onReset={handleReset}
              onOptimalOrientation={handleOptimalOrientation}
              currentRotation={currentRotation}
              isCalculating={isCalculatingOptimal}
            />
          </TabsContent>
          
          <TabsContent value="cost" className="space-y-4">
            <CostCalculator
              dimensions={modelDimensions}
              material={material}
              quality={quality}
              infill={infill}
              rotation={currentRotation}
              onCostUpdate={onCostChange}
            />
          </TabsContent>
        </Tabs>

        {/* Suggerimenti */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">💡 Suggerimenti</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Usa "Trova Ottimale" per ridurre i supporti</li>
              <li>• Orientamenti piatti = meno tempo di stampa</li>
              <li>• Controlla i costi in tempo reale</li>
              <li>• Ruota il modello con mouse/touch</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelViewerAdvanced;
