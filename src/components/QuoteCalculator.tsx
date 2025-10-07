import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ModelViewerPreventivo } from "@/components/ModelViewer";
// import OrientationControls from "@/components/OrientationControls";
// import CostCalculator from "@/components/CostCalculator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/firebase/AuthContext";
import { useTranslation } from 'react-i18next';

// Costanti per i limiti e configurazioni
const MIN_DIM = 2;
const MAX_DIM = 300;
const MIN_PRICE = 50; // Prezzo minimo per un preventivo
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const API_URL = 'https://slice.3dmakes.ch/api/slice';
const USER_PANEL_URL = "/dashboard"; // URL base della dashboardcat
const LOGIN_URL = "/login"; // URL della pagina di login
const REGISTER_URL = "/register"; // URL della pagina di registrazione
const ORDERS_URL = "/dashboard/ordini"; // URL specifico della pagina ordini
const NEW_ORDER_URL = "/dashboard/ordini/nuovo"; // URL per creare un nuovo ordine
const FILES_URL = "/dashboard/file"; // URL per i file
const MESSAGES_URL = "/dashboard/messaggi"; // URL per i messaggi
const PROFILE_URL = "/dashboard/profilo"; // URL per il profilo

// Aggiungo una variabile globale per memorizzare l'ID del file
let lastUploadedFileId = '';

