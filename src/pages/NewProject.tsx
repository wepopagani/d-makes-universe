import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/firebase/AuthContext';
import { db, storage } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
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
import { FileInfo, Project } from '@/types/user';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Checkbox } from "@/components/ui/checkbox";
import { ModelViewerPreventivo } from '@/components/ModelViewer';

const NewProject = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('planning');
  const [notes, setNotes] = useState<string>('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);
  
  // Stato per l'upload di file
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  
  // Lista di stati possibili
  const statuses = [
    { id: 'planning', name: 'In Pianificazione' },
    { id: 'in_progress', name: 'In Progresso' },
    { id: 'completed', name: 'Completato' },
    { id: 'cancelled', name: 'Annullato' },
  ];
  
  // Carica i file dell'utente
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchUserFiles();
  }, [currentUser]);
  
  // Funzione per recuperare i file dell'utente
  const fetchUserFiles = async () => {
    if (!currentUser) return;
    
    try {
      const filesQuery = query(
        collection(db, 'files'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(filesQuery);
      
      const userFiles: FileInfo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userFiles.push({
          id: doc.id,
          name: data.originalName || data.name,
          type: data.type,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl || null,
          storagePath: data.storagePath,
          uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : new Date(),
          userId: data.userId
        });
      });
      
      setFiles(userFiles);
    } catch (error: any) {
      console.error('Errore durante il recupero dei file:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tuoi file: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingFiles(false);
    }
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!name || !description || !status) {
      toast({
        title: "Errore",
        description: "Completa tutti i campi richiesti.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Unisci i file caricati direttamente con quelli selezionati
      const allSelectedFiles = [
        ...selectedFiles,
        ...uploadedFiles.map(file => file.id)
      ];
      
      // Crea il progetto in Firestore
      const projectData = {
        name,
        description,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: currentUser.uid,
        files: allSelectedFiles,
        notes: notes || null,
        // Se c'è un'immagine tra i file caricati, usala come thumbnail
        thumbnailUrl: uploadedFiles.find(f => f.type === 'image')?.url || null
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      toast({
        title: "Progetto creato",
        description: "Il tuo progetto è stato creato con successo.",
      });
      
      // Reindirizza alla dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Errore durante la creazione del progetto:', error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Gestisce la selezione/deselezione dei file
  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };
  
  // Funzioni per l'upload e preview dei file
  const handleFileBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      
      // Imposta il file per la preview
      const selectedFile = e.target.files[0];
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
  
  // Funzione per caricare il file
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
      const allowed3DFormats = ['obj', 'stl', 'gltf', 'glb', '3mf', 'step', 'stp'];
      const allowedImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!file.type.startsWith('image/') && 
          !allowed3DFormats.includes(fileExtension || '') &&
          !file.type.startsWith('application/pdf')) {
        throw new Error('Formato file non supportato. Formati consentiti: immagini, PDF e modelli 3D (obj, stl, gltf, glb, 3mf, step).');
      }
      
      // Crea un nome file sicuro con timestamp per evitare conflitti
      const timestamp = Date.now();
      const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Percorso per lo storage
      const storagePath = `files/${currentUser.uid}/${safeFileName}`;
      
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
          
          // Determina il tipo di file
          const fileType = file.type.startsWith('image/') ? 'image' : 
                          allowed3DFormats.includes(fileExtension?.toLowerCase() || '') ? '3d' : 'other';
          
          // Salva le informazioni del file in Firestore
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
          
          const newFile: FileInfo = {
            id: fileDocRef.id,
            name: file.name,
            type: fileType,
            url: downloadURL,
            storagePath,
            uploadedAt: new Date(),
            userId: currentUser.uid
          };
          
          // Aggiungi il file caricato alla lista
          setUploadedFiles(prev => [...prev, newFile]);
          
          toast({
            title: "File caricato",
            description: "Il file è stato caricato con successo.",
          });
          
          // Reset dello stato
          setFile(null);
          setUploadProgress(0);
          setUploadLoading(false);
          
          // Aggiorna la lista dei file
          fetchUserFiles();
          
          // Reset del file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error: any) {
      console.error('Errore generale durante il caricamento:', error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
      setUploadLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Nuovo Progetto</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Dettagli Progetto</CardTitle>
                  <CardDescription>
                    Inserisci le informazioni del tuo progetto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Progetto</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Es. Modello Eiffel"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrivi il tuo progetto..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Stato</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Seleziona uno stato" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Note aggiuntive</Label>
                    <Textarea 
                      id="notes" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Note aggiuntive o istruzioni..."
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-8">
                {/* Carica file */}
                <Card>
                  <CardHeader>
                    <CardTitle>Carica file</CardTitle>
                    <CardDescription>
                      Carica modelli 3D o immagini per il tuo progetto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-brand-blue bg-blue-50' : 'border-gray-300'}`}
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
                          
                          {/* Anteprima del file */}
                          {previewFile && (
                            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
                              {previewFile.type.startsWith('image/') ? (
                                <img 
                                  src={URL.createObjectURL(previewFile)} 
                                  alt="Preview" 
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="h-full w-full">
                                  <ModelViewerPreventivo 
                                    file={previewFile} 
                                    fileType={previewType}
                                  />
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
                          
                          <div className="flex space-x-2 justify-center">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setFile(null);
                                setPreviewFile(null);
                              }} 
                              disabled={uploadLoading}
                            >
                              Rimuovi
                            </Button>
                            <Button 
                              onClick={handleUpload} 
                              disabled={uploadLoading}
                            >
                              {uploadLoading ? 'Caricamento...' : 'Carica'}
                            </Button>
                          </div>
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
                            accept=".stl,.obj,.3mf,.gltf,.glb,.step,.stp,.jpg,.jpeg,.png,.webp"
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleFileBrowse}
                          >
                            Carica file
                          </Button>
                          <p className="text-xs text-gray-500">
                            Formati supportati: STL, OBJ, 3MF, GLTF, GLB, STEP, JPG, PNG, WEBP
                            <br />
                            Dimensione massima: 50MB
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* File caricati */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-2">File caricati:</h3>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center p-2 border rounded-md">
                              <div className="w-8 h-8 flex items-center justify-center mr-2">
                                {file.type === 'image' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                              <span className="flex-1 font-medium text-sm truncate">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>File associati</CardTitle>
                    <CardDescription>
                      Seleziona i file da associare al progetto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingFiles ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <p>Non hai ancora caricato nessun file.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Lista file disponibili */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border-r pr-4">
                          <h3 className="text-sm font-medium">File disponibili</h3>
                          {files.map(file => (
                            <div 
                              key={file.id} 
                              className={`flex items-start space-x-2 p-2 border rounded-md ${selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : ''}`}
                              onClick={() => handleFileToggle(file.id)}
                            >
                              <Checkbox 
                                id={`file-${file.id}`} 
                                checked={selectedFiles.includes(file.id)}
                                onCheckedChange={() => handleFileToggle(file.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 ml-2">
                                <Label htmlFor={`file-${file.id}`} className="cursor-pointer">
                                  <div className="font-medium">{file.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {file.type} - {new Date(file.uploadedAt).toLocaleDateString()}
                                  </div>
                                </Label>
                              </div>
                              {file.type === 'image' && (
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                  <img 
                                    src={file.url} 
                                    alt={file.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {file.type === '3d' && (
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Anteprima file selezionato */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Anteprima file selezionati ({selectedFiles.length})</h3>
                          
                          {selectedFiles.length === 0 ? (
                            <div className="border rounded-md p-4 flex items-center justify-center h-[300px] bg-gray-50">
                              <p className="text-gray-500 text-center">
                                Seleziona uno o più file dalla lista<br/>
                                per vedere l'anteprima
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                              {selectedFiles.map(fileId => {
                                const selectedFile = files.find(f => f.id === fileId);
                                if (!selectedFile) return null;
                                
                                return (
                                  <div key={fileId} className="border rounded-md p-2">
                                    <div className="mb-2">
                                      <h4 className="font-medium text-sm">{selectedFile.name}</h4>
                                    </div>
                                    
                                    <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
                                      {selectedFile.type === 'image' && (
                                        <img 
                                          src={selectedFile.url} 
                                          alt={selectedFile.name} 
                                          className="h-full w-full object-contain"
                                        />
                                      )}
                                      {selectedFile.type === '3d' && (
                                        <div className="h-full w-full">
                                          <ModelViewerPreventivo 
                                            file={null} 
                                            fileType={selectedFile.name.split('.').pop()?.toLowerCase() || ''}
                                          />
                                        </div>
                                      )}
                                      {selectedFile.type === 'other' && (
                                        <div className="h-full w-full flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => handleFileToggle(fileId)}
                                    >
                                      Rimuovi
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Riepilogo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Nome:</span>
                        <span>{name || "Non specificato"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Stato:</span>
                        <span>{statuses.find(s => s.id === status)?.name || status}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">File selezionati:</span>
                        <span>{selectedFiles.length + uploadedFiles.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creazione in corso...' : 'Crea Progetto'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewProject; 