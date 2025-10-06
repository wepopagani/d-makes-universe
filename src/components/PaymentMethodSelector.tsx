import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Smartphone, HandCoins, QrCode, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodSelectorProps {
  orderId: string;
  orderTotal: number;
  currentPaymentStatus: string;
  onPaymentUpdate: (paymentMethod: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderId,
  orderTotal,
  currentPaymentStatus,
  onPaymentUpdate,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showTwintQR, setShowTwintQR] = useState(false);
  const [showSumUpQR, setShowSumUpQR] = useState(false);
  const [processing, setProcessing] = useState(false);

  // QR Code Twint - sostituire con il QR reale
  const TWINT_QR_CODE = "/twint.png"; // QR code Twint reale - NOTA: Assicurati che il file twint.png sia presente in public/
  const SUMUP_QR_CODE = "/sumup.png"; // QR code SumUp - NOTA: Assicurati che il file sumup.png sia presente in public/
  const SUMUP_PAYMENT_URL = "https://pay.sumup.com/b2c/QV2FI5EI"; // Link diretto SumUp

  const paymentMethods = [
    {
      id: 'twint',
      name: 'Twint',
      description: 'Paga con l\'app Twint usando il QR code',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'card',
      name: 'Carta di Credito/Debito',
      description: 'Carta, Apple Pay, Google Pay tramite SumUp',
      icon: (
        <div className="h-6 w-6 flex items-center justify-center relative">
          <CreditCard className="h-6 w-6" />
          <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
            <div className="w-2 h-2 bg-gray-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-1.5 w-1.5" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          </div>
        </div>
      ),
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'pickup',
      name: 'Pagamento al Ritiro',
      description: 'Paga in contanti o carta al momento del ritiro',
      icon: <HandCoins className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'twint') {
      setShowTwintQR(true);
    } else if (methodId === 'card') {
      setShowSumUpQR(true);
    } else if (methodId === 'pickup') {
      handlePickupPayment();
    }
  };

  const handleTwintPayment = async () => {
    try {
      setProcessing(true);
      await onPaymentUpdate('pagato_twint');
      toast({
        title: "Pagamento Twint confermato",
        description: "Il pagamento tramite Twint è stato registrato con successo.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma del pagamento Twint.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSumUpPayment = async () => {
    try {
      setProcessing(true);
      await onPaymentUpdate('pagato_carta');
      toast({
        title: "Pagamento con carta confermato",
        description: "Il pagamento tramite SumUp è stato registrato con successo.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma del pagamento con carta.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };



  const handlePickupPayment = async () => {
    try {
      setProcessing(true);
      // Non cambiamo lo stato di pagamento, rimane "da_pagare" fino al ritiro
      toast({
        title: "Pagamento al ritiro selezionato",
        description: "Potrai pagare in contanti o con carta al momento del ritiro.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la selezione del metodo di pagamento.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'da_pagare':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Da pagare</Badge>;
      case 'pagato_carta':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagato con carta/Apple Pay/Google Pay</Badge>;
      case 'pagato_contanti':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagato in contanti</Badge>;
      case 'pagato_twint':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Pagato con Twint</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Dialog principale per selezione metodo */}
      <Dialog open={isOpen && !showTwintQR && !showSumUpQR} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleziona Metodo di Pagamento</DialogTitle>
            <DialogDescription>
              Scegli come vuoi pagare il tuo ordine di {formatCurrency(orderTotal)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Ordine #{orderId.substring(0, 8)}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{formatCurrency(orderTotal)}</span>
                {getPaymentStatusBadge(currentPaymentStatus)}
              </div>
            </div>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Card 
                  key={method.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMethod === method.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per QR Twint */}
      <Dialog open={showTwintQR} onOpenChange={() => setShowTwintQR(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Pagamento Twint
            </DialogTitle>
            <DialogDescription>
              Scansiona il QR code con l'app Twint per pagare {formatCurrency(orderTotal)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <img 
                  src={TWINT_QR_CODE} 
                  alt="QR Code Twint" 
                  className="h-32 w-32 mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    // Fallback se l'immagine non viene trovata
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="hidden">
                  <QrCode className="h-32 w-32 mx-auto mb-4 text-gray-400" />
                  <p className="text-xs text-red-500 mb-2">
                    QR Code non disponibile - Aggiungi twint.png in public/
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  {formatCurrency(orderTotal)}
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Come pagare:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Apri l'app Twint sul tuo telefono</li>
                <li>2. Seleziona "Scansiona QR"</li>
                <li>3. Inquadra il QR code sopra</li>
                <li>4. Conferma il pagamento di {formatCurrency(orderTotal)}</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTwintQR(false);
                setSelectedMethod('');
              }}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleTwintPayment}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Confermando...
                </>
              ) : (
                'Ho pagato con Twint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per QR SumUp */}
      <Dialog open={showSumUpQR} onOpenChange={() => setShowSumUpQR(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Pagamento con Carta
            </DialogTitle>
            <DialogDescription>
              Paga {formatCurrency(orderTotal)} con carta, Apple Pay o Google Pay tramite SumUp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <img 
                  src={SUMUP_QR_CODE} 
                  alt="QR Code SumUp" 
                  className="h-32 w-32 mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    // Fallback se l'immagine non viene trovata
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                                 <div className="hidden">
                   <QrCode className="h-32 w-32 mx-auto mb-4 text-gray-400" />
                   <p className="text-xs text-red-500 mb-2">
                     QR Code non disponibile - Aggiungi sumup.png in public/
                   </p>
                 </div>
                 <p className="text-lg font-bold text-green-600 mt-2">
                   {formatCurrency(orderTotal)}
                 </p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Come pagare:</h4>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. Scansiona il QR code sopra con la fotocamera</li>
                <li>2. Oppure clicca il link qui sotto</li>
                <li>3. Scegli: carta, Apple Pay o Google Pay</li>
                <li>4. Conferma il pagamento di {formatCurrency(orderTotal)}</li>
              </ol>
            </div>

            {/* Link diretto SumUp */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.open(SUMUP_PAYMENT_URL, '_blank')}
                className="flex items-center gap-2 w-full"
              >
                <ExternalLink className="h-4 w-4" />
                Apri pagamento SumUp
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSumUpQR(false);
                setSelectedMethod('');
              }}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSumUpPayment}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Confermando...
                </>
              ) : (
                'Ho pagato con SumUp'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentMethodSelector; 