const QuoteCalculator = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Accesso all'autenticazione tramite context
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tipo di stampa
  const [printType, setPrintType] = useState<string>("fdm");
  
  // Stato del file
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Dati di stampa
  const [printTime, setPrintTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Parametri fissi - nessuna scelta per l'utente
  const quality = "0.2"; // Default
  const material = "pla"; // Fisso a PLA
  const infill = "20"; // Fisso a 20%
  
  // Costo per 1 pezzo
  const [singlePrice, setSinglePrice] = useState<number | null>(null);
  
  // Breakdown cost
  const [materialCost, setMaterialCost] = useState<number | null>(null);
  const [electricityCost, setElectricityCost] = useState<number | null>(null);
  const [depreciationCost, setDepreciationCost] = useState<number | null>(null);
  const [laborCost, setLaborCost] = useState<number | null>(null);
  const [failureCost, setFailureCost] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [discountApplied, setDiscountApplied] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  
  // Dimensioni
  const [modelDims, setModelDims] = useState<{ x: number; y: number; z: number } | null>(null);
  
  
  // Stato per drag and drop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Stato per l'orientamento del modello
  const [modelOrientation, setModelOrientation] = useState({ x: 0, y: 0, z: 0 });
  
  // Stato per controlli avanzati
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [isCalculatingOptimal, setIsCalculatingOptimal] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  
  // Stato per il flusso dell'ordine
  const [preventivoDone, setPreventivoDone] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

  // Parametri fissi - nessuna configurazione per l'utente

  
  // Quantità fissa
  const quantity = 1;

  // Al caricamento, verifica se l'utente è loggato usando currentUser
  useEffect(() => {
    // Imposta direttamente isUserLoggedIn in base a currentUser dal context
    setIsUserLoggedIn(!!currentUser);
    console.log("Stato login verificato:", !!currentUser);
  }, [currentUser]);

  // Reset degli stati quando cambia il file
  const resetStates = () => {
    setError(null);
    setPrintTime(null);
    setSinglePrice(null);
    setMaterialCost(null);
    setElectricityCost(null);
    setDepreciationCost(null);
    setIsProcessing(false);
    setUploadProgress(0);
    setModelDims(null);
    setModelOrientation({ x: 0, y: 0, z: 0 });
    setPreventivoDone(false);
  };

  // Handler per il caricamento del file
  const processFile = (f: File) => {
    resetStates();
    setIsLoading(true);
    
    if (f.size > MAX_FILE_SIZE) {
      setError(`File troppo grande (max ${Math.round(MAX_FILE_SIZE/1024/1024)}MB). Per file più grandi, contattaci.`);
        setIsLoading(false);
        return;
      }
      
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    
    // Accetta tutti i formati di file
    console.log("File caricato:", f.name, "Tipo:", ext, "Dimensione:", f.size);
    
    setFileType(ext);
    setFile(f);
      
      toast({
        title: t('calculator.fileUploaded'),
      description: t('calculator.fileUploadedSuccess', { fileName: f.name }),
      variant: "default",
      });
      
      setIsLoading(false);
  };

  // Handler per l'input file tradizionale
  const handleFileChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const f = evt.target.files?.[0];
      if (f) {
        processFile(f);
      }
    },
    []
  );

  // Handlers per drag & drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  // Calcolo del prezzo per 1 pezzo
  const calculateSinglePrice = useCallback((printTimeHours: number, materialGrams: number, laserData?: any) => {
    if (printType === 'laser' && laserData) {
      // Calcolo per laser basato su area e tempo
      const area = laserData.area || 0; // cm²
      const cuttingTime = laserData.cutting_time || 0; // minuti
      const engravingTime = laserData.engraving_time || 0; // minuti
      
      // Costo base per materiale (dipende dal tipo e spessore)
      const materialCostPerCm2 = getMaterialCostPerCm2(material);
      const matCost = area * materialCostPerCm2;
      setMaterialCost(matCost);

      // Costo laser (tempo macchina)
      const totalLaserTime = (cuttingTime + engravingTime) / 60; // ore
      const laserCostPerHour = 45; // CHF/ora per laser
      const laserCost = totalLaserTime * laserCostPerHour;
      setElectricityCost(laserCost);

      // Costo setup e handling
      const setupCost = 5; // CHF fisso per setup
      setDepreciationCost(setupCost);

      // Totale base
      const base = matCost + laserCost + setupCost;

      // Markup per laser (più basso della stampa 3D)
      const finalPrice = base * 1.5;

      return Math.max(MIN_PRICE, Math.round(finalPrice * 100) / 100);
    } else {
      // Calcolo per stampa 3D (FDM/SLA)
      // 1) Costo materiale
      const matCost = materialGrams * 0.1;
      setMaterialCost(matCost);

      // 2) Costo elettricità
      const elecCost = printTimeHours * 0.03;
      setElectricityCost(elecCost);

      // 3) Costo ammortamento
      const deprCost = printTimeHours * 0.25;
      setDepreciationCost(deprCost);

      // 4) Totale base
      const base = matCost + elecCost + deprCost;

      // 5) Markup
      const finalPrice = base * 1.35 * 1.35 * 1.2;

      return Math.round(finalPrice * 100) / 100;
    }
  }, [printType, material]);

  // Funzione per ottenere il costo del materiale per cm²
  const getMaterialCostPerCm2 = (materialId: string) => {
    const costs: { [key: string]: number } = {
      // Legno (CHF/cm²)
      'wood_1mm': 0.02,
      'wood_2mm': 0.04,
      'wood_3mm': 0.06,
      'wood_4mm': 0.08,
      'wood_5mm': 0.10,
      'wood_6mm': 0.12,
      'wood_7mm': 0.14,
      'wood_8mm': 0.16,
      'wood_9mm': 0.18,
      'wood_10mm': 0.20,
      // MDF (CHF/cm²)
      'mdf_1mm': 0.015,
      'mdf_2mm': 0.03,
      'mdf_3mm': 0.045,
      'mdf_4mm': 0.06,
      'mdf_5mm': 0.075,
      'mdf_6mm': 0.09,
      'mdf_7mm': 0.105,
      'mdf_8mm': 0.12,
      'mdf_9mm': 0.135,
      'mdf_10mm': 0.15,
      // Altri materiali
      'acrylic_opaque': 0.25,
      'acrylic_transparent': 0.25,
      'cardboard': 0.01,
      'leather': 0.30,
      'fabric': 0.05,
      'cork': 0.20,
      'slate': 0.50
    };
    return costs[materialId] || 0.10; // Default
  };

  // Funzione per gestire il reindirizzamento al profilo utente
  const handleGoToProfile = () => {
    if (currentUser) {
      // Utente loggato - vai alla dashboard/file
      console.log("Utente loggato, reindirizzo alla dashboard");
      window.location.href = FILES_URL;
    } else {
      // Utente non loggato - vai alla pagina di login con redirect
      console.log("Utente non loggato, reindirizzo al login");
      const redirectAfterLogin = encodeURIComponent(FILES_URL);
      window.location.href = `${LOGIN_URL}?redirect=${redirectAfterLogin}`;
    }
  };

  // Modifica la funzione simulateProgress per migliorarla
  const simulateProgress = () => {
    setUploadProgress(0);
    
    // Definisce le fasi di progresso con velocità diverse
    const phases = [
      { target: 30, increment: 1, delay: 80 },  // Fase veloce iniziale
      { target: 70, increment: 0.5, delay: 100 }, // Fase media
      { target: 90, increment: 0.2, delay: 150 }, // Fase lenta
    ];
    
    let currentPhase = 0;
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        // Se abbiamo raggiunto il target della fase attuale, passiamo alla fase successiva
        if (currentPhase < phases.length && prev >= phases[currentPhase].target) {
          currentPhase++;
        }
        
        // Se siamo arrivati all'ultima fase e superato il target, fermiamo a 90%
        if (currentPhase >= phases.length && prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        
        // Calcoliamo l'incremento in base alla fase attuale
        const { increment } = currentPhase < phases.length ? 
          phases[currentPhase] : phases[phases.length - 1];
        
        return Math.min(90, prev + increment);
      });
    }, phases[currentPhase]?.delay || 100);
    
    return interval;
  };

  // Completare il progresso da 90 a 100 quando la risposta è arrivata
  const completeProgress = () => {
    return new Promise<void>((resolve) => {
      const finalInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(finalInterval);
            resolve();
            return 100;
          }
          // Incremento più rapido nella fase finale
          return Math.min(100, prev + 2);
        });
      }, 40);
    });
  };

  // Quando cambia il tipo di stampa, aggiorna materiale e qualità con opzioni compatibili
  useEffect(() => {
    if (printType === "fdm") {
      // Parametri fissi - nessuna modifica necessaria
    }
  }, [printType]);


  // Handler invio al server
  const handleCalculate = useCallback(async () => {
    if (!file) {
      setError("Nessun file selezionato");
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      setPrintTime(null);
      setSinglePrice(null);

      // Avvia la simulazione del progresso
      const progressInterval = simulateProgress();

      // Prepara il FormData per il calcolo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", quality);
      formData.append("material", material);
      formData.append("infill", infill);
      formData.append("supports", "false"); // Default per ora
      formData.append("quantity", quantity.toString());
      formData.append("printType", printType);
      formData.append("rotation_x", modelOrientation.x.toString());
      formData.append("rotation_y", modelOrientation.y.toString());
      formData.append("rotation_z", modelOrientation.z.toString());
      
      // Aggiungi informazioni utente se loggato
      if (currentUser) {
        formData.append("userId", currentUser.uid);
        formData.append("userEmail", currentUser.email || '');
      }

      // Richiesta al server
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          ...(currentUser && {'Authorization': `Bearer ${currentUser.uid}`})
        },
        body: formData
      });

      // Ferma la simulazione del progresso
      clearInterval(progressInterval);
      
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error(`File troppo grande per il server (max 50MB). Per file più grandi, contattaci.`);
        }
        const errorText = await res.text();
        throw new Error(`Errore del server (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Errore durante il calcolo');
      }

      // Completa il progresso da 90 a 100
      await completeProgress();

      // Aggiorna i dati del preventivo con la nuova struttura API completa
      const analysis = data.analysis;
      const detailedCalc = data.detailedCalculation;
      
      setPrintTime(`${analysis.printTime} min`);
      
      // Usa il prezzo finale per pezzo dal calcolo dettagliato
      const sp = detailedCalc.prezzoFinalePezzo || Math.max(MIN_PRICE, 15);
      
      // Setta i costi dettagliati dal calcolo completo
      if (detailedCalc.costoMateriale) setMaterialCost(detailedCalc.costoMateriale);
      if (detailedCalc.costoElettricita) setElectricityCost(detailedCalc.costoElettricita);
      if (detailedCalc.costoAmmortamento) setDepreciationCost(detailedCalc.costoAmmortamento);
      if (detailedCalc.costoLavoro) setLaborCost(detailedCalc.costoLavoro);
      if (detailedCalc.failureCost) setFailureCost(detailedCalc.failureCost);
      if (detailedCalc.totaleConFailure) setTotalCost(detailedCalc.totaleConFailure);
      if (detailedCalc.scontoApplicabile) setDiscountApplied(detailedCalc.scontoApplicabile);
      if (detailedCalc.profittoTotale) setProfit(detailedCalc.profittoTotale);
      
      setSinglePrice(sp);
      
      // Imposta lo stato che indica che il preventivo è stato calcolato
      setPreventivoDone(true);
          
          toast({
            title: "Preventivo calcolato!",
            description: `Prezzo per pezzo: ${sp.toFixed(2)} CHF | Totale ${quantity} pezzi: ${detailedCalc.prezzoFinaleTotale.toFixed(2)} CHF | Ordine minimo: 50 CHF`,
            variant: "default",
          });

    } catch (err: any) {
      console.error("Errore durante l'upload:", err);
      setError(err.message || "Errore di connessione con il server");
      
      toast({
        title: "Errore",
        description: err.message || "Errore di connessione con il server",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [file, quality, material, infill, printType, modelOrientation, calculateSinglePrice, toast, currentUser]);

  // Funzione per gestire il processo di creazione ordine
  const handleCreateOrder = () => {
    // Salva i dati del preventivo - semplificato perché ora abbiamo già salvato tutto
    // durante il calcolo del preventivo
    if (!file) {
      toast({
        title: "Errore",
        description: "Nessun file selezionato per il preventivo.",
        variant: "destructive",
      });
      return;
    }
    
    // Costruisci i parametri dell'URL
    const params = new URLSearchParams();
    
    // Controlla se abbiamo un ID file valido da lastUploadedFileId o sessionStorage
    const fileId = lastUploadedFileId || sessionStorage.getItem('quoteFileId');
    
    if (!fileId) {
      console.warn("Nessun fileId disponibile. Tentativo di procedere senza.");
    }
    
    // Aggiungi tutti i parametri necessari
    params.append('fileId', fileId || '');
    params.append('fileName', file.name);
    params.append('material', material);
    params.append('quantity', quantity.toString());
    params.append('printType', printType);
    params.append('quality', quality);
    params.append('infill', infill);
    
    // Aggiungi il prezzo stimato
    params.append('price', totalPrice?.toString() || '0');
    
    // Indica che stiamo arrivando dal calcolatore preventivi
    params.append('fromQuote', 'true');
    
    // Timestamp per tracciare quando è stato creato l'URL
    params.append('ts', Date.now().toString());
    
    // Verifica se l'utente è loggato
    if (currentUser) {
      // Utente loggato - vai direttamente alla pagina di creazione ordine
      console.log("Utente loggato, reindirizzo a", NEW_ORDER_URL);
      window.location.href = `${NEW_ORDER_URL}?${params.toString()}`;
    } else {
      // Utente non loggato - vai alla pagina di login con redirect
      console.log("Utente non loggato, reindirizzo al login");
      const redirectAfterLogin = encodeURIComponent(`${NEW_ORDER_URL}?${params.toString()}`);
      window.location.href = `${LOGIN_URL}?redirect=${redirectAfterLogin}`;
    }
  };

  // Funzione per calcolare lo sconto
  const calculateDiscount = (quantity: number, price: number) => {
    let discount = 0;
    if (quantity >= 10 && quantity < 20) {
      discount = 0.1; // 10%
    } else if (quantity >= 20 && quantity < 30) {
      discount = 0.2; // 20%
    } else if (quantity >= 30 && quantity < 50) {
      discount = 0.25; // 25%
    } else if (quantity >= 50) {
      discount = 0.3; // 30%
    }
    return price * discount;
  };

  // Calcolo finale in base a quantity
  const getTotal = () => {
    if (!singlePrice) return null;

    const discount = calculateDiscount(quantity, singlePrice);
    const calculatedPrice = (singlePrice * quantity) - discount;

    // Restituisci sempre il prezzo calcolato, anche se sotto il minimo
    return calculatedPrice;
  };

  // Prezzo finale da pagare (con minimo applicato)
  const getFinalPrice = () => {
    const calculatedTotal = getTotal();
    if (!calculatedTotal) return null;
    
    // Applica il minimo d'ordine
    return Math.max(calculatedTotal, MIN_PRICE);
  };

  // Messaggio: se singlePrice < 15 e singlePrice * quantity < 15 => avviso
  const isBelowMin = () => {
    if (singlePrice == null) return false;
    if (singlePrice >= MIN_PRICE) return false;
    const sub = singlePrice * quantity;
    return sub < MIN_PRICE;
  };

  const calculatedPrice = getTotal();
  const totalPrice = getFinalPrice();

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  return (
    <div className="space-y-8 px-0 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden w-full">
        <div className="p-4 md:p-6 lg:p-8">
          <h3 className="text-2xl font-semibold mb-6">{t('calculator.title')}</h3>
          
          <div className="space-y-8">
            {/* Model Viewer Section - sempre visibile */}
            <div className="space-y-4">
              <Card 
                className={`h-[450px] flex flex-col items-center justify-center border-2 ${isDragging ? 'border-brand-accent' : 'border-dashed'} relative`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="flex flex-col items-center justify-center h-full w-full p-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                      <p className="mt-4 text-brand-gray">{t('calculator.processing')}</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-red-500 text-4xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-medium text-red-500 mb-2">{t('common.error')}</p>
                      <p className="text-sm text-gray-500 text-center mb-4">{error}</p>
                      <Button onClick={triggerFileInput}>{t('calculator.uploadFile')}</Button>
                    </div>
                  ) : file ? (
                    <div className="w-full h-full">
                      <ModelViewerPreventivo 
                        file={file} 
                        fileType={fileType} 
                        onDimensions={(dims) => setModelDims(dims)}
                        scaleFactor={1}
                        onOrientationChange={(rotation) => setModelOrientation(rotation)}
                      />
                      <div className="absolute bottom-2 left-0 right-0 text-center bg-white/70 p-1 backdrop-blur-sm text-xs">
                        <p className="text-brand-blue font-medium">{file?.name}</p>
                        {modelDims && (
                        <p className="text-xs text-gray-500">
                            Dimensioni: {modelDims.x.toFixed(2)}×{modelDims.y.toFixed(2)}×{modelDims.z.toFixed(2)} mm
                          </p>
                        )}
                        <Button variant="outline" size="sm" className="mt-1 py-0 h-6 text-xs" onClick={triggerFileInput}>
                          {t('common.edit')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-brand-blue text-4xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xl font-medium text-brand-blue mb-2">{t('calculator.uploadFile')}</p>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        {t('calculator.dragDrop')}
                        <br />
                        <span className="text-xs text-brand-accent">
                          Accettiamo tutti i formati di file
                        </span>
                      </p>
                      <Button onClick={triggerFileInput}>{t('calculator.uploadFile')}</Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Controlli Avanzati - temporaneamente disabilitati */}
              {file && false && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Controlli Avanzati</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    >
                      {showAdvancedControls ? 'Nascondi' : 'Mostra'} Controlli
                    </Button>
                  </div>
                  
                  {showAdvancedControls && (
                    <div className="grid grid-cols-1 gap-4">
                      {/* OrientationControls e CostCalculator temporaneamente rimossi */}
                      <div className="p-4 bg-gray-100 rounded">
                        <p>Controlli avanzati in fase di sviluppo...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="*"
                className="hidden"
              />
            </div>
            
            {/* Controlli sotto il viewer */}
            <div className="space-y-4">
              {/* Messaggio informativo */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Preventivo automatico
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Questo è un preventivo automatico indicativo. 
                        <strong> Contattaci sempre per un preventivo affidabile e personalizzato</strong> 
                        basato sulle tue esigenze specifiche.
                      </p>
                      <p className="mt-1">
                        <strong>Ordine minimo: 50 CHF</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottone calcola preventivo */}
              {!preventivoDone && (
                <Button 
                  onClick={handleCalculate}
                  disabled={!file || isProcessing}
                  className="w-full relative overflow-hidden"
                  size="lg"
                >
                  {isProcessing && (
                    <>
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                    </>
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('calculator.processing')} {Math.floor(uploadProgress)}%
                      </>
                    ) : t('calculator.calculate')}
                  </span>
                </Button>
              )}
              
              {/* Errore */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-700">
                    <span className="font-semibold">{t('common.error')}:</span> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Banner preventivo a larghezza piena quando è stato calcolato - posizionato FUORI dalle colonne */}
          {preventivoDone && totalPrice && (
            <div className="space-y-6 mt-8">
              {/* Visualizzazione risultato */}
              <div className="p-8 bg-slate-100 rounded-lg text-center">
                <p className="text-xl font-semibold mb-2">{t('calculator.estimatedQuote')}</p>
                
                {/* Nome del file */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">File:</p>
                  <p className="text-lg font-medium text-gray-700">{file?.name}</p>
                </div>
                
                {/* Mostra sempre il prezzo calcolato del modello */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Prezzo del modello:</p>
                  <p className="text-3xl font-bold text-gray-700">{calculatedPrice?.toFixed(2)} CHF</p>
                </div>
                
                {/* Mostra il prezzo finale da pagare */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Prezzo finale:</p>
                  <p className="text-5xl font-bold text-brand-accent">{totalPrice.toFixed(2)} CHF</p>
                </div>
                
                {/* Messaggio esplicativo se applicato il minimo */}
                {calculatedPrice && calculatedPrice < MIN_PRICE && (
                  <p className="text-sm text-blue-600 mt-3 bg-blue-50 p-3 rounded">
                    Il costo per pezzo singolo è inferiore, ma si applica un minimo di {MIN_PRICE} CHF per ordine.
                  </p>
                )}
              </div>
              
              {/* Bottone a tutta larghezza - cambiato da "Crea ordine" a "Vai al profilo" */}
              <Button 
                onClick={handleGoToProfile}
                className="w-full py-8 text-xl font-semibold bg-green-600 hover:bg-green-700"
              >
                {t('calculator.goToProfile')}
              </Button>
              
              {/* Pulsante per ricalcolare il preventivo */}
              <Button 
                onClick={handleCalculate}
                disabled={isProcessing}
                variant="outline"
                className="w-full py-3 relative overflow-hidden"
              >
                {isProcessing && (
                  <>
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </>
                )}
                <span className="relative z-10 flex items-center justify-center">
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('calculator.processing')} {Math.floor(uploadProgress)}%
                    </>
                  ) : t('calculator.recalculate')}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-semibold mb-8">{t('calculator.howItWorksTitle')}</h3>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">{t('calculator.aiCalculator')}</h4>
            <p className="text-sm text-blue-700">
              {t('calculator.aiCalculatorDesc')}
            </p>
          </div>
          
          <ul className="space-y-6">
            <li className="flex">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent mr-4">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('calculator.step1Title')}</h4>
                <p className="text-brand-gray">{t('calculator.step1Desc')}</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent mr-4">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('calculator.step2Title')}</h4>
                <p className="text-brand-gray">{t('calculator.step2Desc')}</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent mr-4">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('calculator.step3Title')}</h4>
                <p className="text-brand-gray">{t('calculator.step3Desc')}</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent mr-4">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">{t('calculator.step4Title')}</h4>
                <p className="text-brand-gray">{t('calculator.step4Desc')}</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent mr-4">
                5
              </div>
              <div>
                <h4 className="font-semibold mb-1">Produzione e consegna</h4>
                <p className="text-brand-gray">
                  Se accetti l'offerta, l'ordine procede automaticamente. Potrai monitorare lo stato di produzione 
                  e scegliere se ritirare presso il nostro laboratorio o ricevere la spedizione a domicilio.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuoteCalculator;
