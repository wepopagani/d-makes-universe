import React, { useState, useEffect } from "react";
import { Conversation } from "@/types/messages";
import AdminConversationList from "./AdminConversationList";
import MessageChat from "./MessageChat";
import { useAuth } from "@/firebase/AuthContext";

interface AdminMessagesContainerProps {}

const AdminMessagesContainer: React.FC<AdminMessagesContainerProps> = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { currentUser } = useAuth();
  
  // Verifica che l'utente corrente sia l'admin
  const isAdmin = currentUser?.email === "info@3dmakes.ch";
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };
  
  const handleBackToList = () => {
    setSelectedConversation(null);
  };
  
  // Se l'utente non è admin, mostra un messaggio di errore
  if (!isAdmin) {
    return (
      <div className="h-full rounded-lg border shadow-sm bg-white overflow-hidden flex justify-center items-center">
        <p className="text-gray-500">Non hai accesso a questa pagina.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full rounded-lg border shadow-sm bg-white overflow-hidden">
      {selectedConversation ? (
        <MessageChat 
          conversationId={selectedConversation.id}
          participants={selectedConversation.participants}
          subject={selectedConversation.subject}
          onBack={handleBackToList}
        />
      ) : (
        <AdminConversationList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
};

export default AdminMessagesContainer; 