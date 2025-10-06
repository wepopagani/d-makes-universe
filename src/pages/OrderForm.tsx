import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/firebase/AuthContext';
import { db, storage } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileInfo, OrderItem, ShippingAddress } from '@/types/user';
import { sendAdminNotificationEmail } from '@/utils/emailService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Funzione per generare numero d'ordine numerico corto
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  // Prende le ultime 6 cifre del timestamp e aggiunge 2 cifre random
  const shortTimestamp = timestamp.slice(-6);
  const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return shortTimestamp + randomDigits;
};

const OrderForm = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [orderName, setOrderName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [material, setMaterial] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [resolution, setResolution] = useState<string>('0.2mm');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);
  
  // Nuovi stati per tipo di stampa e qualità
  const [printType, setPrintType] = useState<string>('fdm');
  const [quality, setQuality] = useState<string>('0.2');
  const [hollowed, setHollowed] = useState<string>('no');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    nome: '',
    cognome: '',
    indirizzo: '',
    citta: '',
    cap: '',
    telefono: '',
    deliveryMethod: 'shipping'
  });
  
  // Stato per tracciare se arriviamo dal preventivo
  const [fromQuoteCalculator, setFromQuoteCalculator] = useState<boolean>(false);
  const [quoteParams, setQuoteParams] = useState<any>(null);
  
  // Stato per tracciare se stiamo caricando un file dal preventivo
  const [uploadingQuoteFile, setUploadingQuoteFile] = useState<boolean>(false);
  const [quoteFileError, setQuoteFileError] = useState<string | null>(null);
  
  // Stato per il metodo di pagamento
  const [paymentMethod, setPaymentMethod] = useState<string>('pickup');
  
  // Materiali disponibili
  const materials = [
    { id: 'pla', name: 'PLA' },
    { id: 'petg', name: 'PETG' },
    { id: 'abs', name: 'ABS' },
    { id: 'tpu', name: 'TPU Flessibile' },
    { id: 'wood', name: 'Wood Fill (Legno)' },
    { id: 'carbon', name: 'Carbon Fiber' },
    { id: 'metal', name: 'Metal Fill' },
    { id: 'glow', name: 'Glow in the Dark' },
    { id: 'transparent', name: 'Trasparente' },
    { id: 'silk', name: 'Silk PLA' },
    { id: 'marble', name: 'Marble PLA' },
    { id: 'resina_standard', name: 'Resina Standard' },
    { id: 'resina_tough', name: 'Resina Resistente' },
    { id: 'resina_flexible', name: 'Resina Flessibile' },
    { id: 'resina_clear', name: 'Resina Trasparente' }
  ];
  
  // Colori disponibili
  const colors = [
    { id: 'bianco', name: 'Bianco' },
    { id: 'nero', name: 'Nero' },
    { id: 'rosso', name: 'Rosso' },
    { id: 'blu', name: 'Blu' },
    { id: 'verde', name: 'Verde' },
    { id: 'giallo', name: 'Giallo' },
    { id: 'arancione', name: 'Arancione' },
    { id: 'grigio', name: 'Grigio' }
  ];
  
  // Risoluzioni disponibili
  const resolutions = [
    { id: '0.1mm', name: '0.1mm (Alta qualità)' },
    { id: '0.2mm', name: '0.2mm (Standard)' },
    { id: '0.3mm', name: '0.3mm (Economico)' }
  ];
  
  // Tipi di stampa disponibili
  const printTypes = [
    { id: 'fdm', name: 'FDM (Stampa a filo)' },
    { id: 'sla', name: 'SLA (Resina)' }
  ];
  
  // Qualità di stampa per tipo
  const qualityOptions = {
    fdm: [
      { id: '0.1', name: '0.1mm (Alta qualità)', desc: 'Massima precisione, tempi più lunghi' },
      { id: '0.2', name: '0.2mm (Standard)', desc: 'Buon compromesso qualità/velocità' },
      { id: '0.3', name: '0.3mm (Veloce)', desc: 'Stampa rapida, qualità standard' }
    ],
    sla: [
      { id: '10', name: '10 micron (Ultra fine)', desc: 'Dettagli estremi, per miniature' },
      { id: '25', name: '25 micron (Alta qualità)', desc: 'Ottima per dettagli fini' },
      { id: '50', name: '50 micron (Standard)', desc: 'Buona qualità generale' },
      { id: '100', name: '100 micron (Veloce)', desc: 'Stampa rapida, buona qualità' }
    ]
  };
  
  // Materiali per tipo di stampa
  const materialsByType = {
    fdm: [
      { id: 'pla', name: 'PLA' },
      { id: 'petg', name: 'PETG' },
      { id: 'abs', name: 'ABS' },
      { id: 'tpu', name: 'TPU Flessibile' },
      { id: 'wood', name: 'Wood Fill (Legno)' },
      { id: 'carbon', name: 'Carbon Fiber' },
      { id: 'metal', name: 'Metal Fill' },
      { id: 'glow', name: 'Glow in the Dark' },
      { id: 'transparent', name: 'Trasparente' },
      { id: 'silk', name: 'Silk PLA' },
      { id: 'marble', name: 'Marble PLA' }
    ],
    sla: [
      { id: 'resina_standard', name: 'Resina Standard' },
      { id: 'resina_tough', name: 'Resina Resistente' },
      { id: 'resina_flexible', name: 'Resina Flessibile' },
      { id: 'resina_clear', name: 'Resina Trasparente' }
    ]
  };
  
  // Opzioni per hollowed (solo SLA)
  const hollowedOptions = [
    { id: 'no', name: 'No', desc: 'Stampa solida completa' },
    { id: 'vuoto', name: 'Sì vuoto', desc: 'Stampa vuota all\'interno per risparmiare resina' },
    { id: 'riempimento', name: 'Sì con riempimento', desc: 'Stampa vuota con supporti interni' }
  ];
  
  // Aggiorna il nome dell'ordine quando cambia il file selezionato
  useEffect(() => {
    if (selectedFile && files.length > 0) {
      const selectedFileInfo = files.find(f => f.id === selectedFile);
      if (selectedFileInfo && !orderName) {
        setOrderName(selectedFileInfo.name.replace(/\.(stl|obj|3mf|gltf|glb)$/i, ''));
      }
    }
  }, [selectedFile, files, orderName]);
  
  // Gestisce il cambio di tipo di stampa
  useEffect(() => {
    // Reset materiale e qualità quando cambia il tipo di stampa
    const availableMaterials = materialsByType[printType as keyof typeof materialsByType];
    const availableQualities = qualityOptions[printType as keyof typeof qualityOptions];
    
    // Se il materiale corrente non è disponibile per il nuovo tipo, resetta
    if (!availableMaterials.find(m => m.id === material)) {
      setMaterial(availableMaterials[0]?.id || '');
    }
    
    // Se la qualità corrente non è disponibile per il nuovo tipo, resetta
    if (!availableQualities.find(q => q.id === quality)) {
      setQuality(availableQualities[1]?.id || availableQualities[0]?.id || '0.2');
    }
    
    // Reset hollowed quando si cambia tipo di stampa
    if (printType === 'fdm') {
      setHollowed('no'); // FDM non usa hollowed
    } else {
      setHollowed('no'); // Default per SLA
    }
  }, [printType]);
  
  // Carica i file dell'utente
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Pre-popola l'indirizzo di spedizione se disponibile
    if (userData) {
      setShippingAddress({
        nome: userData.nome || '',
        cognome: userData.cognome || '',
        indirizzo: userData.indirizzo || '',
        citta: userData.citta || '',
        cap: userData.cap || '',
        telefono: userData.telefono || ''
      });
    }
    
    // Controlla se ci sono parametri dall'URL (arrivo dal calcolatore preventivi)
    const params = new URLSearchParams(location.search);
    const hasQuoteParams = params.get('fromQuote') === 'true';
    
    if (hasQuoteParams) {
      setFromQuoteCalculator(true);
      
      // Tenta di recuperare lo stato completo del preventivo dalla sessionStorage
      const quoteStateJson = sessionStorage.getItem('quoteState');
      let quoteState = null;
      
      if (quoteStateJson) {
        try {
          quoteState = JSON.parse(quoteStateJson);
          console.log("Stato preventivo recuperato:", quoteState);
        } catch (e) {
          console.error("Errore nel parsing dello stato del preventivo:", e);
        }
      }
      
      // Se lo stato completo non è disponibile, usa i parametri URL
      if (!quoteState) {
        quoteState = {
          fileId: params.get('fileId') || '',
          fileName: params.get('fileName') || '',
          material: params.get('material') || '',
          quantity: parseInt(params.get('quantity') || '1'),
          printType: params.get('printType') || 'fdm',
          quality: params.get('quality') || '0.2',
          infill: params.get('infill') || '20',
          price: parseFloat(params.get('price') || '0')
        };
      }
      
      setQuoteParams(quoteState);
      
      // Preseleziona alcuni parametri
      setQuantity(quoteState.quantity);
      
      // Imposta il tipo di stampa
      if (quoteState.printType) {
        setPrintType(quoteState.printType);
      }
      
      // Imposta la qualità
      if (quoteState.quality) {
        setQuality(quoteState.quality);
      }
      
      // Converti il materiale del preventivo al formato del form
      if (quoteState.material) {
        setMaterial(quoteState.material);
      }
      
      // Aggiungi una nota che menziona il preventivo calcolato
      const qualityUnit = quoteState.printType === 'sla' ? ' micron' : 'mm';
      setNotes(`Preventivo calcolato: ${quoteState.price.toFixed(2)} CHF - Tipo stampa: ${quoteState.printType.toUpperCase()}, Qualità: ${quoteState.quality}${qualityUnit}${quoteState.printType === 'fdm' ? `, Infill: ${quoteState.infill}%` : ''}`);
      
      // Preseleziona un colore predefinito in base al materiale
      const materialColorMap: { [key: string]: string } = {
        'pla': 'bianco',
        'petg': 'nero',
        'abs': 'nero',
        'tpu': 'nero',
        'resina_standard': 'bianco',
        'resina_tough': 'grigio',
        'resina_flexible': 'bianco',
        'resina_clear': 'trasparente'
      };
      
      setColor(materialColorMap[quoteState.material] || 'bianco');
    }
    
    fetchUserFiles();
  }, [currentUser, userData, location.search]);
  
  // Funzione modificata per recuperare i file dell'utente
  const fetchUserFiles = async () => {
    if (!currentUser) return;
    
    try {
      setLoadingFiles(true);
      console.log("Recupero file dell'utente...");
      
      // Controlla se stiamo arrivando dal preventivo
      const params = new URLSearchParams(location.search);
      const fileIdFromUrl = params.get('fileId');
      const isFromQuote = params.get('fromQuote') === 'true';
      
      // Ottieni anche l'ID del file dalla sessionStorage (può essere più affidabile)
      const fileIdFromSession = sessionStorage.getItem('quoteFileId');
      
      // Determina quale fileId usare (preferisci quello della sessione)
      const targetFileId = fileIdFromSession || fileIdFromUrl;
      
      // Recupera tutti i file dell'utente
      const filesQuery = query(
        collection(db, 'files'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(filesQuery);
      
      const userFiles: FileInfo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.type === '3d') {
          userFiles.push({
            id: doc.id,
            name: data.originalName || data.name,
            type: data.type,
            url: data.url,
            storagePath: data.storagePath,
            uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
            userId: data.userId
          });
        }
      });
      
      setFiles(userFiles);
      
      // Se veniamo dal calcolatore, tenta di trovare il file
      if (isFromQuote && targetFileId) {
        console.log(`Cerco il file con ID '${targetFileId}' tra ${userFiles.length} file...`);
        
        // 1. Cerca per ID file
        const fileFromId = userFiles.find(f => f.id === targetFileId);
        
        if (fileFromId) {
          console.log("File trovato con ID:", fileFromId.name);
          setSelectedFile(fileFromId.id);
        } else {
          console.log("File non trovato con ID, controllo prima se è stato appena aggiunto");
          
          // Attendiamo un secondo e poi riproviamo a cercare il file (potrebbe esserci un ritardo)
          setTimeout(async () => {
            console.log("Rifacendo la query per cercare il file...");
            const refreshedQuery = query(
              collection(db, 'files'),
              where('userId', '==', currentUser.uid)
            );
            
            const refreshedSnapshot = await getDocs(refreshedQuery);
            const refreshedFiles: FileInfo[] = [];
            
            refreshedSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.type === '3d') {
                refreshedFiles.push({
                  id: doc.id,
                  name: data.originalName || data.name,
                  type: data.type,
                  url: data.url,
                  storagePath: data.storagePath,
                  uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
                  userId: data.userId
                });
              }
            });
            
            // Cerca nuovamente il file
            const foundFileInRefresh = refreshedFiles.find(f => f.id === targetFileId);
            
            if (foundFileInRefresh) {
              console.log("File trovato nel refresh:", foundFileInRefresh.name);
              setFiles(refreshedFiles);
              setSelectedFile(foundFileInRefresh.id);
            } else {
              console.log("File non trovato neanche dopo il refresh, provo a cercarlo per nome");
              
              // 2. Prova con il nome del file
              const fileName = params.get('fileName') || sessionStorage.getItem('quoteFileName');
              
              if (fileName) {
                const fileFromName = refreshedFiles.find(f => 
                  f.name.toLowerCase() === fileName.toLowerCase() ||
                  f.name.toLowerCase().includes(fileName.toLowerCase())
                );
                
                if (fileFromName) {
                  console.log("File trovato tramite nome:", fileFromName.name);
                  setSelectedFile(fileFromName.id);
                } else {
                  // 3. Fallback: prova a caricare nuovamente il file
                  await tryToSyncFileFromServer(targetFileId);
                }
              } else {
                await tryToSyncFileFromServer(targetFileId);
              }
            }
          }, 1000);
        }
      } else if (userFiles.length > 0) {
        // Se non veniamo dal preventivo o non abbiamo un fileId, seleziona il primo file
        setSelectedFile(userFiles[0].id);
      }
    } catch (error) {
      console.error('Errore durante il recupero dei file:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tuoi file 3D.",
        variant: "destructive",
      });
    } finally {
      setLoadingFiles(false);
    }
  };
  
  // Funzione per tentare di sincronizzare un file dal server usando l'ID
  const tryToSyncFileFromServer = async (fileId: string) => {
    if (!currentUser || !fileId) return;
    
    try {
      setUploadingQuoteFile(true);
      console.log("Tentativo di sincronizzazione file dal server con ID:", fileId);
      
      // Controlla se abbiamo i dati del file dalla sessionStorage
      const fileName = sessionStorage.getItem('quoteFileName');
      const fileSize = sessionStorage.getItem('quoteFileSize');
      const quoteStateJson = sessionStorage.getItem('quoteState');
      
      if (!fileName) {
        throw new Error("Nome del file non disponibile");
      }
      
      // Genera un nome di storage sicuro
      const timestamp = Date.now();
      const safeFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `files/${currentUser.uid}/${safeFileName}`;
    
      // Crea un nuovo record nel database per questo file
      const fileData = {
        name: safeFileName,
        originalName: fileName,
        type: '3d',
        // Usiamo un URL temporaneo che dobbiamo aggiornare in seguito
        url: `https://server.3dmakes.ch/files/${fileId}`,
        storagePath: storagePath,
        uploadedAt: Timestamp.now(),
        userId: currentUser.uid,
        sourceFileId: fileId, // Riferimento al file originale
        fromQuote: true
      };
      
      // Aggiungi il documento
      const docRef = await addDoc(collection(db, 'files'), fileData);
      
      // Aggiorna la lista di file per includere il nuovo
      const newFile: FileInfo = {
        id: docRef.id,
        name: fileName,
        type: '3d',
        url: fileData.url,
        storagePath: storagePath,
        uploadedAt: new Date(),
        userId: currentUser.uid
      };
      
      setFiles(prev => [newFile, ...prev]);
      setSelectedFile(docRef.id);
      
      toast({
        title: "File disponibile",
        description: "Il file del preventivo è stato recuperato con successo.",
      });
    } catch (error: any) {
      console.error("Errore durante la sincronizzazione del file:", error);
      setQuoteFileError(`Impossibile recuperare il file: ${error.message || "errore sconosciuto"}`);
    } finally {
      setUploadingQuoteFile(false);
    }
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!selectedFile || !orderName || !material || !color || !resolution) {
      toast({
        title: "Errore",
        description: "Completa tutti i campi richiesti.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Trova le informazioni sul file selezionato
      const fileInfo = files.find(f => f.id === selectedFile);
      
      if (!fileInfo) {
        throw new Error('File non trovato');
      }
      
      // Crea l'elemento dell'ordine
      const orderItem: OrderItem = {
        id: `item_${Date.now()}`,
        fileId: fileInfo.id,
        fileName: fileInfo.name,
        fileUrl: fileInfo.url,
        quantity,
        material,
        color,
        printType,
        quality,
        ...(printType === 'sla' && { hollowed }),
        price: 0, // Il prezzo sarà impostato dall'admin
        notes: notes || ""
      };
      
      // Genera numero d'ordine numerico corto
      const orderNumber = generateOrderNumber();

      // Aggiungi l'ordine a Firestore
      const orderData = {
        orderName: orderName,
        orderNumber: orderNumber, // Numero d'ordine personalizzato
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        items: [orderItem],
        totalAmount: 0, // Il prezzo sarà impostato dall'admin
        paymentStatus: 'da_pagare',
        preferredPaymentMethod: paymentMethod, // Metodo di pagamento preferito
        shippingAddress: {
          nome: shippingAddress.nome || "",
          cognome: shippingAddress.cognome || "",
          indirizzo: shippingAddress.indirizzo || "",
          citta: shippingAddress.citta || "",
          cap: shippingAddress.cap || "",
          telefono: shippingAddress.telefono || "",
          deliveryMethod: shippingAddress.deliveryMethod
        }
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Invia solo notifica admin del nuovo ordine (non email al cliente)
      try {
        await sendAdminNotificationEmail({
          type: 'new_order',
          details: `Nuovo ordine ricevuto: ${orderName}`,
          userInfo: `Cliente: ${userData?.nome || ''} ${userData?.cognome || ''} (${currentUser.email})`
        });
      } catch (emailError) {
        console.error('Errore nell\'invio della notifica admin:', emailError);
        // Non blocchiamo il processo se l'email fallisce
      }
      
      toast({
        title: "Ordine inviato",
        description: "Il tuo ordine è stato creato con successo. Ti contatteremo presto.",
      });
      
      // Reindirizza alla dashboard degli ordini
      navigate('/dashboard/ordini');
    } catch (error: any) {
      console.error('Errore durante la creazione dell\'ordine:', error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Nuovo Ordine</h1>
          
          {/* Banner informativo quando si arriva dal calcolatore di preventivi */}
          {fromQuoteCalculator && quoteParams && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Stai creando un ordine dal preventivo calcolato. Il file <strong>{quoteParams.fileName}</strong> è stato preselezionato.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Prezzo preventivato: <strong>{quoteParams.price} CHF</strong>
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/calculator">Torna al preventivo</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Messaggio di errore del file */}
          {quoteFileError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {quoteFileError}
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/file">Carica un nuovo file</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loadingFiles || uploadingQuoteFile ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
            </div>
          ) : files.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Nessun modello 3D disponibile</CardTitle>
                <CardDescription>
                  Per creare un ordine, devi prima caricare un modello 3D nell'area clienti.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <a href="/dashboard">Vai all'area clienti</a>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Dettagli Stampa</CardTitle>
                    <CardDescription>
                      Seleziona il modello e le opzioni di stampa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Modello 3D</Label>
                      <Select value={selectedFile} onValueChange={setSelectedFile}>
                        <SelectTrigger id="file">
                          <SelectValue placeholder="Seleziona un modello" />
                        </SelectTrigger>
                        <SelectContent>
                          {files.map(file => (
                            <SelectItem key={file.id} value={file.id}>
                              {file.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orderName">Nome Ordine</Label>
                      <Input
                        id="orderName"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder="Inserisci un nome per questo ordine"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Questo nome ti aiuterà a identificare l'ordine
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="printType">Tipo di Stampa</Label>
                      <Select value={printType} onValueChange={setPrintType}>
                        <SelectTrigger id="printType">
                          <SelectValue placeholder="Seleziona tipo di stampa" />
                        </SelectTrigger>
                        <SelectContent>
                          {printTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {printType === 'fdm' ? 'Stampa a deposizione di filamento, ideale per prototipi e oggetti funzionali' : 'Stampa in resina, perfetta per dettagli fini e superfici lisce'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality">Qualità di Stampa</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger id="quality">
                          <SelectValue placeholder="Seleziona qualità" />
                        </SelectTrigger>
                        <SelectContent>
                          {qualityOptions[printType as keyof typeof qualityOptions].map(qual => (
                            <SelectItem key={qual.id} value={qual.id}>
                              {qual.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {qualityOptions[printType as keyof typeof qualityOptions].find(q => q.id === quality)?.desc}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="material">Materiale</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material">
                          <SelectValue placeholder="Seleziona un materiale" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialsByType[printType as keyof typeof materialsByType].map(mat => (
                            <SelectItem key={mat.id} value={mat.id}>
                              {mat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Opzione Hollowed solo per SLA */}
                    {printType === 'sla' && (
                      <div className="space-y-2">
                        <Label htmlFor="hollowed">Hollowed (Bucato)</Label>
                        <Select value={hollowed} onValueChange={setHollowed}>
                          <SelectTrigger id="hollowed">
                            <SelectValue placeholder="Seleziona opzione hollowed" />
                          </SelectTrigger>
                          <SelectContent>
                            {hollowedOptions.map(option => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          {hollowedOptions.find(h => h.id === hollowed)?.desc}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Colore</Label>
                      <Select value={color} onValueChange={setColor}>
                        <SelectTrigger id="color">
                          <SelectValue placeholder="Seleziona un colore" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map(col => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantità</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Note aggiuntive</Label>
                      <Textarea
                        id="notes"
                        placeholder="Istruzioni speciali per la stampa..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Modalità di Consegna</CardTitle>
                      <CardDescription>
                        Scegli come ricevere la tua stampa 3D
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="pickup"
                            name="deliveryMethod"
                            value="pickup"
                            checked={shippingAddress.deliveryMethod === 'pickup'}
                            onChange={(e) => setShippingAddress({...shippingAddress, deliveryMethod: e.target.value as 'pickup' | 'shipping'})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor="pickup" className="text-sm font-medium">
                            🏪 Ritiro in negozio (gratuito)
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Ritira direttamente presso il nostro laboratorio
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="shipping"
                            name="deliveryMethod"
                            value="shipping"
                            checked={shippingAddress.deliveryMethod === 'shipping'}
                            onChange={(e) => setShippingAddress({...shippingAddress, deliveryMethod: e.target.value as 'pickup' | 'shipping'})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor="shipping" className="text-sm font-medium">
                            📦 Spedizione a domicilio
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Spedizione via posta (costi aggiuntivi da definire)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {shippingAddress.deliveryMethod === 'shipping' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Indirizzo di Spedizione</CardTitle>
                      <CardDescription>
                        Dove vuoi ricevere la tua stampa 3D
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome</Label>
                          <Input
                            id="nome"
                            value={shippingAddress.nome}
                            onChange={(e) => setShippingAddress({...shippingAddress, nome: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cognome">Cognome</Label>
                          <Input
                            id="cognome"
                            value={shippingAddress.cognome}
                            onChange={(e) => setShippingAddress({...shippingAddress, cognome: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="indirizzo">Indirizzo</Label>
                        <Input
                          id="indirizzo"
                          value={shippingAddress.indirizzo}
                          onChange={(e) => setShippingAddress({...shippingAddress, indirizzo: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="citta">Città</Label>
                          <Input
                            id="citta"
                            value={shippingAddress.citta}
                            onChange={(e) => setShippingAddress({...shippingAddress, citta: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cap">CAP</Label>
                          <Input
                            id="cap"
                            value={shippingAddress.cap}
                            onChange={(e) => setShippingAddress({...shippingAddress, cap: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Telefono</Label>
                        <Input
                          id="telefono"
                          value={shippingAddress.telefono}
                          onChange={(e) => setShippingAddress({...shippingAddress, telefono: e.target.value})}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                  )}

                  {shippingAddress.deliveryMethod === 'pickup' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Dati di Contatto</CardTitle>
                        <CardDescription>
                          Informazioni per il ritiro in negozio
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome-pickup">Nome</Label>
                            <Input
                              id="nome-pickup"
                              value={shippingAddress.nome}
                              onChange={(e) => setShippingAddress({...shippingAddress, nome: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cognome-pickup">Cognome</Label>
                            <Input
                              id="cognome-pickup"
                              value={shippingAddress.cognome}
                              onChange={(e) => setShippingAddress({...shippingAddress, cognome: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="telefono-pickup">Telefono</Label>
                          <Input
                            id="telefono-pickup"
                            value={shippingAddress.telefono}
                            onChange={(e) => setShippingAddress({...shippingAddress, telefono: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2">📍 Indirizzo Laboratorio</h4>
                          <p className="text-blue-700 text-sm">
                            3DMakes<br/>
                                            Via Cantonale 15<br/>
                6918 Lugano, Svizzera<br/>
                            Tel: +41 76 266 03 96
                          </p>
                          <p className="text-blue-600 text-xs mt-2">
                            Ti contatteremo per concordare l'orario di ritiro
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Metodo di Pagamento</CardTitle>
                      <CardDescription>
                        Scegli come vuoi pagare il tuo ordine
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="payment-pickup"
                            name="paymentMethod"
                            value="pickup"
                            checked={paymentMethod === 'pickup'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor="payment-pickup" className="text-sm font-medium">
                            💰 Pagamento al ritiro
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Paga in contanti o con carta al momento del ritiro
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="payment-twint"
                            name="paymentMethod"
                            value="twint"
                            checked={paymentMethod === 'twint'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor="payment-twint" className="text-sm font-medium">
                            📱 Twint
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Pagamento immediato con l'app Twint (disponibile anche per ritiro in negozio)
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="payment-card"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor="payment-card" className="text-sm font-medium">
                            💳 Carta di Credito/Debito
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Carta, Apple Pay, Google Pay tramite SumUp (disponibile anche per ritiro in negozio)
                        </p>
                      </div>
                      
                      {shippingAddress.deliveryMethod === 'pickup' && paymentMethod === 'pickup' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">ℹ️ Pagamento al Ritiro</h4>
                          <p className="text-yellow-700 text-sm">
                            Il pagamento avverrà direttamente al momento del ritiro. 
                            Potrai pagare in contanti o con carta direttamente in negozio.
                          </p>
                        </div>
                      )}
                      
                      {shippingAddress.deliveryMethod === 'pickup' && paymentMethod !== 'pickup' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">✅ Pagamento Anticipato + Ritiro</h4>
                          <p className="text-green-700 text-sm">
                            {paymentMethod === 'twint' && 
                              "Pagherai in anticipo con Twint e poi ritirerai l'ordine già pagato in negozio."
                            }
                            {paymentMethod === 'card' && 
                              "Pagherai in anticipo con carta/Apple Pay/Google Pay e poi ritirerai l'ordine già pagato in negozio."
                            }
                          </p>
                        </div>
                      )}
                      
                      {paymentMethod !== 'pickup' && shippingAddress.deliveryMethod !== 'pickup' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2">ℹ️ Informazioni Pagamento</h4>
                          <p className="text-blue-700 text-sm">
                            {paymentMethod === 'twint' && 
                              "Dopo l'approvazione del preventivo, riceverai un QR code Twint per completare il pagamento prima della spedizione."
                            }
                            {paymentMethod === 'card' && 
                              "Dopo l'approvazione del preventivo, riceverai un link sicuro SumUp per pagare con carta, Apple Pay o Google Pay prima della spedizione."
                            }
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Riepilogo Ordine</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedFile && orderName && material && color && printType && quality && (
                          <>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Nome Ordine:</span>
                              <span>{orderName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Modello:</span>
                              <span>{files.find(f => f.id === selectedFile)?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Tipo di Stampa:</span>
                              <span>{printTypes.find(t => t.id === printType)?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Qualità:</span>
                              <span>{qualityOptions[printType as keyof typeof qualityOptions].find(q => q.id === quality)?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Materiale:</span>
                              <span>{materialsByType[printType as keyof typeof materialsByType].find(m => m.id === material)?.name}</span>
                            </div>
                            {/* Mostra Hollowed solo per SLA */}
                            {printType === 'sla' && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="font-medium">Hollowed:</span>
                                <span>{hollowedOptions.find(h => h.id === hollowed)?.name}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Colore:</span>
                              <span>{colors.find(c => c.id === color)?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Quantità:</span>
                              <span>{quantity}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="font-medium">Metodo di Pagamento:</span>
                              <span>
                                {paymentMethod === 'pickup' && '💰 Pagamento al ritiro'}
                                {paymentMethod === 'twint' && '📱 Twint'}
                                {paymentMethod === 'card' && '💳 Carta/Apple Pay/Google Pay'}
                              </span>
                            </div>
                            <div className="flex justify-between py-4 text-lg font-semibold">
                              <span>Prezzo:</span>
                              <span>Da definire dall'admin</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Invio in corso...' : 'Invia Ordine'}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderForm; 