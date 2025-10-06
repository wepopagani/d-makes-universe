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
const MIN_PRICE = 15; // Prezzo minimo per un preventivo
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'https://gmbh-specially-judgment-rolled.trycloudflare.com/api/slice'
  : 'https://gmbh-specially-judgment-rolled.trycloudflare.com/api/slice';
const USER_PANEL_URL = "/dashboard"; // URL base della dashboard
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
  
  // Parametri
  const [quality, setQuality] = useState<string>("0.2");
  const [material, setMaterial] = useState<string>("pla");
  const [infill, setInfill] = useState<string>("20"); // Percentuale di riempimento
  
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
  
  // Quantità
  const [quantity, setQuantity] = useState<number>(1);
  
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

  // Solo FDM per ora
  const PRINT_TYPES = [
    { id: "fdm", label: t('calculator.printTypes.fdm') }
  ];
  
  // Solo materiali FDM
  const MATERIALS = [
    { id: "pla", label: t('calculator.materials.pla.label'), desc: t('calculator.materials.pla.desc') },
    { id: "petg", label: t('calculator.materials.petg.label'), desc: t('calculator.materials.petg.desc') },
    { id: "abs", label: t('calculator.materials.abs.label'), desc: t('calculator.materials.abs.desc') },
    { id: "tpu", label: t('calculator.materials.tpu.label'), desc: t('calculator.materials.tpu.desc') },
    { id: "petg_cf", label: t('calculator.materials.petg_cf.label'), desc: t('calculator.materials.petg_cf.desc') },
    { id: "pc", label: t('calculator.materials.pc.label'), desc: t('calculator.materials.pc.desc') },
    { id: "nylon", label: t('calculator.materials.nylon.label'), desc: t('calculator.materials.nylon.desc') }
  ];
  
  // Solo qualità FDM
  const QUALITY_OPTIONS = [
    { id: "0.3", label: t('calculator.qualities.fdm.0.3.label'), desc: t('calculator.qualities.fdm.0.3.desc') },
    { id: "0.2", label: t('calculator.qualities.fdm.0.2.label'), desc: t('calculator.qualities.fdm.0.2.desc') },
    { id: "0.1", label: t('calculator.qualities.fdm.0.1.label'), desc: t('calculator.qualities.fdm.0.1.desc') },
    { id: "0.05", label: t('calculator.qualities.fdm.0.05.label'), desc: t('calculator.qualities.fdm.0.05.desc') }
  ];

  // Materiali filtrati per processo laser
  const getFilteredLaserMaterials = () => {
    const cuttingMaterials = [
      "wood_1mm", "wood_2mm", "wood_3mm", "wood_4mm", "wood_5mm", 
      "wood_6mm", "wood_7mm", "wood_8mm", "wood_9mm", "wood_10mm",
      "mdf_1mm", "mdf_2mm", "mdf_3mm", "mdf_4mm", "mdf_5mm",
      "mdf_6mm", "mdf_7mm", "mdf_8mm", "mdf_9mm", "mdf_10mm",
      "acrylic_opaque", "cardboard", "leather", "fabric"
    ];
    
    const engravingMaterials = [
      "wood_3mm", "wood_6mm", "mdf_3mm", "mdf_6mm", 
      "acrylic_transparent", "acrylic_opaque", "cork", "slate",
      "cardboard", "leather", "fabric"
    ];

    if (quality === "cutting") {
      return MATERIALS.laser.filter(mat => cuttingMaterials.includes(mat.id));
    } else if (quality.includes("engraving")) {
      return MATERIALS.laser.filter(mat => engravingMaterials.includes(mat.id));
    } else {
      return MATERIALS.laser; // cutting_engraving mostra tutti
    }
  };
  
  // Opzioni di riempimento (infill)
  const INFILL_OPTIONS = [
    { id: "10", label: "10%" },
    { id: "20", label: "20%" },
    { id: "30", label: "30%" },
    { id: "40", label: "40%" },
    { id: "50", label: "50%" },
    { id: "60", label: "60%" },
    { id: "70", label: "70%" },
    { id: "80", label: "80%" },
    { id: "90", label: "90%" },
    { id: "100", label: "100%" }
  ];
  
  // Opzioni di quantità
  const QUANTITY_OPTIONS = [
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "5", label: "5" },
    { id: "10", label: "10" },
    { id: "20", label: "20" },
    { id: "50", label: "50" },
    { id: "100", label: "100" }
  ];

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
      setError(t('calculator.fileTooBig', { maxSize: Math.round(MAX_FILE_SIZE/1024/1024) }));
        setIsLoading(false);
        return;
      }
      
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    
    // Solo formati FDM supportati
    const supportedFormats = ["stl", "obj", "3mf"];
    
    if (!supportedFormats.includes(ext)) {
      setError(t('calculator.unsupportedFormat', { formats: "STL, OBJ, 3MF" }));
      setIsLoading(false);
      return;
    }
    
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
      setQuality("0.2");  // Default per FDM
      setMaterial("pla");  // Default per FDM
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
            description: `Prezzo per pezzo: ${sp.toFixed(2)} CHF | Totale ${quantity} pezzi: ${detailedCalc.prezzoFinaleTotale.toFixed(2)} CHF | Sconto: ${detailedCalc.scontoApplicabile}%`,
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
    const totalPrice = (singlePrice * quantity) - discount;

    // Assicurati che il totale non scenda sotto il prezzo minimo
    if (totalPrice < MIN_PRICE) {
      return MIN_PRICE;
    }
    return totalPrice;
  };

  // Messaggio: se singlePrice < 15 e singlePrice * quantity < 15 => avviso
  const isBelowMin = () => {
    if (singlePrice == null) return false;
    if (singlePrice >= MIN_PRICE) return false;
    const sub = singlePrice * quantity;
    return sub < MIN_PRICE;
  };

  const totalPrice = getTotal();

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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
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
                          Formati supportati: {
                            printType === 'laser' 
                              ? 'SVG, DXF, AI, PDF' 
                              : 'STL, OBJ, 3MF'
                          }
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
                accept={printType === 'laser' ? '.svg,.dxf,.ai,.pdf' : '.stl,.obj,.3mf'}
                className="hidden"
              />
            </div>
            
            {/* Print Settings Section con tab sempre visibili */}
            <div>
              <div className="space-y-6">
                {/* Qualità di stampa */}
                <div>
                  <Label className="block mb-2">{t('calculator.selectQuality')}</Label>
                  <Select 
                    value={quality} 
                    onValueChange={setQuality}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('calculator.selectQuality')} />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_OPTIONS.map(option => (
                        <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    {QUALITY_OPTIONS.find(q => q.id === quality)?.desc}
                  </p>
                </div>
                  
                  {/* Materiale */}
                      <div>
                    <Label className="block mb-2">{t('calculator.material')}</Label>
                    <Select 
                      value={material} 
                      onValueChange={setMaterial}
                    >
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('calculator.material')} />
                          </SelectTrigger>
                          <SelectContent>
                        {MATERIALS.map(mat => (
                          <SelectItem key={mat.id} value={mat.id}>{mat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    <p className="text-sm text-gray-500 mt-2">
                      {MATERIALS.find(m => m.id === material)?.desc}
                    </p>
                    </div>
                    
                    {/* Infill */}
                    <div>
                      <Label className="block mb-2">{t('calculator.infill')}</Label>
                      <Select 
                        value={infill} 
                        onValueChange={setInfill}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('calculator.infill')} />
                            </SelectTrigger>
                            <SelectContent>
                          {INFILL_OPTIONS.map(option => (
                            <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      <p className="text-sm text-gray-500 mt-2">
                        Percentuale di riempimento interno del modello
                      </p>
                    </div>

                  {/* Quantità */}
                  <div>
                    <Label className="block mb-2">{t('calculator.quantity')}</Label>
                    <Select 
                      value={quantity.toString()} 
                      onValueChange={(val) => setQuantity(parseInt(val))}
                    >
                      <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('calculator.quantity')} />
                          </SelectTrigger>
                          <SelectContent>
                        {QUANTITY_OPTIONS.map(option => (
                          <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    
                  {/* Bottone calcola preventivo solo se non c'è già un preventivo calcolato */}
                  {!preventivoDone && (
                    <Button 
                      onClick={handleCalculate}
                      disabled={!file || isProcessing}
                      className="w-full relative overflow-hidden"
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
                </div>
              
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
                <p className="text-5xl font-bold text-brand-accent mb-4">{totalPrice.toFixed(2)} CHF</p>
                
                {isBelowMin() && (
                  <p className="text-sm text-yellow-600 mt-3">
                    {t('calculator.singlePieceCost', { minPrice: MIN_PRICE })}
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
