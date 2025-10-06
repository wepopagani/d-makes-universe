import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Weight, Layers, AlertTriangle } from "lucide-react";

interface ModelDimensions {
  x: number;
  y: number;
  z: number;
}

interface CostCalculatorProps {
  dimensions?: ModelDimensions;
  material: string;
  quality: string;
  infill: number;
  rotation?: { x: number; y: number; z: number };
  onCostUpdate?: (cost: CostEstimate) => void;
}

interface CostEstimate {
  volume: number;
  weight: number;
  printTime: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  supportsMaterial: number;
  supportsNeeded: boolean;
}

interface MaterialProperties {
  density: number; // g/cm³
  costPerKg: number; // CHF per kg
  name: string;
  color: string;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({
  dimensions,
  material,
  quality,
  infill,
  rotation = { x: 0, y: 0, z: 0 },
  onCostUpdate
}) => {
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Database materiali con proprietà
  const materials: Record<string, MaterialProperties> = {
    'pla': {
      density: 1.24,
      costPerKg: 25,
      name: 'PLA',
      color: 'bg-green-500'
    },
    'abs': {
      density: 1.04,
      costPerKg: 28,
      name: 'ABS', 
      color: 'bg-blue-500'
    },
    'petg': {
      density: 1.27,
      costPerKg: 32,
      name: 'PETG',
      color: 'bg-purple-500'
    },
    'tpu': {
      density: 1.20,
      costPerKg: 45,
      name: 'TPU',
      color: 'bg-orange-500'
    },
    'nylon': {
      density: 1.08,
      costPerKg: 55,
      name: 'Nylon',
      color: 'bg-gray-500'
    }
  };

  // Calcolo avanzato del volume considerando infill
  const calculateVolume = (dims: ModelDimensions): number => {
    if (!dims) return 0;
    
    // Volume base in cm³
    const baseVolume = (dims.x / 10) * (dims.y / 10) * (dims.z / 10);
    
    // Considera infill percentage
    const infillMultiplier = (infill / 100) * 0.8 + 0.2; // Min 20% per pareti
    
    return baseVolume * infillMultiplier;
  };

  // Calcolo supporti basato su orientamento
  const calculateSupports = (dims: ModelDimensions, rot: { x: number; y: number; z: number }): { needed: boolean; volume: number } => {
    if (!dims) return { needed: false, volume: 0 };

    // Analisi semplificata: se ci sono angoli > 45° rispetto al piano di stampa
    const hasOverhangs = Math.abs(rot.x) > Math.PI / 4 || Math.abs(rot.z) > Math.PI / 4;
    
    if (!hasOverhangs) return { needed: false, volume: 0 };

    // Stima volume supporti (5-15% del volume totale)
    const baseVolume = calculateVolume(dims);
    const supportsVolume = baseVolume * 0.1; // 10% medio
    
    return { needed: true, volume: supportsVolume };
  };

  // Calcolo tempo di stampa
  const calculatePrintTime = (volume: number, quality: string): number => {
    const qualityMultipliers: Record<string, number> = {
      'draft': 0.6,     // Veloce
      'normal': 1.0,    // Standard
      'fine': 1.8,      // Alta qualità
      'ultra': 3.0      // Ultra fine
    };

    const baseTimePerCm3 = 15; // minuti per cm³
    const multiplier = qualityMultipliers[quality] || 1.0;
    
    return volume * baseTimePerCm3 * multiplier;
  };

  // Calcolo costo totale
  const calculateCost = (): CostEstimate | null => {
    if (!dimensions) return null;

    const materialProps = materials[material.toLowerCase()] || materials['pla'];
    const volume = calculateVolume(dimensions);
    const supports = calculateSupports(dimensions, rotation);
    const totalVolume = volume + supports.volume;
    
    // Peso in grammi
    const weight = totalVolume * materialProps.density;
    
    // Tempo di stampa in minuti
    const printTime = calculatePrintTime(totalVolume, quality);
    
    // Costi
    const materialCost = (weight / 1000) * materialProps.costPerKg;
    const laborCost = (printTime / 60) * 2; // 2 CHF/ora costo operativo
    const totalCost = materialCost + laborCost + 5; // +5 CHF fisso

    return {
      volume: Math.round(volume * 100) / 100,
      weight: Math.round(weight * 10) / 10,
      printTime: Math.round(printTime),
      materialCost: Math.round(materialCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      supportsMaterial: Math.round(supports.volume * materialProps.density * 10) / 10,
      supportsNeeded: supports.needed
    };
  };

  // Ricalcola quando cambiano i parametri
  useEffect(() => {
    setIsCalculating(true);
    
    // Simula calcolo (in futuro sarà chiamata API)
    const timer = setTimeout(() => {
      const newEstimate = calculateCost();
      setEstimate(newEstimate);
      setIsCalculating(false);
      
      if (newEstimate && onCostUpdate) {
        onCostUpdate(newEstimate);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dimensions, material, quality, infill, rotation]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const materialProps = materials[material.toLowerCase()] || materials['pla'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcolo Costi
          {isCalculating && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!estimate || isCalculating ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Caricamento calcoli...</p>
          </div>
        ) : (
          <>
            {/* Materiale */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Materiale</span>
              <Badge className={`${materialProps.color} text-white`}>
                {materialProps.name}
              </Badge>
            </div>

            {/* Metriche principali */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Weight className="h-4 w-4 text-gray-600 mr-1" />
                </div>
                <div className="text-lg font-semibold">{estimate.weight}g</div>
                <div className="text-xs text-gray-600">Peso</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-gray-600 mr-1" />
                </div>
                <div className="text-lg font-semibold">{formatTime(estimate.printTime)}</div>
                <div className="text-xs text-gray-600">Tempo</div>
              </div>
            </div>

            {/* Supporti warning */}
            {estimate.supportsNeeded && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div className="text-sm">
                  <span className="font-medium text-amber-800">Supporti necessari</span>
                  <span className="text-amber-700 ml-2">+{estimate.supportsMaterial}g materiale</span>
                </div>
              </div>
            )}

            {/* Breakdown costi */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Dettaglio Costi</h4>
              
              <div className="flex justify-between text-sm">
                <span>Materiale ({estimate.weight}g)</span>
                <span>{estimate.materialCost} CHF</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Lavorazione ({formatTime(estimate.printTime)})</span>
                <span>{estimate.laborCost} CHF</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Costi fissi</span>
                <span>5.00 CHF</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Totale</span>
                <span className="text-green-600">{estimate.totalCost} CHF</span>
              </div>
            </div>

            {/* Info aggiuntive */}
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              💡 Costo calcolato in tempo reale. Il prezzo finale potrebbe variare leggermente 
              dopo l'analisi dettagliata del file.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CostCalculator;
