import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/firebase/AuthContext";
import { 
  sendMessage, 
  getConversationMessages, 
  markMessageAsRead,
  ADMIN_ID,
  getUser
} from "@/utils/messageService";
import { Message } from "@/types/messages";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  ArrowLeft,
  Paperclip,
  Send,
  X,
  ImageIcon, 
  FileIcon,
  AlertTriangle,
  Box,
  Download,
  Plus,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModelViewer from "./ModelViewer";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// File size limit in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Accepted 3D model file extensions
const MODEL_FILE_EXTENSIONS = [
  '.stl', '.obj', '.fbx', '.gltf', '.glb', '.3ds', '.step', '.stp', '.iges', '.igs'
];

interface MessageChatProps {
  conversationId: string;
  participants: string[];
  subject?: string;
  onBack?: () => void;
}

const MessageChat: React.FC<MessageChatProps> = ({ 
  conversationId, 
  onBack,
  participants,
  subject
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [userName, setUserName] = useState<string>("Utente");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stati per la preview del file 3D
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{url: string, name: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const isAdmin = currentUser?.email === "info@3dmakes.ch";
  
  // Recupera il nome dell'utente se si è admin, altrimenti mostra il nome dell'admin
  useEffect(() => {
    if (isAdmin && participants && participants.length > 1) {
      const clientId = participants.find(id => id !== ADMIN_ID);
      if (clientId) {
        getUser(clientId).then(userData => {
          if (userData) {
            setUserName(`${userData.nome || ''} ${userData.cognome || ''}`.trim() || 'Utente');
          }
        }).catch(err => {
          console.error("Errore nel recupero dati utente:", err);
          // Non impostare un errore qui, continua a usare il nome utente di default
        });
      }
    } else if (!isAdmin) {
      // Se non è admin, mostra il nome dell'admin (Marco)
      setUserName("Marco");
    }
  }, [isAdmin, participants]);
  
  // Carica i messaggi della conversazione
  useEffect(() => {
    if (!conversationId || !currentUser) {
      setIsLoadingMessages(false);
      return;
    }
    
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const unsubscribe = getConversationMessages(conversationId, (loadedMessages) => {
        setMessages(loadedMessages);
        setIsLoadingMessages(false);
        
        // Segna i messaggi come letti
        loadedMessages.forEach(msg => {
          if (msg.receiverId === currentUser.uid && !msg.read) {
            markMessageAsRead(msg.id).catch(error => {
              console.error("Errore nel segnare il messaggio come letto:", error);
              // Non bloccare l'interfaccia per questo errore
            });
          }
        });
      });
      
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error);
      setError("Impossibile caricare i messaggi. Riprova più tardi.");
      setIsLoadingMessages(false);
    }
  }, [conversationId, currentUser]);
  
  // Scroll automatico ai nuovi messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    if (chatEndRef.current && messageAreaRef.current) {
      // Scroll solo l'area dei messaggi, non la pagina
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  };
  
  // Controlla se un file è un modello 3D
  const is3DModelFile = (fileName: string): boolean => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return MODEL_FILE_EXTENSIONS.includes(extension);
  };
  
  // Formatta la data del messaggio
  const formatMessageDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      // Gestisci sia Date che Firestore Timestamp
      const messageDate = date instanceof Date ? date : (
        date.toDate ? date.toDate() : new Date(date.seconds * 1000)
      );
      
      return formatDistanceToNow(messageDate, {
        addSuffix: true,
        locale: it
      });
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return 'Data non disponibile';
    }
  };
  
  // Gestisce l'invio del messaggio
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentUser) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per inviare messaggi.",
        variant: "destructive"
      });
      return;
    }
    if (!participants || participants.length < 2) {
      toast({
        title: "Errore",
        description: "Impossibile determinare il destinatario del messaggio.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ottieni il destinatario del messaggio
      const receiverId = currentUser.email === "info@3dmakes.ch" 
        ? participants.find(id => id !== ADMIN_ID) || "" // Se è l'admin, invia al cliente
        : ADMIN_ID; // Se è il cliente, invia all'admin
      
      await sendMessage(
        currentUser.uid, 
        receiverId, 
        newMessage.trim(), 
        subject || "Assistenza cliente", 
        attachments
      );
      
      setNewMessage("");
      setAttachments([]);
      
      // Non è necessario aggiornare manualmente messages perché l'onSnapshot lo farà
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestisce il caricamento degli allegati
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limita il numero di allegati (massimo 5)
      if (attachments.length + filesArray.length > 5) {
        toast({
          title: "Limite raggiunto",
          description: "Puoi allegare al massimo 5 file per messaggio.",
          variant: "destructive"
        });
        return;
      }
      
      // Controlla le dimensioni (massimo 50MB per file)
      const oversizedFiles = filesArray.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast({
          title: "File troppo grande",
          description: "I file devono essere di dimensione inferiore a 50MB.",
          variant: "destructive"
        });
        return;
      }
      
      setAttachments(prev => [...prev, ...filesArray]);
      
      // Resetta l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Funzioni per la gestione della preview e salvataggio file
  const handleFilePreview = (url: string, fileName: string) => {
    setPreviewFile({ url, name: fileName });
    setIsPreviewOpen(true);
  };
  
  const handleDownloadFile = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSaveToUserFiles = () => {
    if (!previewFile) return;
    setSaveFileName(previewFile.name.replace(/\.[^/.]+$/, "")); // Rimuovi estensione
    setShowSaveDialog(true);
  };
  
  const confirmSaveToUserFiles = async () => {
    if (!previewFile || !currentUser || !saveFileName.trim()) return;
    
    try {
      setIsSaving(true);
      
      // Determina il tipo di file
      const fileExtension = previewFile.name.split('.').pop()?.toLowerCase() || '';
      let fileType: 'image' | '3d' | 'pdf' | 'other' = 'other';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
        fileType = 'image';
      } else if (['obj', 'stl', 'gltf', 'glb', '3mf', 'step', 'stp'].includes(fileExtension)) {
        fileType = '3d';
      } else if (fileExtension === 'pdf') {
        fileType = 'pdf';
      }
      
      // Salva il file nella collezione files dell'utente
      await addDoc(collection(db, 'files'), {
        name: `${saveFileName}.${fileExtension}`,
        originalName: previewFile.name,
        type: fileType,
        url: previewFile.url,
        uploadedAt: Timestamp.now(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        addedFromChat: true
      });
      
      toast({
        title: "File salvato",
        description: `Il file "${saveFileName}" è stato aggiunto alla tua dashboard.`,
      });
      
      setShowSaveDialog(false);
      setIsPreviewOpen(false);
      setSaveFileName("");
      
    } catch (error) {
      console.error("Error saving file:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il file nella dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Renderizza il componente
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div className="flex items-center">
          <Avatar className="h-9 w-9 mr-2 bg-blue-100">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{userName}</div>
            {subject && <div className="text-sm text-muted-foreground">{subject}</div>}
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div ref={messageAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 text-center p-4">
            <AlertTriangle className="h-10 w-10 text-orange-500 mb-2" />
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Riprova
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-center p-4">
            <div>
              <p>Non ci sono ancora messaggi in questa conversazione</p>
              <p className="text-sm mt-2">Scrivi un messaggio per iniziare la conversazione.</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => {
              const isCurrentUser = currentUser && message.senderId === currentUser.uid;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content && (
                      <div className="whitespace-pre-wrap break-words mb-2">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachmentUrls && message.attachmentUrls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.attachmentUrls.map((url, index) => {
                          const fileName = message.attachmentNames?.[index] || "Allegato";
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                          const is3DModel = is3DModelFile(fileName);
                          
                          return (
                            <div key={index} className="relative group">
                              {isImage ? (
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="block"
                                >
                                  <img 
                                    src={url} 
                                    alt={fileName} 
                                    className="max-h-32 max-w-full rounded object-cover" 
                                  />
                                </a>
                              ) : is3DModel ? (
                                <div className="relative">
                                  <div
                                    className={`flex items-center p-3 rounded cursor-pointer transition-all duration-200 ${
                                      isCurrentUser 
                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                  }`}
                                    onClick={() => handleFilePreview(url, fileName)}
                                >
                                    <Box size={20} className="mr-3" />
                                    <div className="flex-1">
                                      <span className="text-sm font-medium block">
                                        {fileName}
                                      </span>
                                      <span className="text-xs opacity-75">
                                        Modello 3D • Clicca per anteprima
                                  </span>
                                    </div>
                                    <Eye size={16} className="ml-2 opacity-75" />
                                  </div>
                                  
                                  {/* Overlay con bottoni in hover (solo per desktop) */}
                                  <div className={`absolute inset-0 ${
                                    isCurrentUser ? 'bg-blue-700' : 'bg-gray-300'
                                  } bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center space-x-2 hidden md:flex`}>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFilePreview(url, fileName);
                                      }}
                                      className="text-xs"
                                    >
                                      <Eye size={14} className="mr-1" />
                                      Anteprima
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadFile(url, fileName);
                                      }}
                                      className="text-xs"
                                    >
                                      <Download size={14} className="mr-1" />
                                      Scarica
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <a 
                                  href={url} 
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className={`flex items-center p-2 rounded ${
                                    isCurrentUser ? 'bg-blue-600' : 'bg-gray-200'
                                  }`}
                                >
                                  <FileIcon size={16} className="mr-2" />
                                  <span className="text-sm truncate max-w-[150px]">
                                    {fileName}
                                  </span>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div 
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </>
        )}
      </div>
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-2 border-t flex flex-wrap gap-2">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const is3DModel = is3DModelFile(file.name);
            
            return (
              <div 
                key={index} 
                className="relative group bg-gray-100 rounded p-2 flex items-center"
              >
                {isImage ? (
                  <ImageIcon size={16} className="mr-2" />
                ) : is3DModel ? (
                  <Box size={16} className="mr-2 text-blue-600" />
                ) : (
                  <FileIcon size={16} className="mr-2" />
                )}
                <span className="text-sm truncate max-w-[120px]">
                  {file.name}
                  {is3DModel && <span className="text-xs text-blue-600 ml-1">(3D)</span>}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ml-1 p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-start">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.stl,.obj,.fbx,.gltf,.glb,.3ds,.step,.stp,.iges,.igs"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAttachmentClick}
            className="mt-1"
            disabled={attachments.length >= 5 || isLoading}
          >
            <Paperclip size={20} />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 min-h-10 max-h-32 resize-none mx-2"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
            className="mt-1"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
        
        {/* File upload helper text */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          È possibile caricare file fino a 50MB, inclusi immagini, documenti e modelli 3D (.stl, .obj, .fbx, ecc.)
        </div>
      </form>
      
      {/* Dialog per preview file 3D */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Box className="mr-2" />
              Anteprima Modello 3D
            </DialogTitle>
            <DialogDescription>
              {previewFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {previewFile && (
              <div className="h-[400px] border rounded-lg overflow-hidden">
                <ModelViewer 
                  file={null}
                  url={previewFile.url}
                  fileType={previewFile.name.split('.').pop()?.toLowerCase() || 'stl'}
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => previewFile && handleDownloadFile(previewFile.url, previewFile.name)}
              >
                <Download size={16} className="mr-2" />
                Scarica
              </Button>
              {!isAdmin && (
                <Button
                  onClick={handleSaveToUserFiles}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Aggiungi alla Dashboard
                </Button>
              )}
            </div>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per salvare il file nella dashboard */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi file alla tua dashboard</DialogTitle>
            <DialogDescription>
              Inserisci un nome per il file che verrà salvato nella tua dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">Nome del file</Label>
              <Input
                id="fileName"
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                placeholder="Inserisci il nome del file..."
                disabled={isSaving}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
            >
              Annulla
            </Button>
            <Button 
              onClick={confirmSaveToUserFiles}
              disabled={isSaving || !saveFileName.trim()}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Salva
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageChat; 