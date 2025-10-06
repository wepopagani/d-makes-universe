// Definizione delle interfacce per i messaggi
import { Timestamp } from "firebase/firestore";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | Timestamp;
  read: boolean;
  subject?: string;
  attachmentUrls?: string[];
  attachmentNames?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: Date | Timestamp;
  unreadCount: number;
  subject?: string;
} 