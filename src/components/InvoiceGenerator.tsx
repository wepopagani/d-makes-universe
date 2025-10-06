import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/firebase/AuthContext';
import jsPDF from 'jspdf';

// Interfaccia per l'ordine
interface OrderType {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: any[];
  totalAmount: number;
  paymentStatus: string;
  shippingAddress?: {
    nome?: string;
    cognome?: string;
    indirizzo?: string;
    citta?: string;
    cap?: string;
    telefono?: string;
  };
  isOrder?: boolean;
  productionStatus?: string;
}

const InvoiceGenerator: React.FC<{ 
  orderId: string; 
  order: OrderType;
}> = ({ orderId, order }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Generazione e download della fattura
  const generateInvoice = async () => {
    if (!currentUser) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per scaricare la fattura",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Verifica che l'ordine abbia i dati necessari
      if (!order.totalAmount || order.totalAmount <= 0) {
        toast({
          title: "Errore",
          description: "L'ordine non ha un importo valido",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Crea il PDF
      const pdf = new jsPDF();
      
      // Imposta font
      pdf.setFont('helvetica');
      
      // Header della fattura
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204); // Blu 3DMakes
      pdf.text('3DMAKES', 20, 30);
      pdf.setTextColor(0, 0, 0); // Nero
      pdf.setFontSize(16);
      pdf.text('FATTURA', 20, 45);
      
      // Dati di 3DMakes
      pdf.setFontSize(10);
      pdf.text('Da:', 20, 65);
      pdf.setFontSize(12);
      pdf.text('3DMakes', 20, 75);
          pdf.text('Via Cantonale 15', 20, 85);
    pdf.text('6918 Lugano', 20, 95);
      pdf.text('Svizzera', 20, 105);
      
      // Dati del cliente
      pdf.setFontSize(10);
      pdf.text('A:', 120, 65);
      pdf.setFontSize(12);
      
      // Gestisci i dati del cliente anche se mancanti
      let clientName = 'Cliente';
      let clientAddress = '';
      let clientCity = '';
      
      if (order.shippingAddress) {
        const firstName = order.shippingAddress.nome || '';
        const lastName = order.shippingAddress.cognome || '';
        clientName = `${firstName} ${lastName}`.trim() || 'Cliente';
        clientAddress = order.shippingAddress.indirizzo || '';
        clientCity = `${order.shippingAddress.cap || ''} ${order.shippingAddress.citta || ''}`.trim();
      } else {
        // Se non c'è shipping address, prova a usare l'email dell'utente
        clientName = currentUser.email || 'Cliente';
      }
      
      pdf.text(clientName, 120, 75);
      if (clientAddress) pdf.text(clientAddress, 120, 85);
      if (clientCity) pdf.text(clientCity, 120, 95);
      
      // Dettagli fattura
      const invoiceNumber = `INV-${orderId.substring(0, 8)}`;
      const invoiceDate = new Date().toLocaleDateString('it-CH');
      
      pdf.setFontSize(10);
      pdf.text(`Numero fattura: ${invoiceNumber}`, 20, 125);
      pdf.text(`Data: ${invoiceDate}`, 20, 135);
      pdf.text(`Ordine: ${orderId}`, 20, 145);
      
      // Articoli dell'ordine
      pdf.setFontSize(12);
      pdf.text('Articoli ordinati:', 20, 165);
      
      let yPosition = 175;
      pdf.setFontSize(10);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any, index: number) => {
          const itemText = `${index + 1}. ${item.fileName || 'File'} - ${item.material || 'N/A'}${item.color ? ` (${item.color})` : ''} - Qty: ${item.quantity || 1}`;
          pdf.text(itemText, 25, yPosition);
          yPosition += 10;
        });
      } else {
        pdf.text('Dettagli articoli non disponibili', 25, yPosition);
        yPosition += 10;
      }
      
      // Totale
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.text(`Totale: CHF ${order.totalAmount.toFixed(2)}`, 20, yPosition);
      
      // Note
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.text('Per informazioni contattare:', 20, yPosition);
      pdf.text('Email: info@3dmakes.ch', 20, yPosition + 10);
      pdf.text('Tel: +41 76 266 03 96', 20, yPosition + 20);
      
      // Salva il PDF
      pdf.save(`Fattura_3DMakes_${invoiceNumber}.pdf`);
      
      toast({
        title: "Fattura scaricata",
        description: `Fattura ${invoiceNumber} scaricata con successo`,
      });
      
    } catch (error) {
      console.error('Errore durante la generazione della fattura:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione della fattura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={generateInvoice} 
      className="w-full" 
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
          Generazione in corso...
        </>
      ) : (
        'Scarica Fattura'
      )}
    </Button>
  );
};

export default InvoiceGenerator; 