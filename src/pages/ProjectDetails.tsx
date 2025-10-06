import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, Timestamp, updateDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, getCustomDownloadURL } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, File, FileText, MessageSquare, Calendar, Save, Edit, Upload, X } from "lucide-react";
import { Project, UserProfileData, FileInfo, Order } from "@/types/user";
import ProjectOrderManager from "@/components/ProjectOrderManager";
import { ModelViewerPreventivo } from "@/components/ModelViewer";
import { useAuth } from "@/firebase/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectFileViewer from '@/components/ProjectFileViewer';

// Define project status type
type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'cancelled';
// Define payment status type
type PaymentStatus = 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<UserProfileData | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>('planning');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('da_pagare');
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  
  // New state for renaming project
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  
  // New state for file uploads
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stato per la modifica della descrizione e delle note
  const [isEditDescriptionDialogOpen, setIsEditDescriptionDialogOpen] = useState(false);
  const [isEditNotesDialogOpen, setIsEditNotesDialogOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
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
          navigate("/admin", { replace: true });
          return;
        }
        
        const projectData = projectDoc.data();
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          paymentStatus: projectData.paymentStatus || 'da_pagare', // Default a "da pagare" se non esiste
          userId: projectData.userId,
          files: projectData.files || [],
          thumbnailUrl: projectData.thumbnailUrl,
          notes: projectData.notes,
          createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate() : new Date(),
          updatedAt: projectData.updatedAt instanceof Timestamp ? projectData.updatedAt.toDate() : new Date(),
        };
        
        setProject(project);
        setSelectedStatus(project.status as ProjectStatus);
        setSelectedPaymentStatus(project.paymentStatus as PaymentStatus);
        
        // Fetch client
        const clientDoc = await getDoc(doc(db, "users", project.userId));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as UserProfileData);
        }
        
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
    };
    
    fetchProjectData();
  }, [id, navigate, toast]);
  
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
  const getFileIcon = (fileType: string, fileName: string) => {
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "Pianificazione";
      case "in_progress":
        return "In corso";
      case "completed":
        return "Completato";
      case "cancelled":
        return "Annullato";
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
  
  // Update project status
  const handleUpdateStatus = async () => {
    if (!project || !id || selectedStatus === project.status) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update project in Firestore
      await updateDoc(doc(db, "projects", id), {
        status: selectedStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setProject({
        ...project,
        status: selectedStatus,
        updatedAt: new Date()
      });
      
      toast({
        title: "Stato aggiornato",
        description: `Lo stato del progetto è stato aggiornato a ${getStatusText(selectedStatus)}.`
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiornamento dello stato",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Update payment status
  const handleUpdatePaymentStatus = async () => {
    if (!project || !id || selectedPaymentStatus === project.paymentStatus) return;
    
    try {
      setUpdatingPaymentStatus(true);
      
      // Update project in Firestore
      await updateDoc(doc(db, "projects", id), {
        paymentStatus: selectedPaymentStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setProject({
        ...project,
        paymentStatus: selectedPaymentStatus,
        updatedAt: new Date()
      });
      
      toast({
        title: "Pagamento aggiornato",
        description: `Lo stato di pagamento è stato aggiornato a ${getPaymentStatusText(selectedPaymentStatus)}.`
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiornamento dello stato di pagamento",
        variant: "destructive"
      });
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };
  
  // Add the rename functionality
  const handleRenameProject = async () => {
    if (!project || !id || !newProjectName.trim()) return;
    
    try {
      setIsRenaming(true);
      
      // Update project in Firestore
      await updateDoc(doc(db, "projects", id), {
        name: newProjectName,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setProject({
        ...project,
        name: newProjectName,
        updatedAt: new Date()
      });
      
      setIsRenameDialogOpen(false);
      
      toast({
        title: "Nome aggiornato",
        description: "Il nome dell'ordine è stato aggiornato con successo."
      });
    } catch (error) {
      console.error("Error renaming project:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il cambio del nome",
        variant: "destructive"
      });
    } finally {
      setIsRenaming(false);
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
  
  // Funzione per aggiornare la descrizione
  const handleUpdateDescription = async () => {
    if (!project || !id) return;
    
    try {
      setIsEditing(true);
      
      // Update project in Firestore
      await updateDoc(doc(db, "projects", id), {
        description: newDescription,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setProject({
        ...project,
        description: newDescription,
        updatedAt: new Date()
      });
      
      setIsEditDescriptionDialogOpen(false);
      
      toast({
        title: "Descrizione aggiornata",
        description: "La descrizione del progetto è stata aggiornata con successo."
      });
    } catch (error) {
      console.error("Error updating project description:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della descrizione",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 md:py-10" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container-custom">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/admin?tab=projects")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Torna agli ordini
            </Button>
            
            {loading ? (
              <div className="h-8 w-80 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">{project?.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      setNewProjectName(project?.name || "");
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Aggiungi File
                  </Button>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      project ? getStatusBadge(project.status) : "bg-gray-100"
                    }`}
                  >
                    {project ? getStatusText(project.status) : "N/D"}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      project ? getPaymentStatusBadge(project.paymentStatus) : "bg-gray-100"
                    }`}
                  >
                    {project ? getPaymentStatusText(project.paymentStatus) : "N/D"}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Creato: {project ? formatDate(project.createdAt) : "N/D"}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="details">Dettagli</TabsTrigger>
              <TabsTrigger value="files">File ({files.length})</TabsTrigger>
              <TabsTrigger value="orders">Ordini</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informazioni Progetto</CardTitle>
                      <CardDescription>
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
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-gray-500">Descrizione</h3>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setNewDescription(project?.description || "");
                                    setIsEditDescriptionDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="mt-1">
                              {project?.description || "Nessuna descrizione disponibile."}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-gray-500">Note</h3>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setNewNotes(project?.notes || "");
                                    setIsEditNotesDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="mt-1">
                              {project?.notes || "Nessuna nota disponibile."}
                            </p>
                          </div>
                          
                          {isAdmin && (
                            <div className="border-t pt-4 mt-4">
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Gestione Stato Progetto</h3>
                              <div className="flex items-center gap-4">
                                <div className="w-64">
                                  <Select
                                    value={selectedStatus}
                                    onValueChange={(value) => setSelectedStatus(value as ProjectStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleziona stato" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="planning">Pianificazione</SelectItem>
                                      <SelectItem value="in_progress">In corso</SelectItem>
                                      <SelectItem value="completed">Completato</SelectItem>
                                      <SelectItem value="cancelled">Annullato</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  onClick={handleUpdateStatus}
                                  disabled={updatingStatus || selectedStatus === project?.status}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {updatingStatus ? "Aggiornamento..." : "Aggiorna Stato"}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {isAdmin && (
                            <div className="border-t pt-4 mt-4">
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Stato Pagamento</h3>
                              <div className="flex items-center gap-4">
                                <div className="w-64">
                                  <Select
                                    value={selectedPaymentStatus}
                                    onValueChange={(value) => setSelectedPaymentStatus(value as PaymentStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleziona stato pagamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="da_pagare">Da pagare</SelectItem>
                                      <SelectItem value="pagato_carta">Pagato con carta</SelectItem>
                                      <SelectItem value="pagato_contanti">Pagato in contanti</SelectItem>
                                      <SelectItem value="pagato_twint">Pagato con Twint</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  onClick={handleUpdatePaymentStatus}
                                  disabled={updatingPaymentStatus || selectedPaymentStatus === project?.paymentStatus}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {updatingPaymentStatus ? "Aggiornamento..." : "Aggiorna Pagamento"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Cliente</CardTitle>
                      <CardDescription>
                        Informazioni sul cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : client ? (
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome</dt>
                            <dd>{client.nome} {client.cognome}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd>{client.email}</dd>
                          </div>
                          {client.telefono && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Telefono</dt>
                              <dd>{client.telefono}</dd>
                            </div>
                          )}
                          {client.indirizzo && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Indirizzo</dt>
                              <dd>{client.indirizzo}</dd>
                            </div>
                          )}
                          {client.citta && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Città</dt>
                              <dd>{client.citta} {client.cap}</dd>
                            </div>
                          )}
                        </dl>
                      ) : (
                        <p>Cliente non trovato</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>File del Progetto</CardTitle>
                    <CardDescription>
                      File caricati per questo progetto
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
                  ) : files.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-1">Nessun file</h3>
                      <p className="text-gray-500">
                        Non ci sono file associati a questo progetto.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="mt-4"
                      >
                        Carica File
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <ProjectFileViewer 
                          key={file.id} 
                          file={file}
                          onFileUpdated={(updatedFile) => {
                            setFiles(prevFiles => 
                              prevFiles.map(f => f.id === updatedFile.id ? updatedFile : f)
                            );
                          }}
                          onFileDeleted={(fileId) => {
                            setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
                            
                            // Aggiorna anche i file associati al progetto
                            if (project && project.files) {
                              const updatedFiles = project.files.filter(f => f !== fileId);
                              setProject({
                                ...project,
                                files: updatedFiles
                              });
                              
                              // Aggiorna anche in Firestore
                              updateDoc(doc(db, "projects", id), {
                                files: updatedFiles,
                                updatedAt: Timestamp.now()
                              }).catch(error => {
                                console.error("Error updating project files:", error);
                              });
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <ProjectOrderManager projectId={id || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      {/* Dialog for renaming project */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rinomina Ordine</DialogTitle>
            <DialogDescription>
              Inserisci il nuovo nome per l'ordine
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nuovo nome</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Inserisci il nuovo nome"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              Annulla
            </Button>
            <Button
              onClick={handleRenameProject}
              disabled={!newProjectName.trim() || isRenaming}
            >
              {isRenaming ? "Aggiornamento..." : "Salva"}
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
              Carica nuovi file per questo ordine
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
                      Carica file STL, immagini o altri documenti relativi all'ordine
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
      
      {/* Dialog for editing description */}
      <Dialog open={isEditDescriptionDialogOpen} onOpenChange={setIsEditDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Descrizione</DialogTitle>
            <DialogDescription>
              Aggiorna la descrizione del progetto
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="project-description">Descrizione</Label>
              <textarea
                id="project-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Inserisci la descrizione del progetto"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDescriptionDialogOpen(false)}
              disabled={isEditing}
            >
              Annulla
            </Button>
            <Button
              onClick={handleUpdateDescription}
              disabled={isEditing}
            >
              {isEditing ? "Aggiornamento..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing notes */}
      <Dialog open={isEditNotesDialogOpen} onOpenChange={setIsEditNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Note</DialogTitle>
            <DialogDescription>
              Aggiorna le note del progetto
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
                placeholder="Inserisci le note per il progetto"
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
    </div>
  );
};

export default ProjectDetails; 