import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/firebase/AuthContext';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { sendOrderConfirmationEmail } from '@/utils/emailService';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order, OrderItem } from '@/types/user';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, ArrowLeft, CheckCircle, XCircle, Clock, Truck, Download } from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Stati per il pagamento
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!currentUser || !orderId) {
        navigate('/dashboard/ordini');
        return;
      }
      
      try {
        setLoading(true);
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (!orderDoc.exists()) {
          toast({
            title: "Errore",
            description: "Ordine non trovato",
            variant: "destructive"
          });
          navigate('/dashboard/ordini');
          return;
        }
        
        const orderData = orderDoc.data();
        
        // Verify this order belongs to the current user
        if (orderData.userId !== currentUser.uid) {
          toast({
            title: "Accesso negato",
            description: "Non hai il permesso di visualizzare questo ordine",
            variant: "destructive"
          });
          navigate('/dashboard/ordini');
          return;
        }
        
        setOrder({
          id: orderDoc.id,
          userId: orderData.userId,
          status: orderData.status,
          createdAt: orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : new Date(),
          updatedAt: orderData.updatedAt instanceof Timestamp ? orderData.updatedAt.toDate() : new Date(),
          items: orderData.items,
          totalAmount: orderData.totalAmount,
          paymentStatus: orderData.paymentStatus,
          shippingAddress: orderData.shippingAddress,
          projectId: orderData.projectId
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dettagli dell'ordine",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [currentUser, orderId, navigate, toast]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">In attesa</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In lavorazione</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completato</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Annullato</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'da_pagare':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Da pagare</Badge>;
      case 'pagato_carta':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagato con carta</Badge>;
      case 'pagato_contanti':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagato in contanti</Badge>;
      case 'pagato_twint':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagato con Twint</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Truck className="h-6 w-6 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Function to accept quote
  const handleAcceptQuote = async () => {
    if (!order || !orderId || !currentUser) return;
    
    try {
      setProcessing(true);
      
      // Update order in Firestore
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'accepted',
        isOrder: true,
        productionStatus: 'non_iniziato',
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrder(prev => prev ? {
        ...prev,
        status: 'accepted',
        updatedAt: new Date()
      } : null);
      
      // Invia email di conferma ordine
      try {
        await sendOrderConfirmationEmail({
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || currentUser.email || 'Cliente',
          orderId: order.id,
          orderDetails: `Ordine #${order.id.substring(0, 8)} - ${order.items.length} articoli`,
          totalPrice: order.totalAmount,
          estimatedDelivery: '7-10 giorni lavorativi'
        });
        
        console.log('Email di conferma ordine inviata con successo');
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email di conferma:', emailError);
        // Non blocchiamo il processo se l'email fallisce
      }
      
      toast({
        title: "Preventivo accettato",
        description: "Hai accettato il preventivo. Il tuo ordine è stato confermato e riceverai una email di conferma.",
      });
      
      // Navigate back to orders list after a delay
      setTimeout(() => {
        navigate('/dashboard/ordini');
      }, 2000);
      
    } catch (error) {
      console.error("Error accepting quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'accettazione del preventivo",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Function to decline quote
  const handleDeclineQuote = async () => {
    if (!order || !orderId) return;
    
    try {
      setProcessing(true);
      
      // Update order in Firestore
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrder(prev => prev ? {
        ...prev,
        status: 'rejected',
        updatedAt: new Date()
      } : null);
      
      toast({
        title: "Preventivo rifiutato",
        description: "Hai rifiutato il preventivo.",
      });
      
      // Navigate back to orders list after a delay
      setTimeout(() => {
        navigate('/dashboard/ordini');
      }, 2000);
      
    } catch (error) {
      console.error("Error declining quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il rifiuto del preventivo",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Funzione per aggiornare il pagamento
  const handlePaymentUpdate = async (paymentMethod: string) => {
    if (!order || !orderId) return;
    
    try {
      // Mappa il metodo di pagamento al formato corretto
      let paymentStatus = 'da_pagare';
      switch (paymentMethod) {
        case 'pagato_twint':
          paymentStatus = 'pagato_twint';
          break;
        case 'pagato_carta':
          paymentStatus = 'pagato_carta';
          break;
        case 'pagato_contanti':
          paymentStatus = 'pagato_contanti';
          break;
        default:
          paymentStatus = 'da_pagare';
      }
      
      // Aggiorna in Firestore
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: paymentStatus,
        updatedAt: Timestamp.now()
      });
      
      // Aggiorna lo stato locale
      setOrder(prev => prev ? {
        ...prev,
        paymentStatus: paymentStatus as any,
        updatedAt: new Date()
      } : null);
      
      setIsPaymentDialogOpen(false);
      
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error; // Rilancia l'errore per gestirlo nel componente PaymentMethodSelector
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-4 md:py-8" style={{backgroundColor: '#E4DDD4'}}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-4 md:mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/ordini')} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna agli ordini
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
            </div>
          ) : order ? (
            <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Dettagli Ordine</CardTitle>
                        <CardDescription>Ordine #{order.id.substring(0, 8)}</CardDescription>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{getStatusBadge(order.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Data ordine</p>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Ultimo aggiornamento</p>
                          <p>{formatDate(order.updatedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Stato pagamento</p>
                          <p>{getPaymentStatusBadge(order.paymentStatus)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500">Importo totale</p>
                          <p className="font-semibold text-lg">{order.totalAmount.toFixed(2)} CHF</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-semibold mb-3">Articoli dell'ordine</h3>
                        
                        {/* Desktop Table View */}
                        <div className="hidden md:block border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>File</TableHead>
                                <TableHead>Tipo Stampa</TableHead>
                                <TableHead>Qualità</TableHead>
                                <TableHead>Materiale</TableHead>
                                <TableHead>Hollowed</TableHead>
                                <TableHead>Colore</TableHead>
                                <TableHead>Quantità</TableHead>
                                <TableHead className="text-right">Prezzo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item: OrderItem) => {
                                // Calcola il prezzo per singolo articolo dal totale dell'ordine
                                const totalItems = order.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
                                const pricePerItem = order.totalAmount > 0 ? order.totalAmount / totalItems : 0;
                                const itemTotalPrice = pricePerItem * item.quantity;
                                
                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                        <span title={item.fileName}>{item.fileName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.printType ? (item.printType === 'fdm' ? 'FDM' : 'SLA') : (item.resolution ? 'FDM' : 'N/A')}</TableCell>
                                    <TableCell>
                                      {item.quality ? 
                                        (item.printType === 'sla' ? `${item.quality} micron` : `${item.quality}mm`) : 
                                        (item.resolution || 'N/A')
                                      }
                                    </TableCell>
                                    <TableCell>{item.material}</TableCell>
                                    <TableCell>
                                      {item.printType === 'sla' && item.hollowed ? 
                                        (item.hollowed === 'no' ? 'No' : 
                                         item.hollowed === 'vuoto' ? 'Sì vuoto' : 
                                         item.hollowed === 'riempimento' ? 'Sì con riempimento' : 'N/A') : 
                                        'N/A'
                                      }
                                    </TableCell>
                                    <TableCell>{item.color}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                      {order.totalAmount > 0 ? itemTotalPrice.toFixed(2) : '0.00'} CHF
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                          {order.items.map((item: OrderItem) => {
                            // Calcola il prezzo per singolo articolo dal totale dell'ordine
                            const totalItems = order.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
                            const pricePerItem = order.totalAmount > 0 ? order.totalAmount / totalItems : 0;
                            const itemTotalPrice = pricePerItem * item.quantity;
                            
                            return (
                              <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center flex-1 min-w-0">
                                    <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-sm truncate" title={item.fileName}>
                                      {item.fileName}
                                    </span>
                                  </div>
                                  <span className="font-bold text-sm ml-2 flex-shrink-0">
                                    {order.totalAmount > 0 ? itemTotalPrice.toFixed(2) : '0.00'} CHF
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">Tipo Stampa:</span>
                                    <div className="font-medium">{item.printType ? (item.printType === 'fdm' ? 'FDM' : 'SLA') : (item.resolution ? 'FDM' : 'N/A')}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Qualità:</span>
                                    <div className="font-medium">
                                      {item.quality ? 
                                        (item.printType === 'sla' ? `${item.quality} micron` : `${item.quality}mm`) : 
                                        (item.resolution || 'N/A')
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Materiale:</span>
                                    <div className="font-medium">{item.material}</div>
                                  </div>
                                  {item.printType === 'sla' && (
                                    <div>
                                      <span className="text-gray-500">Hollowed:</span>
                                      <div className="font-medium">
                                        {item.hollowed ? 
                                          (item.hollowed === 'no' ? 'No' : 
                                           item.hollowed === 'vuoto' ? 'Sì vuoto' : 
                                           item.hollowed === 'riempimento' ? 'Sì con riempimento' : 'N/A') : 
                                          'N/A'
                                        }
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Colore:</span>
                                    <div className="font-medium">{item.color}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Quantità:</span>
                                    <div className="font-medium">{item.quantity}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {order.items[0]?.notes && (
                        <div>
                          <h3 className="text-md font-semibold mb-2">Note</h3>
                          <p className="text-gray-700 p-3 bg-gray-50 rounded-md">{order.items[0].notes}</p>
                        </div>
                      )}
                      
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {/* Mostra bottoni Accetta/Rifiuta solo se è un preventivo con prezzo */}
                    {order.status === 'pending' && order.totalAmount > 0 ? (
                      <div className="flex gap-3 w-full">
                        <Button 
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleAcceptQuote}
                          disabled={processing}
                        >
                          {processing ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                              Elaborazione...
                            </>
                          ) : (
                            '✅ Accetta Preventivo'
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={handleDeclineQuote}
                          disabled={processing}
                        >
                          {processing ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-red-600 rounded-full"></div>
                              Elaborazione...
                            </>
                          ) : (
                            '❌ Rifiuta Preventivo'
                          )}
                        </Button>
                      </div>
                    ) : order.status === 'completed' ? (
                      <Button size="sm" className="ml-auto flex items-center gap-2">
                        Effettua nuovo ordine
                      </Button>
                    ) : (
                      <div className="w-full">
                        {/* Bottone Metodo di Pagamento per ordini accettati */}
                        {order.totalAmount > 0 && 
                         (order.status === 'accepted' || order.status === 'processing') && 
                         order.paymentStatus !== 'pagato_carta' && 
                         order.paymentStatus !== 'pagato_contanti' && 
                         order.paymentStatus !== 'pagato_twint' ? (
                          <div className="flex justify-center mb-4">
                            <Button
                              variant="default"
                              onClick={() => setIsPaymentDialogOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Metodo di Pagamento
                            </Button>
                          </div>
                        ) : null}
                        
                        <div className="text-center text-gray-500 py-2">
                          {order.status === 'pending' && order.totalAmount === 0 && (
                            <span>⏳ In attesa del preventivo dall'amministratore</span>
                          )}
                          {order.status === 'accepted' && (
                            <span>✅ Preventivo accettato - Ordine confermato</span>
                          )}
                          {order.status === 'rejected' && (
                            <span>❌ Preventivo rifiutato</span>
                          )}
                          {order.status === 'processing' && (
                            <span>🔄 Ordine in produzione</span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {order.shippingAddress.deliveryMethod === 'pickup' ? 'Ritiro in negozio' : 'Indirizzo di spedizione'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.shippingAddress.deliveryMethod === 'pickup' ? (
                        <>
                          <div className="flex items-center space-x-2 text-blue-600 mb-3">
                            <span className="text-lg">🏪</span>
                            <span className="font-medium">Ritiro in negozio</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">📍 Indirizzo Laboratorio</h4>
                            <p className="text-blue-700 text-sm">
                              3DMakes<br/>
                                              Via Cantonale 15<br/>
                6918 Lugano, Svizzera<br/>
                              Tel: +41 76 266 03 96
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Dati di contatto:</p>
                            <p className="font-semibold">{order.shippingAddress.nome} {order.shippingAddress.cognome}</p>
                            <p>Tel: {order.shippingAddress.telefono}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 text-green-600 mb-3">
                            <span className="text-lg">📦</span>
                            <span className="font-medium">Spedizione a domicilio</span>
                          </div>
                          <p className="font-semibold">{order.shippingAddress.nome} {order.shippingAddress.cognome}</p>
                          <p>{order.shippingAddress.indirizzo}</p>
                          <p>{order.shippingAddress.cap} {order.shippingAddress.citta}</p>
                          <p>Tel: {order.shippingAddress.telefono}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p>Ordine non trovato</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/dashboard/ordini')}
                className="mt-4"
              >
                Torna alla lista ordini
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Dialog per il metodo di pagamento */}
      {order && (
        <PaymentMethodSelector
          orderId={order.id}
          orderTotal={order.totalAmount}
          currentPaymentStatus={order.paymentStatus}
          onPaymentUpdate={handlePaymentUpdate}
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails; 