import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  serverTimestamp,
  getDoc,
  orderBy,
  deleteDoc,
  onSnapshot,
  DocumentReference,
  increment
} from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Message, Conversation } from "@/types/messages";
import { UserData } from "@/firebase/AuthContext";

// Admin ID costante - l'unico valore da usare in tutta l'app
export const ADMIN_ID = "8MMcvpMR1COf1ApogXo8c1U5ZlV2"; // ID dell'utente info@3dmakes.ch

// Informazioni di debug per tracciare i problemi
const DEBUG = true;
const logDebug = (...args: any[]) => {
  if (DEBUG) console.log("[MessageService]", ...args);
};

// Funzione per inviare un nuovo messaggio
export const sendMessage = async (
  senderId: string, 
  receiverId: string, 
  content: string, 
  subject: string = "", 
  files: File[] = []
): Promise<string> => {
  try {
    logDebug("Invio messaggio", { senderId, receiverId, content });
    
    // Validazioni
    if (!senderId) throw new Error("senderId è obbligatorio");
    if (!receiverId) throw new Error("receiverId è obbligatorio");
    if (!content && files.length === 0) throw new Error("È richiesto un messaggio o un file");
    
    // Array per memorizzare gli URL degli allegati
    const attachmentUrls: string[] = [];
    const attachmentNames: string[] = [];
    
    // Carica tutti i file (se presenti)
    if (files.length > 0) {
      for (const file of files) {
        // Verifica dimensione file
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Il file ${file.name} supera il limite di 50MB`);
        }
        
        const timestamp = Date.now();
        const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storagePath = `messages/${senderId}/${safeFileName}`;
        
        logDebug("Caricamento file", { file: file.name, path: storagePath, size: `${(file.size / (1024 * 1024)).toFixed(2)}MB` });
        
        // Per file più grandi (> 10MB), dividi in chunks
        const useChunkedUpload = file.size > 10 * 1024 * 1024;
        let downloadUrl = '';
        
        if (useChunkedUpload) {
          // Per file grandi, usa un approccio alternativo
          logDebug("Utilizzo upload in chunks per file grande");
          const storageRef = ref(storage, storagePath);
          const metadata = {
            contentType: file.type,
            customMetadata: {
              fileName: file.name,
              sender: senderId,
              receiver: receiverId
            }
          };
          
          // Impostazioni per upload di grandi dimensioni
          const uploadTask = uploadBytesResumable(storageRef, file, metadata);
          
          // Attendi che l'upload sia completo
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                logDebug(`Upload in corso: ${progress.toFixed(0)}%`);
              },
              (error) => {
                console.error("Errore nell'upload:", error);
                reject(error);
              },
              () => {
                resolve();
              }
            );
          });
          
          downloadUrl = await getDownloadURL(storageRef);
        } else {
          // Per file piccoli, upload diretto
          const storageRef = ref(storage, storagePath);
          const uploadTask = await uploadBytesResumable(storageRef, file);
          downloadUrl = await getDownloadURL(storageRef);
        }
        
        attachmentUrls.push(downloadUrl);
        attachmentNames.push(file.name);
      }
    }
    
    // Prima ottieni o crea la conversazione per avere l'ID
    const conversationId = await updateOrCreateConversation(senderId, receiverId, content, subject);
    
    // Crea il messaggio
    const messageData = {
      senderId,
      receiverId,
      content,
      subject,
      createdAt: serverTimestamp(),
      read: false,
      attachmentUrls,
      attachmentNames,
      conversationId // Aggiungi l'ID della conversazione per poter filtrare facilmente
    };
    
    // Aggiungi il messaggio alla collezione messages
    logDebug("Salvataggio messaggio nel DB");
    const messageRef = await addDoc(collection(db, "messages"), messageData);
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Funzione per aggiornare o creare una conversazione
const updateOrCreateConversation = async (
  senderId: string, 
  receiverId: string, 
  lastMessage: string, 
  subject: string
): Promise<string> => {
  try {
    logDebug("Cercando conversazione esistente", { senderId, receiverId });
    
    // Verifica se esiste già una conversazione tra i due utenti
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", senderId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    let conversationId = null;
    let conversationRef: DocumentReference | null = null;
    
    // Cerca una conversazione esistente tra i due utenti
    conversationsSnapshot.forEach((doc) => {
      const conversationData = doc.data();
      if (conversationData.participants.includes(receiverId)) {
        conversationId = doc.id;
        conversationRef = doc.ref;
      }
    });
    
    // Se la conversazione esiste, aggiornala
    if (conversationId && conversationRef) {
      logDebug("Aggiornamento conversazione esistente", { conversationId });
      
      // Gli aggiornamenti dipendono da chi sta inviando il messaggio
      const updateData: any = {
        lastMessage,
        lastMessageDate: serverTimestamp()
      };
      
      // Incrementiamo il contatore dei messaggi non letti solo se il destinatario non è 
      // l'utente che sta inviando il messaggio
      updateData.unreadCount = increment(1);
      
      await updateDoc(conversationRef, updateData);
      return conversationId;
    } 
    // Altrimenti, crea una nuova conversazione
    else {
      logDebug("Creazione nuova conversazione");
      const newConversationRef = await addDoc(collection(db, "conversations"), {
        participants: [senderId, receiverId],
        lastMessage,
        lastMessageDate: serverTimestamp(),
        unreadCount: 1,
        subject
      });
      
      return newConversationRef.id;
    }
  } catch (error) {
    console.error("Error updating/creating conversation:", error);
    throw error;
  }
};

// Funzione per recuperare le conversazioni di un utente
export const getUserConversations = (
  userId: string, 
  callback: (conversations: Conversation[]) => void
) => {
  logDebug("Recupero conversazioni per utente", { userId });
  
  if (!userId) {
    console.error("userId è obbligatorio");
    callback([]);
    return () => {};
  }
  
  try {
    // Verifica se l'utente è l'admin
    const isAdmin = userId === ADMIN_ID;
    
    let conversationsQuery;
    
    // Se l'utente è l'admin, ottieni tutte le conversazioni dove l'admin è partecipante
    if (isAdmin) {
      conversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageDate", "desc")
      );
    } else {
      // Se è un utente normale, ottieni solo le sue conversazioni
      conversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageDate", "desc")
      );
    }
    
    // Utilizziamo onSnapshot per avere aggiornamenti in tempo reale
    return onSnapshot(
      conversationsQuery, 
      (snapshot) => {
        const conversations: Conversation[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Per gli utenti normali, filtra solo le conversazioni di cui sono partecipanti
          if (!isAdmin && !data.participants.includes(userId)) {
            return;
          }
          
          conversations.push({
            id: doc.id,
            participants: data.participants,
            lastMessage: data.lastMessage,
            lastMessageDate: data.lastMessageDate,
            unreadCount: data.unreadCount || 0,
            subject: data.subject || ""
          });
        });
        
        logDebug(`Recuperate ${conversations.length} conversazioni`);
        callback(conversations);
      },
      (error) => {
        console.error("Error getting conversations:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up conversation listener:", error);
    // In caso di errore, restituiamo una funzione vuota
    callback([]);
    return () => {};
  }
};

// Funzione per recuperare i messaggi di una conversazione
export const getConversationMessages = (
  conversationId: string, 
  callback: (messages: Message[]) => void
): (() => void) => {
  logDebug("Recupero messaggi per conversazione", { conversationId });
  
  if (!conversationId) {
    console.error("conversationId è obbligatorio");
    callback([]);
    return () => {};
  }
  
  let unsubscribeMessages: (() => void) | undefined;
  
  // Prima ottieni la conversazione per avere i partecipanti
  const getConversation = async () => {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnapshot = await getDoc(conversationRef);
      
      if (conversationSnapshot.exists()) {
        const conversationData = conversationSnapshot.data();
        const participants = conversationData.participants;
        
        logDebug("Partecipanti trovati", { participants });
        
        // Cerca i messaggi dove senderId e receiverId corrispondono ai partecipanti
        const messagesQuery = query(
          collection(db, "messages"),
          orderBy("createdAt", "asc")
        );
        
        unsubscribeMessages = onSnapshot(
          messagesQuery,
          (snapshot) => {
            const messages: Message[] = [];
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              
              // Solo i messaggi che corrispondono ai partecipanti
              if (
                participants.includes(data.senderId) && 
                participants.includes(data.receiverId) &&
                // È un messaggio tra i partecipanti esatti della conversazione
                participants.length === 2 &&
                ((data.senderId === participants[0] && data.receiverId === participants[1]) ||
                 (data.senderId === participants[1] && data.receiverId === participants[0]))
              ) {
                messages.push({
                  id: doc.id,
                  senderId: data.senderId,
                  receiverId: data.receiverId,
                  content: data.content,
                  createdAt: data.createdAt,
                  read: data.read,
                  subject: data.subject || "",
                  attachmentUrls: data.attachmentUrls || [],
                  attachmentNames: data.attachmentNames || []
                });
              }
            });
            
            logDebug(`Recuperati ${messages.length} messaggi`);
            callback(messages);
          },
          (error) => {
            console.error("Error getting messages:", error);
            callback([]);
          }
        );
      } else {
        logDebug("Conversazione non trovata");
        callback([]);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      callback([]);
    }
  };
  
  getConversation();
  
  return () => {
    if (unsubscribeMessages) {
      unsubscribeMessages();
    }
  };
};

// Funzione per segnare un messaggio come letto
export const markMessageAsRead = async (messageId: string) => {
  try {
    logDebug("Segno messaggio come letto", { messageId });
    const messageRef = doc(db, "messages", messageId);
    await updateDoc(messageRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

// Funzione per eliminare un messaggio
export const deleteMessage = async (messageId: string) => {
  try {
    logDebug("Elimino messaggio", { messageId });
    await deleteDoc(doc(db, "messages", messageId));
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Funzione per ottenere i dati di un utente
export const getUser = async (userId: string): Promise<UserData | null> => {
  try {
    logDebug("Recupero dati utente", { userId });
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Funzione per creare o recuperare una conversazione con l'admin
export const createAdminConversation = async (
  userId: string,
  adminId: string = ADMIN_ID,
  subject: string = "Supporto cliente"
): Promise<string> => {
  try {
    logDebug("Creazione conversazione con admin", { userId, adminId });
    
    if (!userId) throw new Error("userId è obbligatorio");
    
    // Verifica se esiste già una conversazione tra utente e admin
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    let existingConversationId: string | null = null;
    
    // Cerca la conversazione con l'admin
    conversationsSnapshot.forEach((doc) => {
      const conversationData = doc.data();
      // Verifica che questa sia una conversazione tra questo utente e l'admin
      if (conversationData.participants.includes(adminId) && 
          conversationData.participants.includes(userId) && 
          conversationData.participants.length === 2) {
        existingConversationId = doc.id;
      }
    });
    
    // Se la conversazione esiste, restituisci l'ID
    if (existingConversationId) {
      logDebug("Conversazione esistente trovata", { conversationId: existingConversationId });
      return existingConversationId;
    }
    
    // Altrimenti, crea una nuova conversazione
    logDebug("Creazione nuova conversazione admin");
    const newConversationRef = await addDoc(collection(db, "conversations"), {
      participants: [userId, adminId],
      lastMessage: "", // Nessun messaggio iniziale
      lastMessageDate: serverTimestamp(),
      unreadCount: 0,
      subject
    });
    
    return newConversationRef.id;
  } catch (error) {
    console.error("Error creating admin conversation:", error);
    throw error;
  }
};

// Funzione per migrare i messaggi esistenti e aggiungere conversationId
export const migrateMessages = async (): Promise<number> => {
  try {
    // Ottieni tutte le conversazioni
    const conversationsSnapshot = await getDocs(collection(db, "conversations"));
    const conversations: { id: string; participants: string[] }[] = [];
    
    conversationsSnapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        participants: doc.data().participants
      });
    });
    
    logDebug(`Trovate ${conversations.length} conversazioni da migrare`);
    
    // Per ogni conversazione, trova i messaggi corrispondenti e aggiungi conversationId
    let updatedCount = 0;
    
    for (const conversation of conversations) {
      // Trova i messaggi tra i partecipanti della conversazione
      const messagesQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", null)
      );
      
      try {
        const messagesSnapshot = await getDocs(messagesQuery);
        
        const updates: Promise<void>[] = [];
        
        messagesSnapshot.forEach(messageDoc => {
          const messageData = messageDoc.data();
          
          // Verifica se il messaggio appartiene a questa conversazione
          if (
            conversation.participants.includes(messageData.senderId) && 
            conversation.participants.includes(messageData.receiverId)
          ) {
            // Aggiorna il messaggio con l'ID della conversazione
            updates.push(
              updateDoc(doc(db, "messages", messageDoc.id), {
                conversationId: conversation.id
              })
            );
            updatedCount++;
          }
        });
        
        // Esegui tutti gli aggiornamenti
        if (updates.length > 0) {
          await Promise.all(updates);
          logDebug(`Aggiornati ${updates.length} messaggi per la conversazione ${conversation.id}`);
        }
      } catch (error) {
        console.error(`Error updating messages for conversation ${conversation.id}:`, error);
      }
    }
    
    logDebug(`Migrazione completata. Aggiornati ${updatedCount} messaggi in totale.`);
    return updatedCount;
  } catch (error) {
    console.error("Error migrating messages:", error);
    throw error;
  }
};

// Funzione per recuperare tutte le conversazioni per l'admin
export const getAdminConversations = (
  adminId: string = ADMIN_ID,
  callback: (conversations: Conversation[]) => void
) => {
  logDebug("Recupero di tutte le conversazioni per admin", { adminId });
  
  if (!adminId) {
    console.error("adminId è obbligatorio");
    callback([]);
    return () => {};
  }
  
  try {
    // Strategia alternativa: se abbiamo problemi con gli indici
    // get all conversations and filter them manually
    const conversationsQuery = query(
      collection(db, "conversations")
    );
    
    logDebug("Query semplificata per conversazioni", { adminId });
    
    // Utilizziamo onSnapshot per avere aggiornamenti in tempo reale
    return onSnapshot(
      conversationsQuery, 
      (snapshot) => {
        const conversations: Conversation[] = [];
        
        // Filtra manualmente le conversazioni dell'admin
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Verifica che sia una conversazione valida con l'admin come partecipante
          if (data.participants && 
              Array.isArray(data.participants) && 
              data.participants.includes(adminId)) {
            
            conversations.push({
              id: doc.id,
              participants: data.participants || [],
              lastMessage: data.lastMessage || "",
              lastMessageDate: data.lastMessageDate || null,
              unreadCount: data.unreadCount || 0,
              subject: data.subject || ""
            });
          }
        });
        
        // Ordina manualmente per lastMessageDate (più recenti prima)
        conversations.sort((a, b) => {
          // Funzione per ottenere il timestamp in millisecondi
          const getTimeMs = (date: any): number => {
            if (!date) return 0;
            
            // Per Firestore Timestamp
            if (typeof date.seconds === 'number' && typeof date.nanoseconds === 'number') {
              return date.seconds * 1000 + date.nanoseconds / 1000000;
            }
            
            // Per Date
            if (date instanceof Date) {
              return date.getTime();
            }
            
            return 0;
          };
          
          return getTimeMs(b.lastMessageDate) - getTimeMs(a.lastMessageDate);
        });
        
        logDebug(`Recuperate ${conversations.length} conversazioni per admin`);
        callback(conversations);
      },
      (error) => {
        console.error("Error getting admin conversations:", error);
        
        // Fallback: ottenere conversazioni una tantum invece di usare onSnapshot
        logDebug("Utilizzo metodo alternativo per recuperare conversazioni admin");
        getDocs(collection(db, "conversations"))
          .then((snapshot) => {
            const conversations: Conversation[] = [];
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.participants && 
                  Array.isArray(data.participants) && 
                  data.participants.includes(adminId)) {
                conversations.push({
                  id: doc.id,
                  participants: data.participants || [],
                  lastMessage: data.lastMessage || "",
                  lastMessageDate: data.lastMessageDate || null,
                  unreadCount: data.unreadCount || 0,
                  subject: data.subject || ""
                });
              }
            });
            
            // Ordina manualmente
            conversations.sort((a, b) => {
              // Funzione per ottenere il timestamp in millisecondi
              const getTimeMs = (date: any): number => {
                if (!date) return 0;
                
                // Per Firestore Timestamp
                if (typeof date.seconds === 'number' && typeof date.nanoseconds === 'number') {
                  return date.seconds * 1000 + date.nanoseconds / 1000000;
                }
                
                // Per Date
                if (date instanceof Date) {
                  return date.getTime();
                }
                
                return 0;
              };
              
              return getTimeMs(b.lastMessageDate) - getTimeMs(a.lastMessageDate);
            });
            
            logDebug(`Recuperate ${conversations.length} conversazioni per admin (metodo alternativo)`);
            callback(conversations);
          })
          .catch((fallbackError) => {
            console.error("Failed to get conversations with fallback method:", fallbackError);
            callback([]);
          });
      }
    );
  } catch (error) {
    console.error("Error setting up admin conversation listener:", error);
    callback([]);
    return () => {};
  }
}; 