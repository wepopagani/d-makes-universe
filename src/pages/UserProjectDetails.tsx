import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, Timestamp, updateDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { sendOrderConfirmationEmail } from "@/utils/emailService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  File, 
  FileText, 
  Calendar, 
  Save, 
  RefreshCw,
  Edit,
  Upload,
  X
} from "lucide-react";
import { Project, FileInfo, ShippingAddress } from "@/types/user";
import { ModelViewerPreventivo } from "@/components/ModelViewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectFileViewer from '@/components/ProjectFileViewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, getCustomDownloadURL } from "@/firebase/config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import InvoiceGenerator from '@/components/InvoiceGenerator';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

// Estendo il tipo Order per includere i nuovi stati
interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'accepted' | 'rejected' | 'replaced';
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';
  shippingAddress: ShippingAddress;
  isOrder?: boolean;
  productionStatus?: string;
}

interface OrderItem {
  id: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  quantity: number;
  material: string;
  notes?: string;
}

// Materials and pricing options (semplificato per gli utenti)
const materials = [
  'PLA', 
  'PETG', 
  'ABS', 
  'TPU Flessibile',
  'Wood Fill (Legno)',
  'Carbon Fiber',
  'Metal Fill',
  'Glow in the Dark',
  'Trasparente',
  'Silk PLA',
  'Marble PLA',
  'Resina Standard',
  'Resina Resistente',
  'Resina Flessibile',
  'Resina Trasparente'
];

const UserProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  
  // Stato per la modifica delle note
  const [isEditNotesDialogOpen, setIsEditNotesDialogOpen] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // New file upload states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for order creation
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
  const [selectedOrderFiles, setSelectedOrderFiles] = useState<string[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: {quantity: number, notes: string}}>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('shipping');
  
  // Stato per la gestione dei preventivi
  const [selectedQuote, setSelectedQuote] = useState<Order | null>(null);
  const [isQuoteResponseDialogOpen, setIsQuoteResponseDialogOpen] = useState(false);
  const [isRequestingNewQuote, setIsRequestingNewQuote] = useState(false);
  const [newQuoteNotes, setNewQuoteNotes] = useState('');
  const [processingQuoteResponse, setProcessingQuoteResponse] = useState(false);
  
  // Nel componente UserProjectDetails aggiungere lo stato per il dialog della fattura
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  
  // Stati per il pagamento
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  
  useEffect(() => {
    const loadProjectData = async () => {
      if (!id || !currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch project
        const projectDoc = await getDoc(doc(db, "projects", id));
        
        if (!projectDoc.exists()) {
          toast({
            title: "Errore",
            description: "Progetto non trovato",
            variant: "destructive"
          });
          navigate("/account", { replace: true });
          return;
        }
        
        const projectData = projectDoc.data();
        
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          paymentStatus: projectData.paymentStatus || 'da_pagare',
          userId: projectData.userId,
          files: projectData.files || [],
          thumbnailUrl: projectData.thumbnailUrl,
          notes: projectData.notes,
          createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate() : new Date(),
          updatedAt: projectData.updatedAt instanceof Timestamp ? projectData.updatedAt.toDate() : new Date(),
          productionStatus: projectData.productionStatus,
        };
        
        setProject(project);
        
        // Fetch project files
        const filesData: FileInfo[] = [];
        
        if (project.files && project.files.length > 0) {
          for (const fileId of project.files) {
            const fileDoc = await getDoc(doc(db, "files", fileId));
            if (fileDoc.exists()) {
              const data = fileDoc.data();
              filesData.push({
                id: fileDoc.id,
                name: data.originalName || data.name,
                type: data.type,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl,
                storagePath: data.storagePath,
                uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
                userId: data.userId
              });
            }
          }
        }
        
        setFiles(filesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [id, navigate, toast, currentUser]);
        
  // Separate useEffect for real-time orders listening
  useEffect(() => {
    if (!id || !currentUser) return;
    
    // Set up real-time listener for orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("projectId", "==", id),
          where("userId", "==", currentUser.uid)
        );
        
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      console.log("Orders updated from Firestore");
        const ordersList: Order[] = [];
        
      snapshot.forEach((doc) => {
          const data = doc.data();
          ordersList.push({
            id: doc.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            items: data.items,
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus,
            shippingAddress: data.shippingAddress,
          isOrder: data.isOrder,
          productionStatus: data.productionStatus,
          });
        });
        
      console.log(`Updated orders list: ${ordersList.length} orders`);
        setOrders(ordersList);
    }, (error) => {
      console.error("Error listening to orders:", error);
    });
    
    // Cleanup function
    return () => {
      console.log("Unsubscribing from orders listener");
      unsubscribe();
    };
  }, [id, currentUser]);
  
  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return "N/D";
    
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  
  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType === "image") {
      return <File className="h-6 w-6 text-blue-500" />;
    } else if (fileType === "3d") {
      return <File className="h-6 w-6 text-green-500" />;
    } else if (fileType === "pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string, productionStatus?: string) => {
    // If we have a production status, it takes precedence
    if (productionStatus) {
      switch (productionStatus) {
        case 'non_iniziato':
          return 'bg-gray-100 text-gray-800';
        case 'in_corso':
          return 'bg-yellow-100 text-yellow-800';
        case 'completato':
          return 'bg-green-100 text-green-800';
        default:
          break;
      }
    }
    
    // Fall back to regular status colors
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status text
  const getStatusText = (status: string, productionStatus?: string) => {
    // If we have a production status, it takes precedence
    if (productionStatus) {
      switch (productionStatus) {
        case 'non_iniziato':
          return 'Da iniziare';
        case 'in_corso':
          return 'In produzione';
        case 'completato':
          return 'Completato';
        default:
          break;
      }
    }
    
    // Fall back to regular status
    switch (status) {
      case 'planning':
        return 'Pianificazione';
      case 'in_progress':
        return 'In corso';
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Annullato';
      default:
        return status;
    }
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "da_pagare":
        return "bg-red-100 text-red-800";
      case "pagato_carta":
        return "bg-green-100 text-green-800";
      case "pagato_contanti":
        return "bg-green-100 text-green-800";
      case "pagato_twint":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get payment status text
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "da_pagare":
        return "Da pagare";
      case "pagato_carta":
        return "Pagato con carta";
      case "pagato_contanti":
        return "Pagato in contanti";
      case "pagato_twint":
        return "Pagato con Twint";
      default:
        return status;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };
  
  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Download file
  const handleDownloadFile = (file: FileInfo) => {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Preview file
  const handlePreviewFile = (file: FileInfo) => {
    window.open(file.url, "_blank");
  };
  
  // Funzione per aggiornare le note
  const handleUpdateNotes = async () => {
    if (!project || !id) return;
    
    try {
      setIsEditing(true);
      
      // Update project in Firestore
      await updateDoc(doc(db, "projects", id), {
        notes: newNotes,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setProject({
        ...project,
        notes: newNotes,
        updatedAt: new Date()
      });
      
      setIsEditNotesDialogOpen(false);
      
      toast({
        title: "Note aggiornate",
        description: "Le note del progetto sono state aggiornate con successo."
      });
    } catch (error) {
      console.error("Error updating project notes:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento delle note",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  // File upload handlers
  const handleFileBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (!project || !id || newFiles.length === 0 || !currentUser) return;
    
    try {
      setIsUploading(true);
      const uploadedFileIds: string[] = [];
      
      // Upload each file
      for (const [index, file] of newFiles.entries()) {
        // Create a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || '';
        const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storagePath = `projects/${project.userId}/${safeFileName}`;
        
        // Upload file
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Create a promise for this upload
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Update progress
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [index]: progress
              }));
            },
            (error) => {
              console.error('Error uploading file:', error);
              reject(error);
            },
            async () => {
              try {
                // Get download URL, using our custom function for STL files
                let downloadURL: string;
                
                if (['stl', 'obj', '3mf', 'gltf', 'glb'].includes(extension.toLowerCase())) {
                  // Use custom method for 3D files
                  downloadURL = await getCustomDownloadURL(storagePath);
                  console.log("Using custom download URL for 3D file:", downloadURL);
                } else {
                  // Use standard method for other files
                  downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                }
                
                // Determine file type
                let fileType: 'image' | '3d' | 'pdf' | 'other' = 'other';
                const fileExt = extension.toLowerCase();
                
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
                  fileType = 'image';
                } else if (['obj', 'stl', 'gltf', 'glb', '3mf'].includes(fileExt)) {
                  fileType = '3d';
                } else if (fileExt === 'pdf') {
                  fileType = 'pdf';
                }
                
                // Add file info to Firestore
                const fileDocRef = await addDoc(collection(db, 'files'), {
                  name: safeFileName,
                  originalName: file.name,
                  type: fileType,
                  url: downloadURL,
                  storagePath,
                  uploadedAt: Timestamp.now(),
                  userId: project.userId,
                  projectId: id
                });
                
                // Add the new file to local state
                const newFileInfo: FileInfo = {
                  id: fileDocRef.id,
                  name: file.name,
                  type: fileType,
                  url: downloadURL,
                  storagePath,
                  uploadedAt: new Date(),
                  userId: project.userId
                };
                
                setFiles(prevFiles => [...prevFiles, newFileInfo]);
                
                // Keep track of uploaded file IDs
                uploadedFileIds.push(fileDocRef.id);
                
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }
      
      // Update the project with the new file IDs
      if (uploadedFileIds.length > 0) {
        const updatedFiles = [...(project.files || []), ...uploadedFileIds];
        
        await updateDoc(doc(db, "projects", id), {
          files: updatedFiles,
          updatedAt: Timestamp.now()
        });
        
        // Update local state
        setProject({
          ...project,
          files: updatedFiles,
          updatedAt: new Date()
        });
      }
      
      setIsUploadDialogOpen(false);
      setNewFiles([]);
      setUploadProgress({});
      
      toast({
        title: "File caricati",
        description: `${uploadedFileIds.length} file caricati con successo.`
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento dei file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to handle order creation
  const handleCreateOrder = async () => {
    if (!project || !id || !currentUser || selectedOrderFiles.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un file per creare un ordine",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingOrder(true);

      // Create order items from selected files
      const orderItemsList = selectedOrderFiles.map(fileId => {
        const file = files.find(f => f.id === fileId);
        if (!file) return null;

        const itemConfig = orderItems[fileId] || { quantity: 1, notes: "" };
        
        return {
          id: `item_${Date.now()}_${fileId}`,
          fileId: fileId,
          fileName: file.name,
          fileUrl: file.url,
          quantity: itemConfig.quantity,
          material: selectedMaterial,
          notes: itemConfig.notes
        };
      }).filter(Boolean);

      // Create empty shipping address with required fields
      const emptyShippingAddress: ShippingAddress = {
        nome: "",
        cognome: "",
        indirizzo: "",
        citta: "",
        cap: "",
        telefono: "",
        deliveryMethod: deliveryMethod
      };

      // Create the order in Firestore
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        projectId: id,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        items: orderItemsList,
        totalAmount: 0, // Sarà calcolato dall'admin
        paymentStatus: 'pending',
        shippingAddress: emptyShippingAddress,
        productionStatus: 'non_iniziato'
      };

      const orderDoc = await addDoc(collection(db, 'orders'), orderData);

      // Add the new order to the local state
      const newOrder: Order = {
        id: orderDoc.id,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: orderItemsList as any,
        totalAmount: 0,
        paymentStatus: 'pending',
        shippingAddress: emptyShippingAddress,
        productionStatus: 'non_iniziato'
      };

      setOrders(prev => [...prev, newOrder]);
      setIsCreateOrderDialogOpen(false);
      setSelectedOrderFiles([]);
      setOrderItems({});

      toast({
        title: "Ordine creato",
        description: "La tua richiesta di preventivo è stata inviata con successo. Verrai contattato presto per i dettagli.",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione dell'ordine",
        variant: "destructive"
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Function to toggle file selection for order
  const toggleFileSelection = (fileId: string) => {
    setSelectedOrderFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });

    // Initialize order item config if not exists
    if (!orderItems[fileId]) {
      setOrderItems(prev => ({
        ...prev,
        [fileId]: { quantity: 1, notes: "" }
      }));
    }
  };

  // Function to update order item quantity
  const updateOrderItemQuantity = (fileId: string, quantity: number) => {
    setOrderItems(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], quantity }
    }));
  };

  // Function to update order item notes
  const updateOrderItemNotes = (fileId: string, notes: string) => {
    setOrderItems(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], notes }
    }));
  };
  
  // Aggiungo funzioni per gestione dei file
  const handleFileUpdated = (updatedFile: FileInfo) => {
    setFiles(prevFiles => prevFiles.map(file => 
      file.id === updatedFile.id ? updatedFile : file
    ));
  };

  const handleFileDeleted = async (fileId: string) => {
    try {
      // Aggiorna l'array dei file nel progetto
      if (project) {
        const updatedFileIds = project.files.filter(id => id !== fileId);
        
        // Aggiorna il database
        await updateDoc(doc(db, "projects", id), {
          files: updatedFileIds,
          updatedAt: Timestamp.now()
        });
        
        // Aggiorna lo stato locale
        setProject({
          ...project,
          files: updatedFileIds,
          updatedAt: new Date()
        });
        
        // Rimuovi il file dalla lista dei file locale
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        
        toast({
          title: "File eliminato",
          description: "Il file è stato eliminato con successo."
        });
      }
    } catch (error) {
      console.error("Error removing file from project:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del file",
        variant: "destructive"
      });
    }
  };
  
  // Funzione per visualizzare il dialog di risposta al preventivo
  const handleViewQuoteResponse = (order: Order) => {
    setSelectedQuote(order);
    setIsQuoteResponseDialogOpen(true);
  };
  
  // Funzione per accettare il preventivo
  const handleAcceptQuote = async () => {
    if (!selectedQuote || !currentUser || !project) return;
    
    try {
      setProcessingQuoteResponse(true);
      
      // Aggiorna lo stato del preventivo in Firestore
      await updateDoc(doc(db, 'orders', selectedQuote.id), {
        status: 'accepted',
        isOrder: true, // Ora è un ordine effettivo
        productionStatus: 'non_iniziato', // Imposta stato di produzione iniziale
        updatedAt: Timestamp.now()
      });
      
      // Aggiorna lo stato locale
      const updatedOrder: Order = {
        ...selectedQuote,
        status: 'accepted',
        isOrder: true,
        productionStatus: 'non_iniziato',
        updatedAt: new Date()
      };
      
      setOrders(prev => 
        prev.map(order => order.id === selectedQuote.id ? updatedOrder : order)
      );
      
      // Invia email di conferma ordine
      try {
        await sendOrderConfirmationEmail({
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || currentUser.email || 'Cliente',
          orderId: selectedQuote.id,
          orderDetails: `Progetto: ${project.name} - ${selectedQuote.items.length} articoli`,
          totalPrice: selectedQuote.totalAmount,
          estimatedDelivery: '7-10 giorni lavorativi'
        });
        
        console.log('Email di conferma ordine inviata con successo');
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email di conferma:', emailError);
        // Non blocchiamo il processo se l'email fallisce
      }
      
      setIsQuoteResponseDialogOpen(false);
      setSelectedQuote(null);
      
      toast({
        title: "Preventivo accettato",
        description: "Hai accettato il preventivo. Il tuo ordine è stato confermato e riceverai una email di conferma.",
      });
    } catch (error) {
      console.error("Error accepting quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'accettazione del preventivo",
        variant: "destructive"
      });
    } finally {
      setProcessingQuoteResponse(false);
    }
  };
  
  // Funzione per rifiutare il preventivo
  const handleDeclineQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      setProcessingQuoteResponse(true);
      
      // Aggiorna lo stato del preventivo in Firestore
      await updateDoc(doc(db, 'orders', selectedQuote.id), {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });
      
      // Aggiorna lo stato locale
      const updatedOrder: Order = {
        ...selectedQuote,
        status: 'rejected',
        updatedAt: new Date()
      };
      
      setOrders(prev => 
        prev.map(order => order.id === selectedQuote.id ? updatedOrder : order)
      );
      
      setIsQuoteResponseDialogOpen(false);
      setSelectedQuote(null);
      
      toast({
        title: "Preventivo rifiutato",
        description: "Hai rifiutato il preventivo.",
      });
    } catch (error) {
      console.error("Error declining quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il rifiuto del preventivo",
        variant: "destructive"
      });
    } finally {
      setProcessingQuoteResponse(false);
    }
  };
  
  // Funzione per richiedere un nuovo preventivo
  const handleRequestNewQuote = async () => {
    if (!selectedQuote || !id || !currentUser) return;
    
    try {
      setProcessingQuoteResponse(true);
      
      // Crea una nuova richiesta basata sulla precedente, ma con le nuove note
      const previousItems = selectedQuote.items;
      
      // Create the new order in Firestore
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        projectId: id,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        items: previousItems,
        totalAmount: 0,
        paymentStatus: 'pending',
        notes: newQuoteNotes,
        previousQuoteId: selectedQuote.id
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Aggiorna lo stato del vecchio preventivo
      await updateDoc(doc(db, 'orders', selectedQuote.id), {
        status: 'replaced',
        updatedAt: Timestamp.now()
      });
      
      // Ricarica i dati del progetto
      try {
        setLoading(true);
        
        // Fetch project
        const projectDoc = await getDoc(doc(db, "projects", id));
        
        if (!projectDoc.exists()) {
          toast({
            title: "Errore",
            description: "Progetto non trovato",
            variant: "destructive"
          });
          navigate("/account", { replace: true });
          return;
        }
        
        const projectData = projectDoc.data();
        
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          paymentStatus: projectData.paymentStatus || 'da_pagare',
          userId: projectData.userId,
          files: projectData.files || [],
          thumbnailUrl: projectData.thumbnailUrl,
          notes: projectData.notes,
          createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate() : new Date(),
          updatedAt: projectData.updatedAt instanceof Timestamp ? projectData.updatedAt.toDate() : new Date(),
          productionStatus: projectData.productionStatus,
        };
        
        setProject(project);
        
        // Fetch project files
        const filesData: FileInfo[] = [];
        
        if (project.files && project.files.length > 0) {
          for (const fileId of project.files) {
            const fileDoc = await getDoc(doc(db, "files", fileId));
            if (fileDoc.exists()) {
              const data = fileDoc.data();
              filesData.push({
                id: fileDoc.id,
                name: data.originalName || data.name,
                type: data.type,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl,
                storagePath: data.storagePath,
                uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
                userId: data.userId
              });
            }
          }
        }
        
        setFiles(filesData);
        
        // Fetch orders related to this project
        const ordersQuery = query(
          collection(db, "orders"),
          where("projectId", "==", id),
          where("userId", "==", currentUser.uid)
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = [];
        
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          ordersList.push({
            id: doc.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            items: data.items,
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus,
            shippingAddress: data.shippingAddress,
            isOrder: data.isOrder,
            productionStatus: data.productionStatus,
          });
        });
        
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
      
      setIsQuoteResponseDialogOpen(false);
      setSelectedQuote(null);
      setNewQuoteNotes('');
      setIsRequestingNewQuote(false);
      
      toast({
        title: "Nuova richiesta inviata",
        description: "La tua nuova richiesta di preventivo è stata inviata.",
      });
    } catch (error) {
      console.error("Error requesting new quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la richiesta del nuovo preventivo",
        variant: "destructive"
      });
    } finally {
      setProcessingQuoteResponse(false);
    }
  };
  
  // Aggiungi funzione per ottenere la percentuale di avanzamento in base allo stato
  const getProductionProgress = (productionStatus?: string) => {
    if (!productionStatus) return 0;
    
    switch (productionStatus) {
      case 'non_iniziato':
        return 5;
      case 'in_corso':
        return 50;
      case 'completato':
        return 100;
      default:
        return 0;
    }
  };

  // Funzione per aprire il dialog di pagamento
  const handleOpenPaymentDialog = (order: Order) => {
    setSelectedOrderForPayment(order);
    setIsPaymentDialogOpen(true);
  };

  // Funzione per aggiornare il pagamento
  const handlePaymentUpdate = async (paymentMethod: string) => {
    if (!selectedOrderForPayment) return;
    
    try {
      // Mappa il metodo di pagamento al formato corretto
      let paymentStatus = 'da_pagare';
      switch (paymentMethod) {
        case 'pagato_twint':
          paymentStatus = 'pagato_twint';
          break;
        case 'pagato_carta':
          paymentStatus = 'pagato_carta';
          break;
        case 'pagato_contanti':
          paymentStatus = 'pagato_contanti';
          break;
        default:
          paymentStatus = 'da_pagare';
      }
      
      // Aggiorna in Firestore
      await updateDoc(doc(db, 'orders', selectedOrderForPayment.id), {
        paymentStatus: paymentStatus,
        updatedAt: Timestamp.now()
      });
      
      // Aggiorna lo stato locale
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrderForPayment.id 
            ? { ...order, paymentStatus: paymentStatus as any, updatedAt: new Date() }
            : order
        )
      );
      
      setIsPaymentDialogOpen(false);
      setSelectedOrderForPayment(null);
      
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error; // Rilancia l'errore per gestirlo nel componente PaymentMethodSelector
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8 lg:py-10" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container-custom px-4 md:px-6">
          <div className="mb-4 md:mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Torna agli ordini
            </Button>
            
            {loading ? (
              <div className="h-8 w-full max-w-80 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold truncate">{project?.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
                  <span
                    className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full ${
                      project ? getStatusBadge(project.status, project.productionStatus) : "bg-gray-100"
                    }`}
                  >
                    {project ? getStatusText(project.status, project.productionStatus) : "N/D"}
                  </span>
                  <span
                    className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full ${
                      project ? getPaymentStatusBadge(project.paymentStatus) : "bg-gray-100"
                    }`}
                  >
                    {project ? getPaymentStatusText(project.paymentStatus) : "N/D"}
                  </span>
                  <span className="text-xs md:text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">Creato: </span>{project ? formatDate(project.createdAt) : "N/D"}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 md:mb-6 w-full sm:w-auto">
              <TabsTrigger value="details" className="flex-1 sm:flex-none text-xs md:text-sm">Dettagli</TabsTrigger>
              <TabsTrigger value="files" className="flex-1 sm:flex-none text-xs md:text-sm">File ({files.length})</TabsTrigger>
              <TabsTrigger value="orders" className="flex-1 sm:flex-none text-xs md:text-sm">Ordini ({orders.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Informazioni Progetto</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Dettagli e descrizione del progetto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {project?.description && (
                        <div>
                          <h3 className="font-medium mb-2 text-sm md:text-base">Descrizione</h3>
                          <p className="text-gray-700 text-sm md:text-base">{project.description}</p>
                        </div>
                      )}
                      
                      {project && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm md:text-base">Note</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setNewNotes(project?.notes || "");
                                setIsEditNotesDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base">
                            {project.notes || "Nessuna nota disponibile."}
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-1 text-sm md:text-base">Data creazione</h3>
                            <p className="text-gray-700 text-sm md:text-base">
                              {project ? formatDate(project.createdAt) : "N/D"}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-sm md:text-base">Ultimo aggiornamento</h3>
                            <p className="text-gray-700 text-sm md:text-base">
                              {project ? formatDate(project.updatedAt) : "N/D"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium mb-1 text-sm md:text-base">Stato del progetto</h3>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                project ? getStatusBadge(project.status, project.productionStatus) : "bg-gray-100"
                              }`}
                            >
                              {project ? getStatusText(project.status, project.productionStatus) : "N/D"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1 text-sm md:text-base">Stato pagamento</h3>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                project ? getPaymentStatusBadge(project.paymentStatus) : "bg-gray-100"
                              }`}
                            >
                              {project ? getPaymentStatusText(project.paymentStatus) : "N/D"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Aggiungi sezione di avanzamento produzione con stile migliorato */}
                      {project?.productionStatus && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-3 md:p-4 border">
                          <h3 className="font-medium mb-3 text-sm md:text-base">Stato di Produzione</h3>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs md:text-sm font-medium">Avanzamento produzione</span>
                            <span className="text-xs md:text-sm font-medium">{getProductionProgress(project.productionStatus)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                            <div 
                              className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                                project.productionStatus === 'completato' ? 'bg-green-600' :
                                project.productionStatus === 'in_corso' ? 'bg-blue-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${getProductionProgress(project.productionStatus)}%` }}
                            ></div>
                          </div>
                          <div className="mt-3 flex items-center">
                            <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                              project.productionStatus === 'non_iniziato' ? 'bg-gray-200 text-gray-800' :
                              project.productionStatus === 'in_corso' ? 'bg-yellow-100 text-yellow-800' :
                              project.productionStatus === 'completato' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.productionStatus === 'non_iniziato' ? 'Da iniziare' :
                               project.productionStatus === 'in_corso' ? 'In produzione' :
                               project.productionStatus === 'completato' ? 'Completato' :
                               'Stato sconosciuto'}
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-gray-500 mt-3">
                            {project.productionStatus === 'non_iniziato' ? 'La produzione del tuo ordine non è ancora iniziata. Ti informeremo quando inizieremo a lavorare sul tuo ordine.' :
                             project.productionStatus === 'in_corso' ? 'Il tuo ordine è attualmente in produzione. Ti avviseremo non appena sarà pronto.' :
                             project.productionStatus === 'completato' ? 'La produzione del tuo ordine è stata completata. Puoi ritirare il tuo ordine o verrà spedito a breve.' :
                             'Stato di produzione non disponibile.'}
                          </p>
                          
                          {/* Pulsante per generare fattura */}
                          {orders.some(order => order.totalAmount > 0 && 
                               order.status !== 'pending' && 
                               order.status !== 'rejected' && 
                               order.status !== 'cancelled') && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="text-xs md:text-sm text-gray-500">Hai bisogno di una fattura per questo ordine?</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    // Trova il primo ordine valido per la fattura
                                    const validOrder = orders.find(order => 
                                      order.totalAmount > 0 && 
                                      order.status !== 'pending' && 
                                      order.status !== 'rejected' && 
                                      order.status !== 'cancelled'
                                    );
                                    if (validOrder) {
                                      setSelectedQuote(validOrder);
                                      setIsInvoiceDialogOpen(true);
                                    }
                                  }}
                                >
                                  Genera Fattura
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="files">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>File del Progetto</CardTitle>
                    <CardDescription>
                      Modelli 3D, immagini e documenti associati al progetto
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    Carica File
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
                  ) : files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <ProjectFileViewer 
                          key={file.id} 
                          file={file}
                          onFileUpdated={handleFileUpdated}
                          onFileDeleted={handleFileDeleted}
                          readOnly={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-medium text-lg mb-2">Nessun file disponibile</h3>
                      <p className="text-gray-500 mb-4">
                        Non sono presenti file associati a questo progetto.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        Carica File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ordini del Progetto</CardTitle>
                    <CardDescription>
                      Visualizza lo stato dei tuoi ordini
                    </CardDescription>
                  </div>
                  {files.some(file => file.type === '3d') && (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateOrderDialogOpen(true)}
                    >
                      Richiedi Preventivo
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID Ordine</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Stato</TableHead>
                              <TableHead>Produzione</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Importo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadge(order.status)}`}>
                                    {order.status === 'pending' ? 'In attesa' :
                                     order.status === 'processing' ? 'In lavorazione' :
                                     order.status === 'completed' ? 'Completato' :
                                     order.status === 'cancelled' ? 'Annullato' : 
                                     order.status}
                                </span>
                              </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge('', order.productionStatus)}`}>
                                      {getStatusText('', order.productionStatus) || 'Non impostato'}
                                    </span>
                                    {order.productionStatus && (
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div 
                                          className={`h-1.5 rounded-full ${
                                            order.productionStatus === 'completato' ? 'bg-green-600' :
                                            order.productionStatus === 'in_corso' ? 'bg-blue-600' : 'bg-gray-400'
                                          }`}
                                            style={{ width: `${getProductionProgress(order.productionStatus)}%` }}
                                          ></div>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadge(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                  {order.status === 'pending' && order.totalAmount > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => handleViewQuoteResponse(order)}
                                    >
                                      Rispondi
                                    </Button>
                                  )}
                                  
                                  {/* Bottone Metodo di Pagamento - mostrato solo per ordini accettati con importo > 0 */}
                                  {order.totalAmount > 0 && 
                                   (order.status === 'accepted' || order.status === 'processing') && 
                                   order.paymentStatus !== 'pagato_carta' && 
                                   order.paymentStatus !== 'pagato_contanti' && 
                                   order.paymentStatus !== 'pagato_twint' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleOpenPaymentDialog(order)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Metodo Pagamento
                                    </Button>
                                  )}
                                    
                                    {order.totalAmount > 0 && 
                                     order.status !== 'pending' && 
                                     order.status !== 'rejected' && 
                                     order.status !== 'cancelled' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedQuote(order);
                                          setIsInvoiceDialogOpen(true);
                                        }}
                                      >
                                        Fattura
                                      </Button>
                                    )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base">
                                    Ordine #{order.id.substring(0, 8)}...
                                  </CardTitle>
                                  <CardDescription className="text-sm mt-1">
                                    {formatDate(order.createdAt)}
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {order.status === 'pending' && order.totalAmount > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleViewQuoteResponse(order)}
                                    >
                                      Rispondi
                                    </Button>
                                  )}
                                  
                                  {/* Bottone Metodo di Pagamento - vista mobile */}
                                  {order.totalAmount > 0 && 
                                   (order.status === 'accepted' || order.status === 'processing') && 
                                   order.paymentStatus !== 'pagato_carta' && 
                                   order.paymentStatus !== 'pagato_contanti' && 
                                   order.paymentStatus !== 'pagato_twint' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleOpenPaymentDialog(order)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Metodo Pagamento
                                    </Button>
                                  )}
                                  
                                  {order.totalAmount > 0 && 
                                   order.status !== 'pending' && 
                                   order.status !== 'rejected' && 
                                   order.status !== 'cancelled' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedQuote(order);
                                        setIsInvoiceDialogOpen(true);
                                      }}
                                    >
                                      Fattura
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Stato:</span>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadge(order.status)}`}>
                                  {order.status === 'pending' ? 'In attesa' :
                                   order.status === 'processing' ? 'In lavorazione' :
                                   order.status === 'completed' ? 'Completato' :
                                   order.status === 'cancelled' ? 'Annullato' : 
                                   order.status}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Produzione:</span>
                                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge('', order.productionStatus)}`}>
                                    {getStatusText('', order.productionStatus) || 'Non impostato'}
                                  </span>
                                </div>
                                {order.productionStatus && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        order.productionStatus === 'completato' ? 'bg-green-600' :
                                        order.productionStatus === 'in_corso' ? 'bg-blue-600' : 'bg-gray-400'
                                      }`}
                                        style={{ width: `${getProductionProgress(order.productionStatus)}%` }}
                                      ></div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Pagamento:</span>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadge(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              
                              {order.totalAmount > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Importo:</span>
                                  <span className="font-medium text-lg">
                                    {formatCurrency(order.totalAmount)}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 border rounded-md">
                      <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-medium text-lg mb-2">Nessun ordine trovato</h3>
                      <p className="text-gray-500 mb-4">
                        Non hai ancora effettuato ordini per questo progetto.
                      </p>
                      {files.some(file => file.type === '3d') ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateOrderDialogOpen(true)}
                        >
                          Richiedi Preventivo
                        </Button>
                      ) : (
                        <p className="text-gray-500">
                          Carica modelli 3D per poter richiedere un preventivo.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />

      {/* Dialog for editing notes */}
      <Dialog open={isEditNotesDialogOpen} onOpenChange={setIsEditNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Note</DialogTitle>
            <DialogDescription>
              Puoi aggiungere le tue note a questo progetto
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="project-notes">Note</Label>
              <textarea
                id="project-notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Inserisci le tue note per il progetto"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditNotesDialogOpen(false)}
              disabled={isEditing}
            >
              Annulla
            </Button>
            <Button
              onClick={handleUpdateNotes}
              disabled={isEditing}
            >
              {isEditing ? "Aggiornamento..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for uploading files */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi File</DialogTitle>
            <DialogDescription>
              Carica nuovi file per questo progetto
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded p-4 text-center">
                {newFiles.length > 0 ? (
                  <div className="space-y-3">
                    <ul className="text-left text-sm max-h-40 overflow-y-auto">
                      {newFiles.map((file, index) => (
                        <li key={index} className="py-1.5 border-b flex justify-between items-center">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                            {uploadProgress[index] !== undefined && (
                              <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${uploadProgress[index] || 0}%` }}
                                ></div>
                              </div>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isUploading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleFileBrowse}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Aggiungi altri file
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Carica file STL, immagini o altri documenti relativi al progetto
                    </p>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".stl,.obj,.3mf,.gltf,.glb,.jpg,.jpeg,.png,.pdf"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleFileBrowse}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleziona file
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formati supportati: STL, OBJ, 3MF, JPG, PNG, PDF
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setNewFiles([]);
                setUploadProgress({});
              }}
              disabled={isUploading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleUploadFiles}
              disabled={newFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Caricamento...
                </>
              ) : (
                "Carica File"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating a new order */}
      <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Richiedi Preventivo</DialogTitle>
            <DialogDescription>
              Seleziona i modelli 3D e specifica le quantità per richiedere un preventivo
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="material">Materiale di stampa</Label>
                <Select 
                  value={selectedMaterial} 
                  onValueChange={setSelectedMaterial}
                >
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Seleziona un materiale" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(material => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Il materiale di stampa influisce sul costo e sulle proprietà del prodotto finito
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Modalità di consegna</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pickup-dialog"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'shipping')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="pickup-dialog" className="text-sm font-medium">
                      🏪 Ritiro in negozio (gratuito)
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Ritira direttamente presso il nostro laboratorio
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="shipping-dialog"
                      name="deliveryMethod"
                      value="shipping"
                      checked={deliveryMethod === 'shipping'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'shipping')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="shipping-dialog" className="text-sm font-medium">
                      📦 Spedizione a domicilio
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Spedizione via posta (costi aggiuntivi da definire)
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">File disponibili</h3>
                
                {files.filter(file => file.type === '3d').length === 0 ? (
                  <div className="text-center py-6 border rounded-md bg-gray-50">
                    <p className="text-gray-500">
                      Nessun file STL o 3D disponibile per questo progetto.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Nome file</TableHead>
                          <TableHead>Quantità</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.filter(file => file.type === '3d').map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="w-12">
                              <input 
                                type="checkbox" 
                                checked={selectedOrderFiles.includes(file.id)}
                                onChange={() => toggleFileSelection(file.id)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{file.name}</div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={orderItems[file.id]?.quantity || 1}
                                onChange={(e) => updateOrderItemQuantity(file.id, parseInt(e.target.value) || 1)}
                                disabled={!selectedOrderFiles.includes(file.id)}
                                className="w-16"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {selectedOrderFiles.length > 0 && (
                <div>
                  <Label htmlFor="order-notes">Note speciali (opzionale)</Label>
                  <Textarea
                    id="order-notes"
                    placeholder="Specifiche particolari, colore preferito, urgenza, ecc."
                    value=""
                    onChange={(e) => {
                      // Applica le stesse note a tutti i file selezionati
                      selectedOrderFiles.forEach(fileId => {
                        updateOrderItemNotes(fileId, e.target.value);
                      });
                    }}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOrderDialogOpen(false)}
              disabled={creatingOrder}
            >
              Annulla
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={creatingOrder || selectedOrderFiles.length === 0}
            >
              {creatingOrder ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Creazione...
                </>
              ) : (
                "Richiedi Preventivo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for quote response */}
      <Dialog open={isQuoteResponseDialogOpen} onOpenChange={setIsQuoteResponseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Risposta al Preventivo</DialogTitle>
            <DialogDescription>
              Valuta il preventivo e invia la tua risposta
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="py-4 space-y-6">
              {/* Dettagli preventivo */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Dettagli del Preventivo</h3>
                <div className="bg-gray-50 rounded-md p-4 border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data richiesta:</span>
                    <span className="font-medium">{formatDate(selectedQuote.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Importo preventivo:</span>
                    <span className="font-bold text-lg">{formatCurrency(selectedQuote.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stato:</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadge(selectedQuote.status)}`}>
                      {selectedQuote.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Articoli nel preventivo */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Articoli nel Preventivo</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Materiale</TableHead>
                        <TableHead>Quantità</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{item.fileName}</div>
                          </TableCell>
                          <TableCell>{item.material}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {isRequestingNewQuote ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Richiedi Nuovo Preventivo</h3>
                  <Textarea
                    value={newQuoteNotes}
                    onChange={(e) => setNewQuoteNotes(e.target.value)}
                    placeholder="Specifica le tue richieste o modifiche per il nuovo preventivo..."
                    rows={4}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRequestingNewQuote(false)}
                      disabled={processingQuoteResponse}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleRequestNewQuote}
                      disabled={!newQuoteNotes.trim() || processingQuoteResponse}
                    >
                      {processingQuoteResponse ? "Elaborazione..." : "Invia Richiesta"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">La tua risposta</h3>
                  <div className="flex flex-col space-y-3">
                    <Button
                      variant="default"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleAcceptQuote}
                      disabled={processingQuoteResponse}
                    >
                      {processingQuoteResponse ? "Elaborazione..." : "Accetta Preventivo"}
                    </Button>
                    <div className="flex items-center space-x-2 py-1">
                      <div className="h-px bg-gray-200 flex-grow"></div>
                      <span className="text-gray-500 text-sm">oppure</span>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-orange-600 hover:bg-orange-50"
                      onClick={() => setIsRequestingNewQuote(true)}
                      disabled={processingQuoteResponse}
                    >
                      Richiedi altro preventivo
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50"
                      onClick={handleDeclineQuote}
                      disabled={processingQuoteResponse}
                    >
                      Rifiuta e cancella
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsQuoteResponseDialogOpen(false);
                setIsRequestingNewQuote(false);
                setNewQuoteNotes('');
              }}
              disabled={processingQuoteResponse}
            >
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per la generazione della fattura */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scarica Fattura</DialogTitle>
            <DialogDescription>
              Scarica la fattura per questo ordine
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedQuote && selectedQuote.totalAmount > 0 ? (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Dettagli Ordine</h4>
                  <p className="text-sm text-gray-600">Ordine: {selectedQuote.id}</p>
                  <p className="text-sm text-gray-600">Data: {formatDate(selectedQuote.createdAt)}</p>
                  <p className="text-sm text-gray-600">Importo: {formatCurrency(selectedQuote.totalAmount)}</p>
                </div>
                <InvoiceGenerator orderId={selectedQuote.id} order={selectedQuote} />
              </>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Nessun ordine valido selezionato per la fattura.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInvoiceDialogOpen(false);
              setSelectedQuote(null);
            }}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per il metodo di pagamento */}
      {selectedOrderForPayment && (
        <PaymentMethodSelector
          orderId={selectedOrderForPayment.id}
          orderTotal={selectedOrderForPayment.totalAmount}
          currentPaymentStatus={selectedOrderForPayment.paymentStatus}
          onPaymentUpdate={handlePaymentUpdate}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedOrderForPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default UserProjectDetails; 