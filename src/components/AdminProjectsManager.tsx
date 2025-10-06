import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, updateDoc, doc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { Check, Edit, FileText, MoreVertical, Search, Package, Hash, Settings, Download, Eye } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { sendOrderConfirmationEmail, sendQuoteReadyEmail } from '@/utils/emailService';

interface AdminProjectsManagerProps {
  initialTab?: 'projects' | 'quotes';
}

const AdminProjectsManager = ({ initialTab = 'projects' }: AdminProjectsManagerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [projects, setProjects] = useState<{[key: string]: any}>({});
  const [activeTab, setActiveTab] = useState<'projects' | 'quotes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<{[key: string]: boolean}>({});
  
  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data from Firestore...");
        
        // Clear any previous data
        setOrders([]);
        setQuotes([]);
        setProjects({});
        
        // Fetch orders from Firestore
        const ordersQuery = query(collection(db, "orders"));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        console.log(`Found ${ordersSnapshot.size} orders`);
        
        if (ordersSnapshot.size === 0) {
          console.log("No orders found in the database");
        }
        
      const ordersList: any[] = [];
        const quotesList: any[] = [];
        const projectIds = new Set<string>();
      
        // Process fetched documents
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
          const item = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          };
          
          console.log("Processing item:", item);
      
          // Collect project IDs
          if (data.projectId) {
            projectIds.add(data.projectId);
          }
          
          // Sort into orders and quotes based on isOrder flag
          if (data.isOrder === true) {
            ordersList.push(item);
      } else {
            quotesList.push(item);
          }
        });
        
        console.log(`Processed ${ordersList.length} orders and ${quotesList.length} quotes`);
  
        // Fetch projects to get names
        const projectsMap: {[key: string]: any} = {};
        for (const projectId of projectIds) {
          try {
            const projectDoc = await getDoc(doc(db, "projects", projectId));
            if (projectDoc.exists()) {
              const projectData = projectDoc.data();
              projectsMap[projectId] = {
                id: projectDoc.id,
                name: projectData.name || 'Progetto senza nome',
                ...projectData
              };
                  } else {
              projectsMap[projectId] = {
                id: projectId,
                name: 'Progetto non trovato'
              };
            }
                } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            projectsMap[projectId] = {
              id: projectId,
              name: 'Progetto non trovato'
            };
          }
        }
        
        console.log(`Fetched ${Object.keys(projectsMap).length} projects`);
        
        // Update state with fetched data
        setOrders(ordersList);
        setQuotes(quotesList);
        setProjects(projectsMap);
    } catch (error) {
        console.error("Error fetching data:", error);
      toast({
        title: "Errore",
          description: "Si è verificato un errore nel recupero dei dati.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
    fetchData();
  }, [toast]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };
  
  // Get client email helper function
  const getClientEmail = (item: any) => {
    return item.userEmail || "Email non disponibile";
  };
  
  // Handle item click
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setQuoteAmount(item.totalAmount ? item.totalAmount.toString() : '');
    setIsDetailsDialogOpen(true);
  };
  
  // Set quote amount
  const handleSetQuoteAmount = async () => {
    if (!selectedItem) return;
    
    try {
      setUpdatingStatus(prev => ({ ...prev, [selectedItem.id]: true }));
  
      // Validate amount
      const amount = parseFloat(quoteAmount);
      if (isNaN(amount) || amount <= 0) {
      toast({
          title: "Importo non valido",
          description: "Inserisci un importo valido maggiore di zero.",
        variant: "destructive"
      });
      return;
    }
      
      // Update in Firestore
      await updateDoc(doc(db, "orders", selectedItem.id), {
        totalAmount: amount,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      if (activeTab === 'quotes') {
        setQuotes(quotes.map(quote => 
          quote.id === selectedItem.id 
            ? { ...quote, totalAmount: amount, updatedAt: new Date() } 
            : quote
      ));
      }

      // Invia email di preventivo pronto al cliente
      try {
        if (selectedItem.userEmail) {
          const projectName = projects[selectedItem.projectId]?.name || selectedItem.orderName || 'Progetto';
          
          await sendQuoteReadyEmail({
            userEmail: selectedItem.userEmail,
            userName: selectedItem.userName || 'Cliente',
            projectName: projectName,
            quotePrice: amount,
            validUntil: '7 giorni'
          });

          console.log('Email preventivo pronto inviata con successo');
        }
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email preventivo:', emailError);
        // Non blocchiamo il processo se l'email fallisce
      }
      
      toast({
        title: "Importo aggiornato",
        description: `L'importo del preventivo è stato impostato a ${formatCurrency(amount)}. Email inviata al cliente.`
      });
      
      // Close dialog and refresh data
      setIsDetailsDialogOpen(false);
      
      // Wait a bit before refreshing to ensure Firestore is updated
      setTimeout(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
            const ordersQuery = query(collection(db, "orders"));
            const ordersSnapshot = await getDocs(ordersQuery);
            
            const ordersList: any[] = [];
            const quotesList: any[] = [];
            
            ordersSnapshot.forEach((doc) => {
              const data = doc.data();
              const item = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
              };
              
              if (data.isOrder === true) {
                ordersList.push(item);
              } else {
                quotesList.push(item);
              }
            });
            
            setOrders(ordersList);
            setQuotes(quotesList);
    } catch (error) {
            console.error("Error refreshing data:", error);
    } finally {
            setLoading(false);
          }
        };
        
        fetchData();
      }, 500);
      
    } catch (error) {
      console.error("Error setting quote amount:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'importo.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [selectedItem.id]: false }));
    }
  };
  
  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // Update in Firestore
      await updateDoc(doc(db, "orders", orderId), {
          status: newStatus,
          updatedAt: Timestamp.now()
        });
        
        // Update local state
      setQuotes(quotes.map(quote => 
        quote.id === orderId 
          ? { ...quote, status: newStatus, updatedAt: new Date() } 
          : quote
        ));

      // Invia email di conferma ordine quando viene approvato
      if (newStatus === 'approved') {
        try {
          const quote = quotes.find(q => q.id === orderId);
          if (quote && quote.userEmail) {
            const projectName = projects[quote.projectId]?.name || 'Progetto';
            const orderDetails = `${projectName} - ${quote.material || 'Materiale non specificato'} - Quantità: ${quote.quantity || 1}`;
            
            await sendOrderConfirmationEmail({
              userEmail: quote.userEmail,
              userName: quote.userName || 'Cliente',
              orderId: quote.orderNumber || orderId, // Usa orderNumber se disponibile, altrimenti ID Firestore
              orderDetails: orderDetails,
              totalPrice: quote.totalAmount || 0,
              estimatedDelivery: '24-48h'
            });

            console.log('Email di conferma ordine inviata con successo');
          }
        } catch (emailError) {
          console.error('Errore nell\'invio dell\'email di conferma:', emailError);
          // Non blocchiamo il processo se l'email fallisce
        }
      }
        
        toast({
        title: "Stato aggiornato",
        description: `Lo stato del preventivo è stato aggiornato.${newStatus === 'approved' ? ' Email di conferma inviata al cliente.' : ''}`
      });
      
      // Close dialog if open
      if (isDetailsDialogOpen && selectedItem?.id === orderId) {
        setIsDetailsDialogOpen(false);
      }
      
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  // Update production status
  const handleUpdateProductionStatus = async (orderId: string, newStatus: 'non_iniziato' | 'in_corso' | 'completato') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // Update in Firestore
      await updateDoc(doc(db, "orders", orderId), {
        productionStatus: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, productionStatus: newStatus, updatedAt: new Date() } 
          : order
      ));
      
      toast({
        title: "Stato produzione aggiornato",
        description: `Lo stato di produzione è stato aggiornato.`
      });
      
    } catch (error) {
      console.error("Error updating production status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato di produzione.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  // Update payment status
  const handleUpdatePaymentStatus = async (orderId: string, newStatus: 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // Update in Firestore
      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus: newStatus, updatedAt: new Date() } 
          : order
      ));
      
      toast({
        title: "Stato pagamento aggiornato",
        description: `Lo stato di pagamento è stato aggiornato.`
      });
      
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato di pagamento.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  // Delete order/quote
  const handleDeleteOrder = async (orderId: string, isOrder: boolean) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // Delete from Firestore
      await deleteDoc(doc(db, "orders", orderId));
      
      // Update local state
      if (isOrder) {
        setOrders(orders.filter(order => order.id !== orderId));
      } else {
        setQuotes(quotes.filter(quote => quote.id !== orderId));
      }
      
      toast({
        title: isOrder ? "Ordine eliminato" : "Preventivo eliminato",
        description: `${isOrder ? "L'ordine" : "Il preventivo"} è stato eliminato con successo.`
      });
        
      // Close dialog if open
      if (isDetailsDialogOpen && selectedItem?.id === orderId) {
        setIsDetailsDialogOpen(false);
      }
      
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante l'eliminazione ${isOrder ? "dell'ordine" : "del preventivo"}.`,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  // Convert quote to order
  const handleConvertToOrder = async (quoteId: string) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [quoteId]: true }));
      
      const quoteRef = doc(db, "orders", quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        throw new Error("Preventivo non trovato");
      }
      
      const quoteData = quoteDoc.data();
      
      // Check if amount is set
      if (!quoteData.totalAmount || quoteData.totalAmount <= 0) {
        toast({
          title: "Importo mancante",
          description: "Imposta un importo prima di convertire il preventivo in ordine.",
          variant: "destructive"
        });
        return;
      }
      
      // Update in Firestore - transform into actual order
      await updateDoc(quoteRef, {
        status: 'approved',
        isOrder: true,
        paymentStatus: 'da_pagare',
        productionStatus: 'non_iniziato',
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Preventivo convertito",
        description: "Il preventivo è stato convertito in ordine con successo."
      });
      
      // Close dialog if open
      if (isDetailsDialogOpen && selectedItem?.id === quoteId) {
        setIsDetailsDialogOpen(false);
      }
      
      // Refresh data
      setTimeout(() => {
        const fetchData = async () => {
    try {
      setLoading(true);
            const ordersQuery = query(collection(db, "orders"));
            const ordersSnapshot = await getDocs(ordersQuery);
            
            const ordersList: any[] = [];
            const quotesList: any[] = [];
            
            ordersSnapshot.forEach((doc) => {
              const data = doc.data();
              const item = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
              };
              
              if (data.isOrder === true) {
                ordersList.push(item);
              } else {
                quotesList.push(item);
              }
            });
            
            setOrders(ordersList);
            setQuotes(quotesList);
    } catch (error) {
            console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };
  
        fetchData();
      }, 500);
      
    } catch (error) {
      console.error("Error converting quote to order:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conversione del preventivo in ordine.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [quoteId]: false }));
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-2">
          <div>
            <CardTitle>Gestione Ordini</CardTitle>
            <CardDescription>
              Gestisci gli ordini e le richieste di preventivo
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="border rounded-lg overflow-hidden flex">
              <button 
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium ${activeTab === 'projects' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => {
                  console.log('Setting activeTab to projects');
                  setActiveTab('projects');
                }}
              >
                Ordini
              </button>
              <button 
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium ${activeTab === 'quotes' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => {
                  console.log('Setting activeTab to quotes');
                  setActiveTab('quotes');
                }}
              >
                Richieste Preventivo
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
              <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder={activeTab === 'projects' ? "Cerca ordini..." : "Cerca preventivi..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
                </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
              ) : (
                <>
              {/* Orders Tab */}
              {activeTab === 'projects' && (
                    <>
                  {orders.length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                              <TableHead>Progetto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data creazione</TableHead>
                              <TableHead>Stato produzione</TableHead>
                              <TableHead>Pagamento</TableHead>
                              <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                            {orders
                                                        .filter(order => 
                            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (order.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (order.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (projects[order.projectId]?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                          )
                              .map((order) => (
                    <TableRow 
                                  key={order.id} 
                      className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleItemClick(order)}
                    >
                                  <TableCell className="font-medium">
                                    {projects[order.projectId]?.name || 
                                     order.orderName || 
                                     (order.items && order.items.length > 0 && order.items[0].fileName ? 
                                       `Ordine - ${order.items[0].fileName}` : 
                                       `#${order.orderNumber || order.id.substring(0, 8)}`)}
                                  </TableCell>
                                  <TableCell>{getClientEmail(order)}</TableCell>
                                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                                  <TableCell>
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                      {order.productionStatus === 'non_iniziato' ? 'Da iniziare' : 
                                       order.productionStatus === 'in_corso' ? 'In produzione' : 
                                       order.productionStatus === 'completato' ? 'Completato' : 
                                       order.status || "In attesa"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      {order.paymentStatus === 'da_pagare' ? 'Da pagare' :
                                       order.paymentStatus === 'pagato_carta' ? 'Pagato (carta)' :
                                       order.paymentStatus === 'pagato_contanti' ? 'Pagato (contanti)' :
                                       order.paymentStatus === 'pagato_twint' ? 'Pagato (Twint)' :
                                       'Da pagare'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          handleItemClick(order);
                                        }}>
                                          Dettagli
                                        </DropdownMenuItem>
                            <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Stato produzione</DropdownMenuLabel>
                            <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateProductionStatus(order.id, 'non_iniziato');
                                          }}
                            >
                                          Da iniziare
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateProductionStatus(order.id, 'in_corso');
                                          }}
                            >
                                          In produzione
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateProductionStatus(order.id, 'completato');
                                          }}
                            >
                              Completato
                            </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Stato pagamento</DropdownMenuLabel>
                            <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdatePaymentStatus(order.id, 'da_pagare');
                                          }}
                            >
                                          Da pagare
                            </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdatePaymentStatus(order.id, 'pagato_carta');
                                          }}
                                        >
                                          Pagato (carta)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdatePaymentStatus(order.id, 'pagato_contanti');
                                          }}
                                        >
                                          Pagato (contanti)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdatePaymentStatus(order.id, 'pagato_twint');
                                          }}
                                        >
                                          Pagato (Twint)
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata.')) {
                                              handleDeleteOrder(order.id, true);
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          Elimina ordine
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {orders
                          .filter(order => 
                            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (order.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (order.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (projects[order.projectId]?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((order) => (
                            <Card 
                              key={order.id} 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleItemClick(order)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base truncate">
                                      {projects[order.projectId]?.name || 
                                       order.orderName || 
                                       (order.items && order.items.length > 0 && order.items[0].fileName ? 
                                         `Ordine - ${order.items[0].fileName}` : 
                                         `#${order.orderNumber || order.id.substring(0, 8)}`)}
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                      {getClientEmail(order)}
                                    </CardDescription>
                                  </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(order);
                                      }}>
                                        Dettagli
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel>Stato produzione</DropdownMenuLabel>
                              <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateProductionStatus(order.id, 'non_iniziato');
                                        }}
                              >
                                        Da iniziare
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateProductionStatus(order.id, 'in_corso');
                                }}
                              >
                                        In produzione
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateProductionStatus(order.id, 'completato');
                                        }}
                                      >
                                        Completato
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel>Stato pagamento</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdatePaymentStatus(order.id, 'da_pagare');
                                        }}
                                      >
                                        Da pagare
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdatePaymentStatus(order.id, 'pagato_carta');
                                        }}
                                      >
                                        Pagato (carta)
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdatePaymentStatus(order.id, 'pagato_contanti');
                                        }}
                                      >
                                        Pagato (contanti)
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdatePaymentStatus(order.id, 'pagato_twint');
                                        }}
                                      >
                                        Pagato (Twint)
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm('Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata.')) {
                                            handleDeleteOrder(order.id, true);
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                        Elimina ordine
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                                      </div>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Data creazione:</span>
                                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                                      </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Stato produzione:</span>
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {order.productionStatus === 'non_iniziato' ? 'Da iniziare' : 
                                     order.productionStatus === 'in_corso' ? 'In produzione' : 
                                     order.productionStatus === 'completato' ? 'Completato' : 
                                     order.status || "In attesa"}
                                  </span>
                                    </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Pagamento:</span>
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {order.paymentStatus === 'da_pagare' ? 'Da pagare' :
                                     order.paymentStatus === 'pagato_carta' ? 'Pagato (carta)' :
                                     order.paymentStatus === 'pagato_contanti' ? 'Pagato (contanti)' :
                                     order.paymentStatus === 'pagato_twint' ? 'Pagato (Twint)' :
                                     'Da pagare'}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                    </>
                      ) : (
                        <div className="text-center py-10 border rounded-md">
                          <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <h3 className="font-medium text-lg mb-2">Nessun ordine trovato</h3>
                          <p className="text-gray-500 mb-4">
                            {searchQuery 
                              ? "Nessun ordine corrisponde alla tua ricerca." 
                          : "Non ci sono ordini nel sistema."}
                          </p>
                        </div>
                      )}
                    </>
                  )}
              
              {/* Quotes Tab */}
              {activeTab === 'quotes' && (
                    <>
                  {quotes.length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                              <TableHead>Progetto</TableHead>
                                <TableHead>Cliente</TableHead>
                              <TableHead>Data richiesta</TableHead>
                                <TableHead>Stato</TableHead>
                              <TableHead>Prezzo</TableHead>
                              <TableHead>Azioni</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                            {quotes
                                                        .filter(quote => 
                            quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (quote.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (quote.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (projects[quote.projectId]?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                          )
                              .map((quote) => (
                                <TableRow 
                                  key={quote.id} 
                                  className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleItemClick(quote)}
                                >
                                  <TableCell className="font-medium">
                                    {projects[quote.projectId]?.name || 
                                     quote.orderName || 
                                     (quote.items && quote.items.length > 0 && quote.items[0].fileName ? 
                                       `Preventivo - ${quote.items[0].fileName}` : 
                                       `#${quote.orderNumber || quote.id.substring(0, 8)}`)}
                                  </TableCell>
                                  <TableCell>{getClientEmail(quote)}</TableCell>
                                  <TableCell>{formatDate(quote.createdAt)}</TableCell>
                                  <TableCell>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                                      ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}`}
                                    >
                                      {quote.status === 'pending' ? 'In attesa' :
                                       quote.status === 'approved' ? 'Approvato' :
                                       quote.status === 'rejected' ? 'Rifiutato' :
                                       quote.status || "In attesa"}
                                      </span>
                                  </TableCell>
                                  <TableCell>
                                    {quote.totalAmount > 0 
                                      ? formatCurrency(quote.totalAmount) 
                                      : <span className="text-red-500">Da impostare</span>}
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          handleItemClick(quote);
                                        }}>
                                          Dettagli
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateOrderStatus(quote.id, 'pending');
                                          }}
                                        >
                                          Imposta "In attesa"
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateOrderStatus(quote.id, 'approved');
                                          }}
                                        >
                                          Approva
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateOrderStatus(quote.id, 'rejected');
                                          }}
                                        >
                                          Rifiuta
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Sei sicuro di voler eliminare questo preventivo? Questa azione non può essere annullata.')) {
                                              handleDeleteOrder(quote.id, false);
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          Elimina preventivo
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              
                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {quotes
                          .filter(quote => 
                            quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (quote.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (quote.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (projects[quote.projectId]?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                        )
                          .map((quote) => (
                            <Card 
                              key={quote.id} 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleItemClick(quote)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base truncate">
                                      {projects[quote.projectId]?.name || 
                                       quote.orderName || 
                                       (quote.items && quote.items.length > 0 && quote.items[0].fileName ? 
                                         `Preventivo - ${quote.items[0].fileName}` : 
                                         `#${quote.orderNumber || quote.id.substring(0, 8)}`)}
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                      {getClientEmail(quote)}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(quote);
                                      }}>
                                        Dettagli
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateOrderStatus(quote.id, 'pending');
                                      }}
                                    >
                                        Imposta "In attesa"
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateOrderStatus(quote.id, 'approved');
                                      }}
                                    >
                                        Approva
                                    </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateOrderStatus(quote.id, 'rejected');
                                        }}
                                      >
                                        Rifiuta
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm('Sei sicuro di voler eliminare questo preventivo? Questa azione non può essere annullata.')) {
                                            handleDeleteOrder(quote.id, false);
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        Elimina preventivo
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                </div>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Data richiesta:</span>
                                  <span className="font-medium">{formatDate(quote.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Stato:</span>
                                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                                    ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'}`}
                                  >
                                    {quote.status === 'pending' ? 'In attesa' :
                                     quote.status === 'approved' ? 'Approvato' :
                                     quote.status === 'rejected' ? 'Rifiutato' :
                                     quote.status || "In attesa"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Prezzo:</span>
                                  <span className="font-medium">
                                    {quote.totalAmount > 0 
                                      ? formatCurrency(quote.totalAmount) 
                                      : <span className="text-red-500">Da impostare</span>}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <h3 className="font-medium text-lg mb-2">Nessun preventivo trovato</h3>
                  <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? "Nessun preventivo corrisponde alla tua ricerca." 
                        : "Non ci sono richieste di preventivo nel sistema."}
                  </p>
                </div>
                )}
              </>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Item Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg md:text-xl">
              <FileText className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              {activeTab === 'projects' ? 'Dettagli Ordine' : 'Dettagli Preventivo'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {activeTab === 'projects' 
                ? 'Visualizza e gestisci i dettagli dell\'ordine con file e stato di produzione' 
                : 'Visualizza e gestisci i dettagli del preventivo'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 md:space-y-6">
              {/* Header Section with Key Info */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                  <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Titolo Progetto</Label>
                      <p className="text-sm md:text-base font-medium text-gray-900 break-words">
                        {projects[selectedItem.projectId]?.name || 
                         selectedItem.orderName || 
                         (selectedItem.items && selectedItem.items.length > 0 && selectedItem.items[0].fileName ? 
                           `${activeTab === 'projects' ? 'Ordine' : 'Preventivo'} - ${selectedItem.items[0].fileName}` : 
                           "Progetto senza nome")}
                      </p>
                  </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Cliente</Label>
                      <div className="font-medium text-gray-900 break-words">{getClientEmail(selectedItem)}</div>
              </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Data creazione</Label>
                      <div className="font-medium text-gray-900">{formatDate(selectedItem.createdAt)}</div>
            </div>
          </div>
          
                  <div className="space-y-3">
              <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Stato Corrente</Label>
                      <div className="font-medium">
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activeTab === 'projects' 
                            ? (selectedItem.productionStatus === 'non_iniziato' ? 'bg-gray-100 text-gray-800' : 
                               selectedItem.productionStatus === 'in_corso' ? 'bg-yellow-100 text-yellow-800' : 
                               selectedItem.productionStatus === 'completato' ? 'bg-green-100 text-green-800' : 
                               'bg-blue-100 text-blue-800') 
                            : (selectedItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                               selectedItem.status === 'approved' ? 'bg-green-100 text-green-800' :
                               selectedItem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                               'bg-gray-100 text-gray-800')
                  }`}>
                          {activeTab === 'projects' 
                            ? (selectedItem.productionStatus === 'non_iniziato' ? 'Da iniziare' : 
                               selectedItem.productionStatus === 'in_corso' ? 'In produzione' : 
                               selectedItem.productionStatus === 'completato' ? 'Completato' : 
                               selectedItem.status || "In attesa") 
                            : (selectedItem.status === 'pending' ? 'In attesa' :
                               selectedItem.status === 'approved' ? 'Approvato' :
                               selectedItem.status === 'rejected' ? 'Rifiutato' :
                               selectedItem.status || "In attesa")}
                  </span>
                </div>
                  </div>
                    {activeTab === 'projects' && selectedItem.totalAmount > 0 && (
                  <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Importo</Label>
                        <div className="font-bold text-lg md:text-xl text-green-600">
                          {formatCurrency(selectedItem.totalAmount)}
                  </div>
                  </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quote Amount Section */}
              {activeTab === 'quotes' && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                  <Label htmlFor="quoteAmount">Importo preventivo (CHF)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="quoteAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quoteAmount} 
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="0.00"
                    />
                <Button 
                  onClick={handleSetQuoteAmount}
                      disabled={updatingStatus[selectedItem.id]}
                >
                      {updatingStatus[selectedItem.id] ? 'Salvando...' : 'Salva'}
                </Button>
              </div>
                  <p className="text-xs text-gray-500">
                    Inserisci l'importo del preventivo in franchi svizzeri.
                  </p>
                </div>
              )}
              
              {/* Order Items (if any) */}
              {selectedItem.items && selectedItem.items.length > 0 && (
              <div>
                  <Label className="mb-3 block text-sm md:text-base font-semibold">File e Articoli dell'ordine</Label>
                  <div className="space-y-3">
                    {selectedItem.items.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 md:p-4 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 space-y-3 md:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-base md:text-lg text-gray-900 break-words">
                              {item.fileName || "File senza nome"}
                            </h4>
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 space-y-1 md:space-y-0 text-xs md:text-sm text-gray-600">
                              <span className="flex items-center">
                                <Package className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                                Materiale: {item.material || "-"}
                              </span>
                              {item.color && (
                                <span className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-1 border flex-shrink-0" style={{backgroundColor: item.color.toLowerCase()}}></div>
                                  Colore: {item.color}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                                Quantità: {item.quantity || 1}
                              </span>
                              {item.resolution && (
                                <span className="flex items-center">
                                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                                  Risoluzione: {item.resolution}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <div className="mt-2">
                                <p className="text-xs md:text-sm text-gray-700 bg-white p-2 rounded border">
                                  <strong>Note:</strong> {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 md:ml-4">
                            {/* Download Button */}
                            {item.fileUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = item.fileUrl;
                                  a.download = item.fileName || 'file';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                }}
                                className="flex items-center justify-center text-xs md:text-sm"
                                >
                                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                Download
                                </Button>
                            )}
                            
                            {/* Preview Button (for supported file types) */}
                            {item.fileUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                onClick={() => {
                                  setPreviewItem(item);
                                  setIsPreviewDialogOpen(true);
                                }}
                                className="flex items-center justify-center text-xs md:text-sm"
                                >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                Preview
                                </Button>
                            )}
                              </div>
                  </div>
                        
                        {/* File size info if available */}
                        {item.fileSize && (
                          <div className="text-xs text-gray-500 border-t pt-2">
                            Dimensione file: {(item.fileSize / 1024).toFixed(1)} KB
                          </div>
                )}
              </div>
                    ))}
              
                    {/* Summary section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-xs md:text-sm font-medium text-blue-900">
                          Totale: {selectedItem.items.length} file, {selectedItem.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)} pezzi
                        </span>
                    <Button
                          variant="outline" 
                          size="sm"
                      onClick={() => {
                            // Download all files
                            selectedItem.items.forEach((item: any) => {
                              if (item.fileUrl) {
                                setTimeout(() => {
                                  const a = document.createElement('a');
                                  a.href = item.fileUrl;
                                  a.download = item.fileName || 'file';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                }, 100);
                              }
                            });
                          }}
                          className="flex items-center text-blue-700 text-xs md:text-sm"
                        >
                          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Scarica tutti
                    </Button>
                      </div>
                    </div>
                  </div>
                </div>
                  )}
                  
              {/* Customer Notes and Additional Info */}
              {(selectedItem.notes || selectedItem.shippingAddress) && (
                <div className="space-y-4">
                  {selectedItem.notes && (
                    <div>
                      <Label className="mb-2 block text-base font-semibold">Note del Cliente</Label>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-900">{selectedItem.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.shippingAddress && (
                    <div>
                      <Label className="mb-2 block text-base font-semibold">
                        {selectedItem.shippingAddress.deliveryMethod === 'pickup' ? 'Modalità di Consegna: Ritiro in negozio' : 'Modalità di Consegna: Spedizione'}
                      </Label>
                      <div className="bg-gray-50 border rounded-lg p-3">
                        {selectedItem.shippingAddress.deliveryMethod === 'pickup' ? (
                          <>
                            <div className="flex items-center space-x-2 text-blue-600 mb-3">
                              <span className="text-lg">🏪</span>
                              <span className="font-medium">Ritiro in negozio</span>
                  </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <h4 className="font-medium text-blue-800 mb-2">📍 Indirizzo Laboratorio</h4>
                              <p className="text-blue-700 text-sm">
                                3DMakes<br/>
                                                Via Cantonale 15<br/>
                6918 Lugano, Svizzera<br/>
                                Tel: +41 76 266 03 96
                              </p>
                </div>
                            <div className="text-sm text-gray-700">
                              <p className="font-medium text-gray-600 mb-1">Dati di contatto cliente:</p>
                              <p className="font-medium">
                                {selectedItem.shippingAddress.nome} {selectedItem.shippingAddress.cognome}
                              </p>
                              {selectedItem.shippingAddress.telefono && (
                                <p>Tel: {selectedItem.shippingAddress.telefono}</p>
                              )}
              </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 text-green-600 mb-3">
                              <span className="text-lg">📦</span>
                              <span className="font-medium">Spedizione a domicilio</span>
            </div>
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">
                                {selectedItem.shippingAddress.nome} {selectedItem.shippingAddress.cognome}
                              </p>
                              <p>{selectedItem.shippingAddress.indirizzo}</p>
                              <p>{selectedItem.shippingAddress.cap} {selectedItem.shippingAddress.citta}</p>
                              {selectedItem.shippingAddress.telefono && (
                                <p>Tel: {selectedItem.shippingAddress.telefono}</p>
                              )}
                            </div>
                          </>
              )}
            </div>
            </div>
                  )}
          </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-between pt-4 gap-3 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="order-2 sm:order-1">
              Chiudi
            </Button>
                
                {activeTab === 'quotes' && selectedItem.status === 'pending' && selectedItem.totalAmount > 0 && (
              <Button 
                    onClick={() => handleConvertToOrder(selectedItem.id)}
                    disabled={updatingStatus[selectedItem.id]}
                    className="order-1 sm:order-2"
              >
                    Converti in ordine
              </Button>
            )}
                
                {activeTab === 'projects' && (
                  <div className="flex flex-col space-y-3 order-1 sm:order-2">
                    {/* Pulsanti per gli stati */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full text-xs md:text-sm">
                            Stato produzione <Edit className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                            onClick={() => handleUpdateProductionStatus(selectedItem.id, 'non_iniziato')}
                            >
                            {selectedItem.productionStatus === 'non_iniziato' && <Check className="mr-2 h-4 w-4" />}
                            Da iniziare
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            onClick={() => handleUpdateProductionStatus(selectedItem.id, 'in_corso')}
                            >
                            {selectedItem.productionStatus === 'in_corso' && <Check className="mr-2 h-4 w-4" />}
                            In produzione
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            onClick={() => handleUpdateProductionStatus(selectedItem.id, 'completato')}
                            >
                            {selectedItem.productionStatus === 'completato' && <Check className="mr-2 h-4 w-4" />}
                              Completato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full text-xs md:text-sm">
                            Stato pagamento <Edit className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                            onClick={() => handleUpdatePaymentStatus(selectedItem.id, 'da_pagare')}
                            >
                            {selectedItem.paymentStatus === 'da_pagare' && <Check className="mr-2 h-4 w-4" />}
                              Da pagare
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            onClick={() => handleUpdatePaymentStatus(selectedItem.id, 'pagato_carta')}
                            >
                            {selectedItem.paymentStatus === 'pagato_carta' && <Check className="mr-2 h-4 w-4" />}
                            Pagato (carta)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            onClick={() => handleUpdatePaymentStatus(selectedItem.id, 'pagato_contanti')}
                            >
                            {selectedItem.paymentStatus === 'pagato_contanti' && <Check className="mr-2 h-4 w-4" />}
                            Pagato (contanti)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            onClick={() => handleUpdatePaymentStatus(selectedItem.id, 'pagato_twint')}
                            >
                            {selectedItem.paymentStatus === 'pagato_twint' && <Check className="mr-2 h-4 w-4" />}
                            Pagato (Twint)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
            </div>
          )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg md:text-xl">
              <FileText className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              Preview File
            </DialogTitle>
            <DialogDescription className="text-sm">
              Visualizza il file 3D
            </DialogDescription>
          </DialogHeader>
          
          {previewItem && (
            <div className="space-y-4 md:space-y-6">
              {/* File info */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border">
                <h4 className="font-medium text-base md:text-lg text-gray-900 mb-2 break-words">
                  {previewItem.fileName || "File senza nome"}
                </h4>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0 text-xs md:text-sm text-gray-600">
                  <span className="flex items-center">
                    <Package className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                    Materiale: {previewItem.material || "-"}
                  </span>
                  {previewItem.color && (
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1 border flex-shrink-0" style={{backgroundColor: previewItem.color.toLowerCase()}}></div>
                      Colore: {previewItem.color}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                    Quantità: {previewItem.quantity || 1}
                  </span>
                </div>
              </div>
              
              {/* ModelViewer */}
              <div className="h-64 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                <ModelViewer 
                  file={null}
                  fileType={previewItem.fileName?.split('.').pop()?.toLowerCase() || 'stl'}
                  url={previewItem.fileUrl}
                />
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)} className="order-2 sm:order-1">
                  Chiudi
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewItem.fileUrl;
                    a.download = previewItem.fileName || 'file';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex items-center justify-center order-1 sm:order-2 text-xs md:text-sm"
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectsManager; 