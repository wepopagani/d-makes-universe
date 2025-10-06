import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, doc, getDoc, Timestamp, where, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, getCustomDownloadURL } from '@/firebase/config';
import { useAuth } from '@/firebase/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project, FileInfo, Order } from '@/types/user';
import { Eye, FileText, Search, Calendar, Mail, Clock, FileImage, Package, Plus, Upload, X, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const UserProjectsManager = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectOrders, setProjectOrders] = useState<{[projectId: string]: Order[]}>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactProject, setContactProject] = useState<Project | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Stato per la creazione di un nuovo progetto
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadedFiles, setUploadedFiles] = useState<{id: string, name: string, url: string, type: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch projects
  useEffect(() => {
      if (!currentUser) return;
      
    // Set up real-time listener for projects
        const projectsQuery = query(
          collection(db, "projects"),
          where("userId", "==", currentUser.uid)
        );
        
    const projectsUnsubscribe = onSnapshot(projectsQuery, (projectsSnapshot) => {
      console.log("Projects updated from Firestore");
        const projectsList: Project[] = [];
        
      projectsSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const projectId = docSnapshot.id;
          
          const project: Project = {
            id: projectId,
            name: data.name,
            description: data.description,
            status: data.status,
            userId: data.userId,
            files: data.files || [],
            thumbnailUrl: data.thumbnailUrl,
            notes: data.notes,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          paymentStatus: data.paymentStatus || 'da_pagare',
          productionStatus: data.productionStatus
          };
          
          projectsList.push(project);
      });
      
      setProjects(projectsList);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to projects:", error);
      setLoading(false);
    });
    
    // Set up real-time listener for orders
          const ordersQuery = query(
            collection(db, "orders"),
      where("userEmail", "==", currentUser.email)
          );
          
    const ordersUnsubscribe = onSnapshot(ordersQuery, (ordersSnapshot) => {
      console.log("Orders updated from Firestore");
      const ordersData: {[projectId: string]: Order[]} = {};
      const standaloneProjects: Project[] = [];
          
          ordersSnapshot.forEach((orderDoc) => {
            const orderData = orderDoc.data();
        const orderId = orderDoc.id;
        
        const order: Order = {
          id: orderId,
              userId: orderData.userId,
              status: orderData.status,
              createdAt: orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : new Date(),
              updatedAt: orderData.updatedAt instanceof Timestamp ? orderData.updatedAt.toDate() : new Date(),
              items: orderData.items,
              totalAmount: orderData.totalAmount,
              paymentStatus: orderData.paymentStatus,
              shippingAddress: orderData.shippingAddress,
          productionStatus: orderData.productionStatus,
        };
        
        if (orderData.projectId) {
          // Group orders by projectId
          if (!ordersData[orderData.projectId]) {
            ordersData[orderData.projectId] = [];
        }
          ordersData[orderData.projectId].push(order);
        } else {
          // Handle standalone orders as projects
          let orderName = "Ordine";
          let orderDescription = "";
          
          // Use custom order name if available
          if (orderData.orderName) {
            orderName = orderData.orderName;
          } else if (orderData.items && orderData.items.length > 0) {
            if (orderData.items[0].fileName) {
              orderName = `Ordine - ${orderData.items[0].fileName}`;
            }
          }
          
          if (orderData.items && orderData.items.length > 0) {
            orderDescription = `Quantità: ${orderData.items[0].quantity}, Materiale: ${orderData.items[0].material}${orderData.items[0].color ? `, Colore: ${orderData.items[0].color}` : ''}`;
            
            // Add price info if available
            if (orderData.totalAmount > 0) {
              orderDescription += ` - Prezzo: ${orderData.totalAmount.toFixed(2)} CHF`;
            }
          }
          
          const orderAsProject: Project = {
            id: `order_${orderId}`,
            name: orderName,
            description: orderDescription,
            status: orderData.status === 'completed' ? 'completed' : 
                   orderData.status === 'cancelled' ? 'cancelled' : 
                   orderData.status === 'rejected' ? 'rejected' :
                   orderData.status === 'accepted' ? 'accepted' :
                   orderData.status === 'processing' ? 'processing' : 'pending',
            userId: orderData.userId,
            files: [],
            createdAt: orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : new Date(),
            updatedAt: orderData.updatedAt instanceof Timestamp ? orderData.updatedAt.toDate() : new Date(),
            paymentStatus: orderData.paymentStatus || 'da_pagare',
            isOrder: true,
            productionStatus: orderData.productionStatus
          };
          
          standaloneProjects.push(orderAsProject);
          ordersData[`order_${orderId}`] = [order];
        }
      });
      
      setProjectOrders(ordersData);
      
      // Update projects list to include standalone orders
      setProjects(prev => {
        const regularProjects = prev.filter(p => !p.isOrder);
        return [...regularProjects, ...standaloneProjects];
      });
    }, (error) => {
      console.error("Error listening to orders:", error);
    });
    
    // Cleanup function
    return () => {
      console.log("Unsubscribing from projects and orders listeners");
      projectsUnsubscribe();
      ordersUnsubscribe();
    };
  }, [currentUser]);
  
  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  // Format relative time (like "2 days ago")
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Oggi";
    } else if (diffInDays === 1) {
      return "Ieri";
    } else if (diffInDays < 30) {
      return `${diffInDays} giorni fa`;
    } else {
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths === 1) {
        return "1 mese fa";
      } else if (diffInMonths < 12) {
        return `${diffInMonths} mesi fa`;
      } else {
        const diffInYears = Math.floor(diffInMonths / 12);
        if (diffInYears === 1) {
          return "1 anno fa";
        } else {
          return `${diffInYears} anni fa`;
        }
      }
    }
  };
  
  // Modify the getStatusText function to match admin states
  const getStatusText = (status: string, productionStatus?: string) => {
    // Production status has priority - use only these states
    if (productionStatus) {
      switch (productionStatus) {
        case 'non_iniziato':
          return 'Da iniziare';
        case 'in_corso':
          return 'In produzione';
        case 'completato':
          return 'Completato';
        default:
          return 'In attesa';
      }
    }
    
    // Fallback based on order status
    switch (status) {
      case 'pending':
        return 'In attesa preventivo';
      case 'accepted':
        return 'Da iniziare';
      case 'processing':
        return 'In produzione';
      case 'completed':
        return 'Completato';
      case 'cancelled':
      case 'rejected':
        return 'Annullato';
      default:
        return 'In attesa';
    }
  };
  
  // Modify the getStatusBadge function to include production status colors
  const getStatusBadge = (status: string, productionStatus?: string) => {
    // Production status has priority
    if (productionStatus) {
      switch (productionStatus) {
        case 'non_iniziato':
          return 'bg-gray-100 text-gray-800';
        case 'in_corso':
          return 'bg-yellow-100 text-yellow-800';
        case 'completato':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    }
    
    // Fallback based on order status
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get progress percentage based on status
  const getProgressPercentage = (status: string, productionStatus?: string) => {
    // Production status has priority
    if (productionStatus) {
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
    }
    
    // Fallback based on order status
    switch (status) {
      case 'pending':
        return 10;
      case 'accepted':
        return 5;
      case 'processing':
        return 50;
      case 'completed':
        return 100;
      case 'cancelled':
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };
  
  // View project details
  const handleViewProject = (projectId: string) => {
    // Check if this is a standalone order
    if (projectId.startsWith('order_')) {
      const orderId = projectId.replace('order_', '');
      navigate(`/dashboard/ordini/${orderId}`);
    } else {
    navigate(`/user-project/${projectId}`);
    }
  };
  
  // Handle contact about project
  const handleContactSubmit = async () => {
    if (!contactProject || !messageText.trim() || !currentUser) return;
    
    try {
      setSendingMessage(true);
      
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        text: messageText,
        projectId: contactProject.id,
        projectName: contactProject.name,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        timestamp: Timestamp.now(),
        isRead: false,
        isAdmin: false
      });
      
      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato con successo. Ti risponderemo al più presto.",
      });
      
      // Reset form
      setMessageText("");
      setContactProject(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio del messaggio",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileArray]);
    }
  };
  
  // Open file selector
  const handleFileBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  // Create new project
  const handleCreateProject = async () => {
    if (!newProject.name || !currentUser) {
      toast({
        title: "Dati mancanti",
        description: "Inserisci almeno un titolo per il progetto.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const uploadedFileIds: string[] = [];
      const fileInfos: {id: string, name: string, url: string, type: string}[] = [];
      
      // Upload files if there are any
      if (files.length > 0) {
        // First upload all files to Firebase Storage
        for (const [index, file] of files.entries()) {
          // Create a unique filename
          const timestamp = Date.now();
          const extension = file.name.split('.').pop() || '';
          const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const storagePath = `files/${currentUser.uid}/${safeFileName}`;
          
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
                  
                  if (['stl', 'obj', '3mf', 'step', 'stp'].includes(extension.toLowerCase())) {
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
                  } else if (['obj', 'stl', 'gltf', 'glb', '3mf', 'step', 'stp'].includes(fileExt)) {
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
                    userId: currentUser.uid,
                    userEmail: currentUser.email
                  });
                  
                  // Keep track of uploaded file IDs
                  uploadedFileIds.push(fileDocRef.id);
                  fileInfos.push({
                    id: fileDocRef.id,
                    name: file.name,
                    url: downloadURL,
                    type: fileType
                  });
                  
                  resolve();
                } catch (error) {
                  reject(error);
                }
              }
            );
          });
        }
      }
      
      // Set thumbnail if there's an image file
      let thumbnailUrl = '';
      const imageFile = fileInfos.find(f => f.type === 'image');
      if (imageFile) {
        thumbnailUrl = imageFile.url;
      }
      
      // Create the project document
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        status: 'pending' as 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled' | 'rejected', // Default status for new projects
        userId: currentUser.uid,
        files: uploadedFileIds,
        thumbnailUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        notes: '',
        paymentStatus: 'da_pagare' // Use correct enum value
      };
      
      const projectRef = await addDoc(collection(db, 'projects'), projectData);
      
      // Add the new project to local state
      const newProjectObj: Project = {
        id: projectRef.id,
        name: newProject.name,
        description: newProject.description,
        status: 'pending' as 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled' | 'rejected',
        userId: currentUser.uid,
        files: uploadedFileIds,
        thumbnailUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: '',
        paymentStatus: 'da_pagare' // Use correct enum value
      };
      
      setProjects([newProjectObj, ...projects]);
      
      // Reset form
      setNewProject({
        name: '',
        description: ''
      });
      setFiles([]);
      setUploadProgress({});
      setUploadedFiles([]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Progetto creato",
        description: "Il tuo progetto è stato creato con successo.",
      });
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione del progetto",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1">I Miei Ordini</h2>
          <p className="text-gray-500 text-sm md:text-base">
            Visualizza e gestisci i tuoi ordini
          </p>
        </div>
      </div>
      
      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Cerca ordini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <h3 className="font-medium text-lg mb-2">Nessun ordine trovato</h3>
          <p className="text-gray-500 mb-6">
            Non hai ancora ordini attivi. Crea il tuo primo ordine per iniziare.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            // Get the orders for this project to find production status
            const projectOrdersList = projectOrders[project.id] || [];
            const mainOrder = projectOrdersList[0]; // Use the first order if available
            const productionStatus = mainOrder?.productionStatus;
            
            return (
            <Card 
              key={project.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewProject(project.id)}
            >
              <CardHeader className="pb-3 md:pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base md:text-lg truncate">{project.name}</CardTitle>
                      {/* Indicatore per preventivo ricevuto */}
                      {project.isOrder && mainOrder && mainOrder.totalAmount > 0 && mainOrder.status === 'pending' && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="ml-1 text-xs font-medium text-green-600">Preventivo</span>
                        </div>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mt-1 text-sm">
                      {project.description || "Nessuna descrizione"}
                    </CardDescription>
                  </div>
                    {/* Mostra solo lo stato di produzione come read-only, senza dropdown */}
                    <div className="flex items-center flex-shrink-0">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status, productionStatus)}`}>
                        {getStatusText(project.status, productionStatus)}
                        </span>
                      </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-3 md:space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Avanzamento</span>
                      <span>
                        {productionStatus ? 
                          (productionStatus === 'non_iniziato' ? '5%' : 
                           productionStatus === 'in_corso' ? '50%' : 
                           productionStatus === 'completato' ? '100%' : 
                           `${getProgressPercentage(project.status, productionStatus)}%`) : 
                          `${getProgressPercentage(project.status)}%`}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(project.status, productionStatus)} 
                      className="h-2" 
                    />
                    
                    {/* Aggiungiamo un'indicazione testuale dello stato di produzione se disponibile */}
                    {productionStatus && (
                      <p className="text-xs text-gray-600 mt-1">
                        Stato di produzione: <span className="font-medium">{getStatusText('', productionStatus)}</span>
                      </p>
                    )}
                  </div>
                  
                {/* Info grid - responsive layout */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 text-xs md:text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">Creato: {formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">Aggiornato: {formatRelativeDate(project.updatedAt)}</span>
                    </div>
                  </div>
                    
                    {/* Display file info/item details */}
                    {project.isOrder ? (
                      <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate text-xs md:text-sm">
                            {projectOrders[project.id]?.[0]?.items?.[0]?.fileName || "File sconosciuto"}
                          </span>
                        </div>
                        
                        {/* Mostra il prezzo se disponibile */}
                        {mainOrder && mainOrder.totalAmount > 0 && (
                          <div className="bg-green-50 rounded p-2 border border-green-200">
                            <span className="font-semibold text-green-800 text-xs md:text-sm">
                              💰 Prezzo: {mainOrder.totalAmount.toFixed(2)} CHF
                            </span>
                          </div>
                        )}
                        
                        {/* Mostra stato preventivo se prezzo non impostato */}
                        {mainOrder && mainOrder.totalAmount === 0 && mainOrder.status === 'pending' && (
                          <div className="bg-blue-50 rounded p-2 border border-blue-200">
                            <span className="text-blue-800 text-xs md:text-sm">
                              ⏳ In attesa di preventivo dall'admin
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 text-xs md:text-sm">
                        <div className="flex items-center text-gray-600">
                          <FileImage className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                      <span>File: {project.files.length}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                          <Package className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                      <span>Ordini: {projectOrders[project.id]?.length || 0}</span>
                    </div>
                  </div>
                    )}
                </div>
              </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto text-xs md:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProject(project.id);
                    }}
                  >
                    <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    {project.isOrder && mainOrder && mainOrder.totalAmount > 0 && mainOrder.status === 'pending' ? 'Vedi Preventivo' : 'Visualizza'}
                  </Button>
              </CardFooter>
            </Card>
            );
          })}
        </div>
      )}
      
      {/* Dialog per contattare l'amministratore riguardo a un progetto */}
      <Dialog open={!!contactProject} onOpenChange={(open) => !open && setContactProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contatta amministratore</DialogTitle>
            <DialogDescription>
              Invia un messaggio riguardo al progetto {contactProject?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea 
                id="message" 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Scrivi il tuo messaggio..."
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setContactProject(null)}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleContactSubmit} 
              disabled={!messageText.trim() || sendingMessage}
            >
              {sendingMessage ? "Invio in corso..." : "Invia Messaggio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per creare un nuovo ordine */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Ordine</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del tuo nuovo ordine
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Titolo *</Label>
              <Input 
                id="project-name" 
                value={newProject.name} 
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Inserisci un titolo per l'ordine"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Descrizione</Label>
              <Textarea 
                id="project-description" 
                value={newProject.description} 
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Descrivi il tuo ordine"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>File del progetto</Label>
              <div className="border-2 border-dashed rounded p-4 text-center">
                {files.length > 0 ? (
                  <div className="space-y-3">
                    <ul className="text-left text-sm max-h-40 overflow-y-auto">
                      {files.map((file, index) => (
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                              }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileBrowse();
                      }}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Aggiungi altri file
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Carica file STL, immagini o altri documenti relativi al tuo progetto
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileBrowse();
                      }}
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
                setIsCreateDialogOpen(false);
                setNewProject({ name: '', description: '' });
                setFiles([]);
              }}
              disabled={isUploading}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleCreateProject} 
              disabled={!newProject.name.trim() || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Creazione...
                </>
              ) : (
                <>
                  Crea Ordine
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProjectsManager; 