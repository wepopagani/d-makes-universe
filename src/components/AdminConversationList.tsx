import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/firebase/AuthContext";
import { getAdminConversations, ADMIN_ID, getUser } from "@/utils/messageService";
import { Conversation } from "@/types/messages";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageSquare, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const AdminConversationList: React.FC<AdminConversationListProps> = ({
  onSelectConversation
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Verifica che l'utente corrente sia l'admin
  const isAdmin = currentUser?.email === "info@3dmakes.ch";
  
  // Carica tutte le conversazioni per l'admin
  useEffect(() => {
    if (!currentUser || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const unsubscribe = getAdminConversations(ADMIN_ID, (loadedConversations) => {
        // Filtra solo le conversazioni che coinvolgono effettivamente l'admin
        const adminConversations = loadedConversations.filter(
          conv => conv.participants?.includes(ADMIN_ID) && conv.participants.length === 2
        );
        
        setConversations(adminConversations);
        setIsLoading(false);
        
        // Raccogli gli ID degli utenti dalle conversazioni
        const userIds = new Set<string>();
        adminConversations.forEach(conv => {
          if (conv.participants) {
            conv.participants.forEach(id => {
              if (id !== ADMIN_ID) {
                userIds.add(id);
              }
            });
          }
        });
        
        // Carica i dati degli utenti
        userIds.forEach(async (userId) => {
          try {
            const userData = await getUser(userId);
            if (userData) {
              setUserNames(prev => ({
                ...prev,
                [userId]: `${userData.nome || ''} ${userData.cognome || ''}`.trim() || 'Utente'
              }));
            }
          } catch (error) {
            console.error(`Error fetching user data for ${userId}:`, error);
            // Non blocchiamo l'UI per un errore nel recupero del nome utente
            setUserNames(prev => ({
              ...prev,
              [userId]: 'Utente'
            }));
          }
        });
      });
      
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error fetching admin conversations:", error);
      setError("Impossibile caricare le conversazioni. Riprova più tardi.");
      setIsLoading(false);
    }
  }, [currentUser, isAdmin]);
  
  // Formatta la data dell'ultimo messaggio
  const formatLastMessageDate = (date: any) => {
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
      console.error("Error formatting date:", error);
      return "Data non disponibile";
    }
  };
  
  // Ottieni il nome dell'utente dalla conversazione
  const getUserNameFromConversation = (conversation: Conversation) => {
    if (!conversation.participants) return "Utente sconosciuto";
    
    const userId = conversation.participants.find(id => id !== ADMIN_ID);
    return userId ? (userNames[userId] || "Utente") : "Utente sconosciuto";
  };
  
  // Filtra le conversazioni in base alla ricerca
  const filteredConversations = conversations.filter(conv => {
    const userName = getUserNameFromConversation(conv);
    const subject = conv.subject || "";
    const lastMessage = conv.lastMessage || "";
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      userName.toLowerCase().includes(searchTermLower) ||
      subject.toLowerCase().includes(searchTermLower) ||
      lastMessage.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Gestisce il retry del caricamento
  const handleRetry = () => {
    if (!currentUser || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    // Ricarichiamo la pagina per forzare un rifetch completo
    window.location.reload();
  };
  
  // Se l'utente non è admin, non mostrare nulla
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <p className="text-gray-500">Non hai accesso a questa pagina.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Tutte le conversazioni</h2>
        <p className="text-sm text-gray-500 mb-4">
          Gestisci le conversazioni con i clienti
        </p>
        
        {/* Search Box */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Cerca per nome, oggetto o messaggio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
            <p className="text-lg font-medium">Errore nel caricamento delle conversazioni</p>
            <p className="text-gray-500 mt-1 mb-4">{error}</p>
            <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Riprova
            </Button>
          </div>
        ) : filteredConversations.length > 0 ? (
          <>
            {filteredConversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 bg-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getUserNameFromConversation(conversation).substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">
                        {getUserNameFromConversation(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageDate(conversation.lastMessageDate)}
                      </span>
                    </div>
                    {conversation.subject && (
                      <p className="text-sm font-medium truncate">
                        {conversation.subject}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Nessuna conversazione trovata</p>
            <p className="text-gray-500 mt-1">
              {searchTerm ? "Prova a modificare i criteri di ricerca" : "Non ci sono conversazioni attive al momento"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConversationList; 