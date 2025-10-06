import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/firebase/AuthContext";
import { getUserConversations, sendMessage, createAdminConversation, ADMIN_ID } from "@/utils/messageService";
import { Conversation } from "@/types/messages";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [adminConversation, setAdminConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carica la conversazione con l'admin
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = getUserConversations(currentUser.uid, (loadedConversations) => {
      // Cerca la conversazione con l'admin
      // Filtra solo le conversazioni che coinvolgono l'utente corrente
      const userConversations = loadedConversations.filter(
        conv => conv.participants.includes(currentUser.uid)
      );
      
      // Trova la conversazione con l'admin
      const foundAdminConversation = userConversations.find(
        conv => conv.participants.includes(ADMIN_ID)
      );
      
      if (foundAdminConversation) {
        setAdminConversation(foundAdminConversation);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);
  
  // Formatta la data dell'ultimo messaggio
  const formatLastMessageDate = (date: any) => {
    if (!date) return 'N/A';
    
    // Gestisci sia Date che Firestore Timestamp
    const messageDate = date instanceof Date ? date : (
      date.toDate ? date.toDate() : new Date(date.seconds * 1000)
    );
    
    return formatDistanceToNow(messageDate, {
      addSuffix: true,
      locale: it
    });
  };
  
  // Crea una nuova conversazione con l'admin
  const handleCreateAdminConversation = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Crea o recupera la conversazione con l'admin
      const conversationId = await createAdminConversation(
        currentUser.uid, 
        ADMIN_ID,
        "Conversazione con l'assistenza"
      );
      
      toast({
        title: "Conversazione creata",
        description: "La tua conversazione con l'assistenza è stata avviata."
      });
      
      // La conversazione verrà caricata automaticamente dal listener
    } catch (error) {
      console.error("Error creating admin conversation:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione della conversazione.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se c'è già una conversazione con l'admin, mostrala
  const handleClickAdminConversation = () => {
    if (adminConversation) {
      onSelectConversation(adminConversation);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Assistenza</h2>
        <p className="text-sm text-gray-500">
          Hai bisogno di aiuto? Contatta il nostro servizio clienti.
        </p>
      </div>
      
      {/* Conversation with admin */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : adminConversation ? (
          <div 
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b"
            onClick={handleClickAdminConversation}
          >
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 bg-blue-100">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">
                    Assistenza 3DMakes
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatLastMessageDate(adminConversation.lastMessageDate)}
                  </span>
                </div>
                {adminConversation.subject && (
                  <p className="text-sm font-medium truncate">
                    {adminConversation.subject}
                  </p>
                )}
                <p className="text-sm text-gray-500 truncate">
                  {adminConversation.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Nessuna conversazione attiva</p>
            <p className="text-gray-500 mt-1 mb-4">
              Inizia una conversazione con il nostro servizio di assistenza
            </p>
            <Button
              onClick={handleCreateAdminConversation}
            >
              Contatta l'assistenza
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 