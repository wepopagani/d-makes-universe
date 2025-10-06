export interface UserProfileData {
  id?: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  indirizzo: string;
  citta: string;
  cap: string;
  createdAt?: Date | any;
  lastLogin?: Date | any;
  isAzienda?: boolean;
  azienda?: string;
  note?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  originalName?: string;
  type: 'image' | '3d' | 'pdf' | 'other';
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  uploadedAt: Date;
  userId: string;
  userEmail?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isAdmin: boolean;
  isRead: boolean;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled' | 'rejected' | 'replaced';
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';
  preferredPaymentMethod?: 'pickup' | 'twint' | 'card'; // Metodo di pagamento preferito dall'utente
  shippingAddress: ShippingAddress;
  isOrder?: boolean;
  productionStatus?: 'non_iniziato' | 'in_corso' | 'completato';
  projectId?: string;
  orderName?: string; // Nome personalizzato dell'ordine
}

export interface OrderItem {
  id: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  quantity: number;
  material: string;
  color: string;
  resolution?: string; // es. "0.1mm", "0.2mm" - opzionale per retrocompatibilità
  printType?: string; // "fdm" o "sla"
  quality?: string; // "0.1", "0.2", "0.3", etc.
  hollowed?: string; // "no", "vuoto", "riempimento" - solo per SLA
  price: number;
  notes?: string;
  productionStatus?: 'non_iniziato' | 'in_corso' | 'completato';
  paymentStatus?: 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';
}

export interface ShippingAddress {
  nome: string;
  cognome: string;
  indirizzo: string;
  citta: string;
  cap: string;
  telefono: string;
  deliveryMethod?: 'pickup' | 'shipping';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  files: string[]; // Array di riferimenti ai file (fileId)
  thumbnailUrl?: string;
  notes?: string;
  productionProgress?: number; // Percentuale di avanzamento della produzione
  paymentProgress?: number; // Percentuale di pagamento completato
  isOrder?: boolean; // Flag to indicate if this is actually an order shown as a project
  productionStatus?: 'non_iniziato' | 'in_corso' | 'completato'; // Stato di produzione come nell'admin
} 