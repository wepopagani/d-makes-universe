import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, Timestamp, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/firebase/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Eye, 
  Mail, 
  MailOpen, 
  Search, 
  MessageCircle,
  UserRound
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  projectId: string;
  projectName: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  isRead: boolean;
  isAdmin: boolean;
}

interface ProjectConversation {
  projectId: string;
  projectName: string;
  userId: string;
  userEmail: string;
  lastMessage: Date;
  unreadCount: number;
  messages: Message[];
}

const AdminMessagesManager = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ProjectConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ProjectConversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        // Ottieni tutti i messaggi ordine temporalmente
        const messagesQuery = query(
          collection(db, "messages"),
          orderBy("timestamp", "asc")
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        const allMessages: Message[] = [];
        
        messagesSnapshot.forEach(doc => {
          const data = doc.data();
          allMessages.push({
            id: doc.id,
            text: data.text,
            projectId: data.projectId,
            projectName: data.projectName,
            userId: data.userId,
            userEmail: data.userEmail,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            isRead: data.isRead,
            isAdmin: data.isAdmin,
          });
        });
        
        setMessages(allMessages);
        
        // Organizza i messaggi in conversazioni per progetto
        const conversationMap = new Map<string, ProjectConversation>();
        
        allMessages.forEach(message => {
          const key = `${message.projectId}-${message.userId}`;
          
          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              projectId: message.projectId,
              projectName: message.projectName,
              userId: message.userId,
              userEmail: message.userEmail,
              lastMessage: message.timestamp,
              unreadCount: message.isAdmin ? 0 : (message.isRead ? 0 : 1),
              messages: [message]
            });
          } else {
            const conversation = conversationMap.get(key)!;
            conversation.messages.push(message);
            
            // Aggiorna la data dell'ultimo messaggio se necessario
            if (message.timestamp > conversation.lastMessage) {
              conversation.lastMessage = message.timestamp;
            }
            
            // Incrementa il contatore dei messaggi non letti se necessario
            if (!message.isAdmin && !message.isRead) {
              conversation.unreadCount += 1;
            }
          }
        });
        
        // Converti in array e ordina per data dell'ultimo messaggio
        const conversationsArray = Array.from(conversationMap.values()).sort(
          (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime()
        );
        
        setConversations(conversationsArray);
      } catch (error) {
        console.error("Errore nel caricamento dei messaggi:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei messaggi",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentUser, toast]);
  
  // Filtra le conversazioni in base alla ricerca
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Formatta la data relativa
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: it });
  };
  
  // Seleziona una conversazione e segna i messaggi come letti
  const handleSelectConversation = async (conversation: ProjectConversation) => {
    setActiveConversation(conversation);
    
    // Segna i messaggi non letti come letti
    const unreadMessages = conversation.messages.filter(m => !m.isAdmin && !m.isRead);
    
    if (unreadMessages.length > 0) {
      try {
        // Aggiorna lo stato dei messaggi nel database
        for (const message of unreadMessages) {
          await updateDoc(doc(db, "messages", message.id), {
            isRead: true
          });
        }
        
        // Aggiorna lo stato locale
        const updatedConversations = conversations.map(c => {
          if (c.projectId === conversation.projectId && c.userId === conversation.userId) {
            return {
              ...c,
              unreadCount: 0,
              messages: c.messages.map(m => {
                if (!m.isAdmin && !m.isRead) {
                  return { ...m, isRead: true };
                }
                return m;
              })
            };
          }
          return c;
        });
        
        setConversations(updatedConversations);
        
        // Aggiorna anche activeConversation
        setActiveConversation({
          ...conversation,
          unreadCount: 0,
          messages: conversation.messages.map(m => {
            if (!m.isAdmin && !m.isRead) {
              return { ...m, isRead: true };
            }
            return m;
          })
        });
      } catch (error) {
        console.error("Errore nell'aggiornamento dello stato dei messaggi:", error);
      }
    }
  };
  
  // Invia una risposta
  const handleSendReply = async () => {
    if (!activeConversation || !replyText.trim() || !currentUser) return;
    
    try {
      setSending(true);
      
      // Aggiungi il messaggio a Firestore
      await addDoc(collection(db, "messages"), {
        text: replyText,
        projectId: activeConversation.projectId,
        projectName: activeConversation.projectName,
        userId: activeConversation.userId,
        userEmail: activeConversation.userEmail,
        timestamp: Timestamp.now(),
        isRead: false,
        isAdmin: true
      });
      
      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato con successo",
      });
      
      // Aggiorna lo stato locale
      const newMessage: Message = {
        id: 'temp-' + Date.now(), // ID temporaneo
        text: replyText,
        projectId: activeConversation.projectId,
        projectName: activeConversation.projectName,
        userId: activeConversation.userId,
        userEmail: activeConversation.userEmail,
        timestamp: new Date(),
        isRead: false,
        isAdmin: true
      };
      
      // Aggiorna la conversazione attiva
      const updatedActiveConversation = {
        ...activeConversation,
        lastMessage: new Date(),
        messages: [...activeConversation.messages, newMessage]
      };
      
      setActiveConversation(updatedActiveConversation);
      
      // Aggiorna la lista delle conversazioni
      const updatedConversations = conversations.map(c => {
        if (c.projectId === activeConversation.projectId && c.userId === activeConversation.userId) {
          return {
            ...c,
            lastMessage: new Date(),
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      });
      
      // Riordina le conversazioni in base all'ultimo messaggio
      const sortedConversations = [...updatedConversations].sort(
        (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime()
      );
      
      setConversations(sortedConversations);
      
      // Resetta il testo della risposta
      setReplyText("");
    } catch (error) {
      console.error("Errore nell'invio della risposta:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio della risposta",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messaggi Clienti</CardTitle>
          <CardDescription>
            Gestisci e rispondi alle richieste dei clienti riguardo agli ordini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md h-[70vh] flex">
            {/* Colonna sinistra: lista conversazioni */}
            <div className="w-1/3 border-r overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Cerca cliente o progetto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="overflow-auto flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-20">
                    <Mail className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Nessun messaggio trovato</p>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conversation) => (
                      <div
                        key={`${conversation.projectId}-${conversation.userId}`}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          activeConversation?.projectId === conversation.projectId && 
                          activeConversation?.userId === conversation.userId
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{conversation.projectName}</h4>
                            <p className="text-sm text-gray-600 truncate max-w-[12rem]">
                              {conversation.userEmail}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(conversation.lastMessage)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="mt-1">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonna destra: conversazione attiva */}
            <div className="w-2/3 flex flex-col">
              {activeConversation ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{activeConversation.projectName}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <UserRound className="h-3 w-3 mr-1" />
                          {activeConversation.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {activeConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            message.isAdmin 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p>{message.text}</p>
                          <div className={`text-xs mt-1 ${message.isAdmin ? "text-blue-100" : "text-gray-500"}`}>
                            {formatRelativeTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Scrivi una risposta..."
                        className="flex-1 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={handleSendReply} 
                        disabled={!replyText.trim() || sending}
                        className="self-end"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <MessageCircle className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">Nessuna conversazione selezionata</h3>
                    <p className="text-gray-400">Seleziona una conversazione per visualizzare i messaggi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessagesManager; 