import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/firebase/AuthContext";
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import UserPanel from "@/components/UserPanel";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileInfo } from "@/types/user";
import { ModelViewerPreventivo } from "@/components/ModelViewer";
import MessagesContainer from "@/components/MessagesContainer";
import { LogOut, File, MessageSquare, User, FolderOpen, Menu, ChevronDown, Home } from "lucide-react";
import UserProjectsManager from "@/components/UserProjectsManager";

const Dashboard = () => {
  const { toast } = useToast();
  const { currentUser, userData, logOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("files");
  
  // Stato per il caricamento file
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stato per la gestione della preview grande
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');
  const [previewName, setPreviewName] = useState('');
  
  // Stato per il rename del file
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileInfo | null>(null);
  const [newFileName, setNewFileName] = useState('');
  
  // Stato per la conferma di eliminazione
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  
  // Reindirizza l'admin all'admin panel se accede alla dashboard utente
  useEffect(() => {
    if (isAdmin && currentUser?.email === "info@3dmakes.ch") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [isAdmin, currentUser, navigate]);
  
  // Stato per il tab attivo dalle location state
  useEffect(() => {
    // Determina il tab attivo dall'URL corrente
    const path = location.pathname;
    
    if (path.includes("/dashboard/file")) {
      setActiveTab("files");
    } else if (path.includes("/dashboard/ordini")) {
      setActiveTab("projects");
    } else if (path.includes("/dashboard/messaggi")) {
      setActiveTab("messages");
    } else if (path.includes("/dashboard/profilo")) {
      setActiveTab("profile");
    } else if (path === "/dashboard") {
      // Su /dashboard imposta tab predefinito e reindirizza
      navigate("/dashboard/file", { replace: true });
    }
    
    // Log information about the user and active tab 
    console.log("Dashboard - Active Tab:", activeTab);
    console.log("Dashboard - Current User:", currentUser);
    console.log("Dashboard - User Data:", userData);
  }, [location.pathname, navigate]);
  
  // Only render Footer when not on Messages tab
  const shouldRenderFooter = activeTab !== "messages";
  
  // Fetch user projects and files from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch files
        const filesQuery = query(
          collection(db, "files"),
          where("userId", "==", currentUser.uid)
        );
        
        const filesSnapshot = await getDocs(filesQuery);
        const filesList: FileInfo[] = [];
        
        filesSnapshot.forEach((doc) => {
          const data = doc.data();
          filesList.push({
            id: doc.id,
            name: data.name || data.originalName || "File senza nome",
            type: data.type,
            url: data.url,
            thumbnailUrl: data.thumbnailUrl || null,
            storagePath: data.storagePath,
            uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
            userId: data.userId
          });
        });
        
        setFiles(filesList);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel recupero dei dati.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo."
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (date: Date | { seconds: number } | string | number | undefined) => {
    if (!date) return 'N/A';
    if (typeof date === 'object' && 'seconds' in date) {
      // Convert Firestore timestamp to Date
      return formatDistanceToNow(new Date(date.seconds * 1000), {
        addSuffix: true,
        locale: it
      });
    }
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: it
    });
  };
  
  // Funzioni per il caricamento dei file
  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
    setFile(null);
    setPreviewFile(null);
    setUploadProgress(0);
  };
  
  const handleFileBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Imposta il file per la preview
      setPreviewFile(selectedFile);
      setPreviewType(selectedFile.name.split('.').pop()?.toLowerCase() || '');
    }
  };
  
  // Funzioni per il drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Imposta il file per la preview
      setPreviewFile(droppedFile);
      setPreviewType(droppedFile.name.split('.').pop()?.toLowerCase() || '');
    }
  };
  
  const handleUpload = async () => {
    if (!file || !currentUser) return;
    
    setUploadLoading(true);
    setUploadProgress(0);
    
    try {
      // Controlla dimensione file (massimo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Il file è troppo grande. La dimensione massima è 50MB.');
      }
      
      // Controlla i tipi di file consentiti
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileType = getFileTypeFromExtension(file.name);
      
      if (fileType === 'other' && fileExtension !== 'pdf') {
        throw new Error('Formato file non supportato. Formati consentiti: immagini, PDF e modelli 3D (obj, stl, gltf, glb, 3mf, step).');
      }
      
      // Crea un nome file sicuro con timestamp per evitare conflitti
      const timestamp = Date.now();
      const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Percorso per lo storage
      const storagePath = `files/${currentUser.uid}/${safeFileName}`;
      
      // Genera thumbnail per modelli 3D
      let thumbnailUrl = null;
      if (fileType === '3d') {
        try {
          thumbnailUrl = await generateThumbnailFor3D(file, fileExtension || '');
        } catch (error) {
          console.warn('Could not generate thumbnail for 3D model:', error);
          // Continua senza thumbnail se la generazione fallisce
        }
      }
      
      // Carica il file su Firebase Storage
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Monitora il progresso dell'upload
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Errore durante il caricamento:', error);
          toast({
            title: "Errore",
            description: `Errore caricamento: ${error.message}`,
            variant: "destructive",
          });
          setUploadLoading(false);
        },
        async () => {
          // Upload completato con successo
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Salva le informazioni del file in Firestore
          const fileDocRef = await addDoc(collection(db, 'files'), {
            name: safeFileName,
            originalName: file.name,
            type: fileType,
            url: downloadURL,
            thumbnailUrl: thumbnailUrl,
            storagePath,
            uploadedAt: Timestamp.now(),
            userId: currentUser.uid,
            userEmail: currentUser.email
          });
          
          const newFile: FileInfo = {
            id: fileDocRef.id,
            name: file.name,
            type: fileType,
            url: downloadURL,
            thumbnailUrl: thumbnailUrl,
            storagePath,
            uploadedAt: new Date(),
            userId: currentUser.uid
          };
          
          // Aggiungi il file alla lista
          setFiles(prev => [newFile, ...prev]);
          
          toast({
            title: "File caricato",
            description: "Il file è stato caricato con successo.",
          });
          
          // Reset dello stato
          setUploadLoading(false);
          setIsUploadDialogOpen(false);
          
          // Reset del file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error: unknown) {
      console.error('Errore generale durante il caricamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${errorMessage}`,
        variant: "destructive",
      });
      setUploadLoading(false);
    }
  };

  // Funzione per generare thumbnail per modelli 3D
  const generateThumbnailFor3D = async (file: File, fileExtension: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Crea un canvas temporaneo
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      
      // Per ora, generiamo un'immagine placeholder colorata basata sul nome del file
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // Genera un colore basato sul nome del file
      const hash = file.name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const hue = Math.abs(hash) % 360;
      const gradient = ctx.createLinearGradient(0, 0, 300, 300);
      gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${hue + 60}, 70%, 40%)`);
      
      // Disegna lo sfondo
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);
      
      // Aggiungi un'icona 3D stilizzata
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Disegna l'icona del cubo 3D
      const centerX = 150;
      const centerY = 120;
      const size = 40;
      
      // Faccia frontale
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
      
      // Faccia superiore (isometrica)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY - size/2);
      ctx.lineTo(centerX, centerY - size);
      ctx.lineTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      ctx.fill();
      
      // Faccia destra (isometrica)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX + size, centerY);
      ctx.lineTo(centerX + size/2, centerY + size/2);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      ctx.fill();
      
      // Aggiungi il testo del tipo di file
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(fileExtension.toUpperCase(), centerX, centerY + 60);
      
      // Aggiungi il nome del file (troncato)
      ctx.font = '12px Arial';
      const fileName = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
      ctx.fillText(fileName, centerX, centerY + 80);
      
      // Converti in data URL
      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Funzione per determinare il tipo di file in base all'estensione
  const getFileTypeFromExtension = (filename: string): 'image' | '3d' | 'pdf' | 'other' => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (!extension) return 'other';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const modelExtensions = ['obj', 'stl', 'gltf', 'glb', '3mf', 'step', 'stp'];
    const pdfExtension = ['pdf'];
    
    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (modelExtensions.includes(extension)) {
      return '3d';
    } else if (pdfExtension.includes(extension)) {
      return 'pdf';
    } else {
      return 'other';
    }
  };

  // Funzione per ottenere l'icona in base al tipo di file
  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType === 'image') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType === '3d') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      );
    } else if (fileType === 'pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <text x="12" y="17" textAnchor="middle" className="text-xs fill-current">PDF</text>
        </svg>
      );
    } else {
      const extension = fileName.split('.').pop()?.toUpperCase() || '';
      return (
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {extension && <span className="text-xs mt-1">{extension}</span>}
        </div>
      );
    }
  };

  // Funzione per gestire l'anteprima grande
  const handleOpenPreview = (file: FileInfo) => {
    setPreviewUrl(file.url);
    setPreviewFileType(file.name.split('.').pop()?.toLowerCase() || '');
    setPreviewName(file.name);
    setIsPreviewOpen(true);
  };

  // Funzione per gestire il rename del file
  const handleOpenRename = (file: FileInfo) => {
    // Estrai il nome senza estensione per mostrare solo quello nell'input
    const fileNameWithoutExtension = file.name.includes('.') 
      ? file.name.substring(0, file.name.lastIndexOf('.'))
      : file.name;
    
    setFileToRename(file);
    setNewFileName(fileNameWithoutExtension);
    setIsRenameOpen(true);
  };

  // Funzione per rinominare il file
  const handleRenameFile = async () => {
    if (!fileToRename || !newFileName.trim()) return;

    try {
      // Ottieni l'estensione originale
      const originalExtension = fileToRename.name.includes('.') 
        ? fileToRename.name.substring(fileToRename.name.lastIndexOf('.')) 
        : '';
      
      // Combina il nuovo nome con l'estensione originale
      const newFileNameWithExtension = newFileName + originalExtension;
      
      // Aggiorna il documento nel database
      const fileRef = doc(db, 'files', fileToRename.id);
      await updateDoc(fileRef, {
        originalName: newFileNameWithExtension
      });

      // Aggiorna lo stato locale
      setFiles(files.map(f => 
        f.id === fileToRename.id 
          ? {...f, name: newFileNameWithExtension} 
          : f
      ));

      setIsRenameOpen(false);
      toast({
        title: "File rinominato",
        description: "Il nome del file è stato aggiornato con successo."
      });
    } catch (error: unknown) {
      console.error('Errore durante il rename:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Funzione per aprire il dialog di eliminazione
  const handleOpenDeleteDialog = (file: FileInfo) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  // Funzione per eliminare il file
  const handleDeleteFile = async () => {
    if (!fileToDelete || !fileToDelete.storagePath) return;

    try {
      // Elimina il file dallo storage
      const storageReference = ref(storage, fileToDelete.storagePath);
      await deleteObject(storageReference);

      // Elimina il documento dal database
      await deleteDoc(doc(db, 'files', fileToDelete.id));

      // Aggiorna lo stato locale
      setFiles(files.filter(f => f.id !== fileToDelete.id));

      setIsDeleteDialogOpen(false);
      toast({
        title: "File eliminato",
        description: "Il file è stato eliminato con successo."
      });
    } catch (error: unknown) {
      console.error('Errore durante l\'eliminazione:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Funzione per scaricare il file
  const handleDownloadFile = (file: FileInfo) => {
    // Crea un elemento a temporaneo
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-30">
        <Navbar />
        <div className="bg-white border-b border-gray-200 flex justify-between px-6 py-2">
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant={activeTab === "files" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => navigate("/dashboard/file")}
              className="flex items-center gap-2"
            >
              <File className="h-4 w-4 mr-1" />
              I miei file
            </Button>
            <Button 
              variant={activeTab === "projects" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => navigate("/dashboard/ordini")}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Ordini
            </Button>
            <Button 
              variant={activeTab === "messages" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => navigate("/dashboard/messaggi")}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Messaggi
            </Button>
            <Button 
              variant={activeTab === "profile" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => navigate("/dashboard/profilo")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4 mr-1" />
              Profilo
            </Button>
          </div>

          {/* Mobile Navigation - Dropdown menu */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  {activeTab === "files" && "I miei file"}
                  {activeTab === "projects" && "Ordini"}
                  {activeTab === "messages" && "Messaggi"}
                  {activeTab === "profile" && "Profilo"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem 
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Torna al sito
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/dashboard/file")}
                  className="flex items-center gap-2"
                >
                  <File className="h-4 w-4" />
                  I miei file
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/dashboard/ordini")}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Ordini
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/dashboard/messaggi")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messaggi
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/dashboard/profilo")}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profilo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      <main className="flex-1">
        {/* Dashboard Content */}
        <section className={`${activeTab === "messages" ? "" : "py-8 md:py-10"}`} style={activeTab !== "messages" ? {backgroundColor: '#E4DDD4'} : {}}>
          <div className="container-custom">
            {/* Hidden TabsList - we're using our custom navigation instead */}
            <div className="hidden">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="files">I miei file</TabsTrigger>
                  <TabsTrigger value="projects">Ordini</TabsTrigger>
                  <TabsTrigger value="messages">Messaggi</TabsTrigger>
                  <TabsTrigger value="profile">Profilo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Files Tab */}
            {activeTab === "files" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">I tuoi file</h2>
                    <Button size="sm" onClick={handleOpenUploadDialog}>
                      Carica file
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map(file => (
                        <div key={file.id} className="border rounded-lg overflow-hidden">
                          <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                               onClick={() => handleOpenPreview(file)}>
                            {file.type === '3d' && (
                              <div className="h-full w-full">
                                <ModelViewerPreventivo 
                                  file={null} 
                                  fileType={file.name.split('.').pop()?.toLowerCase() || 'stl'}
                                  url={file.url}
                                />
                              </div>
                            )}
                            {file.type === 'image' && (
                              <img 
                                src={file.url} 
                                alt={file.name} 
                                className="h-full w-full object-contain"
                              />
                            )}
                            {file.type === 'pdf' && (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium mt-2">PDF</span>
                              </div>
                            )}
                            {file.type === 'other' && (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                {getFileIcon('other', file.name)}
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleOpenRename(file)}
                                  title="Rinomina file"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDownloadFile(file)}
                                  title="Scarica file"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleOpenDeleteDialog(file)}
                                  title="Elimina file"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-brand-gray mb-4">Non hai ancora caricato nessun file.</p>
                      <Button onClick={handleOpenUploadDialog}>
                        Carica il tuo primo file
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">I tuoi ordini</h2>
                  <Button size="sm" onClick={() => navigate("/dashboard/ordini/nuovo")}>
                    Nuovo ordine
                  </Button>
                </div>
                <UserProjectsManager />
              </div>
            )}
            
            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-8rem)]">
                <MessagesContainer />
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <UserPanel />
            )}
          </div>
        </section>
      </main>
      
      {shouldRenderFooter && <Footer />}
      
      {/* Dialog per caricamento file */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carica file</DialogTitle>
            <DialogDescription>
              Carica modelli 3D o immagini per i tuoi ordini
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center my-4 ${isDragging ? 'border-brand-blue bg-blue-50' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="max-w-xs overflow-hidden">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                {/* Preview del file nel dialog di caricamento */}
                {previewFile && (
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
                    {previewFile.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(previewFile)} 
                        alt="Preview" 
                        className="h-full w-full object-contain"
                      />
                    ) : getFileTypeFromExtension(previewFile.name) === '3d' ? (
                      <div className="h-full w-full">
                        <ModelViewerPreventivo 
                          file={previewFile} 
                          fileType={previewType}
                        />
                      </div>
                    ) : getFileTypeFromExtension(previewFile.name) === 'pdf' ? (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium mt-2">PDF</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getFileIcon('other', previewFile.name)}
                      </div>
                    )}
                  </div>
                )}
                
                {uploadLoading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}% completato</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm font-medium">
                    Trascina qui il tuo file o
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".stl,.obj,.3mf,.gltf,.glb,.jpg,.jpeg,.png,.webp"
                />
                <Button 
                  variant="outline" 
                  onClick={handleFileBrowse}
                >
                  Seleziona file
                </Button>
                <p className="text-xs text-gray-500">
                  Formati supportati: STL, OBJ, 3MF, GLTF, GLB, JPG, PNG, WEBP
                  <br />
                  Dimensione massima: 50MB
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploadLoading}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploadLoading}
            >
              {uploadLoading ? 'Caricamento...' : 'Carica'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per anteprima grande */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          
          <div className="h-[60vh] bg-gray-100 flex items-center justify-center">
            {previewFileType === 'stl' || previewFileType === 'obj' || previewFileType === 'gltf' || previewFileType === 'glb' || previewFileType === '3mf' ? (
              <div className="h-full w-full">
                <ModelViewerPreventivo 
                  file={null} 
                  fileType={previewFileType}
                  url={previewUrl}
                />
              </div>
            ) : (previewFileType === 'jpg' || previewFileType === 'jpeg' || previewFileType === 'png' || previewFileType === 'webp' || previewFileType === 'gif') ? (
              <img 
                src={previewUrl} 
                alt={previewName} 
                className="max-h-full max-w-full object-contain"
              />
            ) : previewFileType === 'pdf' ? (
              <iframe 
                src={previewUrl} 
                className="w-full h-full" 
                title={previewName}
              />
            ) : (
              <div className="text-center p-6">
                <div className="text-gray-400 flex flex-col items-center">
                  {getFileIcon(getFileTypeFromExtension(previewName), previewName)}
                  <p className="mt-4 text-gray-600">Anteprima non disponibile per questo tipo di file</p>
                  <Button className="mt-4" asChild>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                      Apri in una nuova finestra
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = previewUrl;
                a.download = previewName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }} 
            >
              Scarica file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per rinominare file */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rinomina file</DialogTitle>
            <DialogDescription>
              Inserisci il nuovo nome per il file. L'estensione originale verrà mantenuta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="filename">Nuovo nome</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="filename" 
                  value={newFileName} 
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Inserisci il nuovo nome"
                  className="flex-1"
                />
                {fileToRename && fileToRename.name.includes('.') && (
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {fileToRename.name.substring(fileToRename.name.lastIndexOf('.'))}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleRenameFile}>
              Rinomina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per conferma eliminazione */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina file</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo file? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
