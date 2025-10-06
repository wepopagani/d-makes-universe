import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RotateIcon, Zap } from "lucide-react";

interface OrientationControlsProps {
  onRotate: (axis: 'x' | 'y' | 'z', angle: number) => void;
  onReset: () => void;
  onOptimalOrientation: () => void;
  currentRotation?: { x: number; y: number; z: number };
  isCalculating?: boolean;
}

const OrientationControls: React.FC<OrientationControlsProps> = ({
  onRotate,
  onReset,
  onOptimalOrientation,
  currentRotation = { x: 0, y: 0, z: 0 },
  isCalculating = false
}) => {
  const rotationStep = Math.PI / 4; // 45 gradi

  const formatAngle = (radians: number) => {
    return Math.round((radians * 180) / Math.PI);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <RotateIcon className="h-5 w-5" />
          Controlli Orientamento
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ruota il modello per trovare l'orientamento ottimale per la stampa
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rotazione Asse X (Pitch) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotazione X (Pitch)</label>
            <span className="text-xs text-gray-500">{formatAngle(currentRotation.x)}°</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('x', -rotationStep)}
              className="flex-1"
            >
              <FlipVertical className="h-4 w-4 mr-1" />
              -45°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('x', rotationStep)}
              className="flex-1"
            >
              <FlipVertical className="h-4 w-4 mr-1 rotate-180" />
              +45°
            </Button>
          </div>
        </div>

        {/* Rotazione Asse Y (Yaw) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotazione Y (Yaw)</label>
            <span className="text-xs text-gray-500">{formatAngle(currentRotation.y)}°</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('y', -rotationStep)}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              -45°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('y', rotationStep)}
              className="flex-1"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              +45°
            </Button>
          </div>
        </div>

        {/* Rotazione Asse Z (Roll) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotazione Z (Roll)</label>
            <span className="text-xs text-gray-500">{formatAngle(currentRotation.z)}°</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('z', -rotationStep)}
              className="flex-1"
            >
              <FlipHorizontal className="h-4 w-4 mr-1" />
              -45°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate('z', rotationStep)}
              className="flex-1"
            >
              <FlipHorizontal className="h-4 w-4 mr-1 rotate-90" />
              +45°
            </Button>
          </div>
        </div>

        {/* Preset Orientamenti */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Preset Rapidi</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onRotate('x', 0);
                onRotate('y', 0);
                onRotate('z', 0);
              }}
              className="text-xs"
            >
              Base Piatta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onRotate('x', Math.PI / 2);
                onRotate('y', 0);
                onRotate('z', 0);
              }}
              className="text-xs"
            >
              Su Lato
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onRotate('x', 0);
                onRotate('y', 0);
                onRotate('z', Math.PI / 2);
              }}
              className="text-xs"
            >
              Ruotato 90°
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOptimalOrientation}
              disabled={isCalculating}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              {isCalculating ? 'Calc...' : 'Ottimale'}
            </Button>
          </div>
        </div>

        {/* Reset e Azioni */}
        <div className="border-t pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={onOptimalOrientation}
            disabled={isCalculating}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isCalculating ? 'Calcolando...' : 'Trova Ottimale'}
          </Button>
        </div>

        {/* Info Orientamento */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Suggerimento:</strong> L'orientamento ottimale riduce i supporti necessari 
            e migliora la qualità di stampa. Usa "Trova Ottimale" per calcoli automatici!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrientationControls;
