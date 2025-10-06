import React, { useState, useEffect } from "react";
import { Conversation } from "@/types/messages";
import MessageChat from "./MessageChat";
import { migrateMessages, getUserConversations, createAdminConversation, ADMIN_ID } from "@/utils/messageService";
import { useAuth } from "@/firebase/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface MessagesContainerProps {}

const MessagesContainer: React.FC<MessagesContainerProps> = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Esegui la migrazione dei messaggi al mount, se necessario
  useEffect(() => {
    const runMigration = async () => {
      if (!currentUser || isMigrating) return;
      if (localStorage.getItem('messagesMigrated') === 'true') return;
      
      try {
        setIsMigrating(true);
        
        const updatedCount = await migrateMessages();
        
        if (updatedCount > 0) {
          toast({
            title: "Messaggi aggiornati",
            description: `${updatedCount} messaggi sono stati aggiornati.`
          });
        }
        
        // Segna la migrazione come completata
        localStorage.setItem('messagesMigrated', 'true');
      } catch (error) {
        console.error("Error during message migration:", error);
      } finally {
        setIsMigrating(false);
      }
    };
    
    runMigration();
  }, [currentUser]);
  
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
        setConversation(foundAdminConversation);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Crea una nuova conversazione con l'admin se non esiste già
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
  
  return (
    <div className="h-full rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      ) : conversation ? (
        <MessageChat 
          conversationId={conversation.id}
          participants={conversation.participants}
          subject={conversation.subject}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">Nessuna conversazione attiva</p>
          <p className="text-gray-500 mt-1 mb-4">
            Inizia una conversazione con il nostro servizio di assistenza
          </p>
          <Button onClick={handleCreateAdminConversation}>
            Contatta l'assistenza
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessagesContainer; 