import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Upload, User, FileText, Send, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { sendCustomQuoteEmail } from '@/utils/emailService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Quote {
  id: string;
  clientEmail: string;
  clientName?: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: any[];
  pdfUrl?: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AdminQuotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Stati per la creazione del preventivo
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [quoteData, setQuoteData] = useState({
    description: '',
    amount: '',
    validUntil: '',
    notes: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const quotesQuery = query(
        collection(db, "quotes"),
        orderBy("createdAt", "desc")
      );
      
      const quotesSnapshot = await getDocs(quotesQuery);
      const quotesData: Quote[] = [];
      
      quotesSnapshot.forEach((doc) => {
        const data = doc.data();
        quotesData.push({
          id: doc.id,
          clientEmail: data.clientEmail || 'N/A',
          clientName: data.clientName || '',
          status: data.status || 'pending',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          items: data.items || [],
          pdfUrl: data.pdfUrl || '',
          description: data.description || ''
        });
      });
      
      setQuotes(quotesData);
    } catch (error) {
      console.error('Errore durante il caricamento dei preventivi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("firstName", "asc"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || ''
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Errore durante il caricamento degli utenti:', error);
    }
  };

  const handleCreateQuote = async () => {
    try {
      setIsUploading(true);
      
      // Validazione
      if (clientType === 'existing' && !selectedUser) {
        toast({ title: "Errore", description: "Seleziona un utente esistente", variant: "destructive" });
        return;
      }
      
      if (clientType === 'new' && (!newClientData.firstName || !newClientData.lastName || !newClientData.email)) {
        toast({ title: "Errore", description: "Compila tutti i campi obbligatori", variant: "destructive" });
        return;
      }
      
      if (!quoteData.description || !quoteData.amount) {
        toast({ title: "Errore", description: "Descrizione e importo sono obbligatori", variant: "destructive" });
        return;
      }

      let clientInfo;
      let clientEmail;
      
      if (clientType === 'existing') {
        const user = users.find(u => u.id === selectedUser);
        if (!user) {
          toast({ title: "Errore", description: "Utente non trovato", variant: "destructive" });
          return;
        }
        clientInfo = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        };
        clientEmail = user.email;
      } else {
        clientInfo = newClientData;
        clientEmail = newClientData.email;
        
        // Crea un nuovo utente se non esiste
        const userRef = doc(db, "users", newClientData.email);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            ...newClientData,
            createdAt: new Date(),
            createdBy: 'admin',
            role: 'user'
          });
        }
      }

      // Upload PDF se presente
      let pdfUrl = '';
      if (pdfFile) {
        const pdfRef = ref(storage, `quotes/${Date.now()}_${pdfFile.name}`);
        const uploadResult = await uploadBytes(pdfRef, pdfFile);
        pdfUrl = await getDownloadURL(uploadResult.ref);
      }

      // Crea il preventivo
      const quoteDoc = {
        clientEmail,
        clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
        clientInfo,
        description: quoteData.description,
        totalAmount: parseFloat(quoteData.amount),
        status: 'sent',
        validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : null,
        notes: quoteData.notes,
        pdfUrl,
        createdAt: new Date(),
        createdBy: 'admin',
        type: 'custom'
      };

      const docRef = await addDoc(collection(db, "quotes"), quoteDoc);
      
      // Invia email al cliente
      try {
        await sendCustomQuoteEmail({
          clientEmail,
          clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
          description: quoteData.description,
          amount: parseFloat(quoteData.amount),
          quoteId: docRef.id,
          pdfUrl,
          validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : undefined,
          notes: quoteData.notes
        });
        
        toast({
          title: "Preventivo creato e inviato!",
          description: `Il preventivo è stato creato e inviato via email a ${clientEmail}`,
          variant: "default"
        });
      } catch (emailError) {
        console.error('Errore invio email:', emailError);
        toast({
          title: "Preventivo creato!",
          description: "Il preventivo è stato creato ma l'invio email ha avuto problemi. Controlla la configurazione EmailJS.",
          variant: "default"
        });
      }
      
      // Reset form
      setSelectedUser('');
      setNewClientData({ firstName: '', lastName: '', email: '', phone: '' });
      setQuoteData({ description: '', amount: '', validUntil: '', notes: '' });
      setPdfFile(null);
      setIsCreateDialogOpen(false);
      
      // Refresh data
      fetchQuotes();

    } catch (error) {
      console.error('Errore durante la creazione del preventivo:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione del preventivo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Errore",
          description: "Solo file PDF sono supportati",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Errore", 
          description: "Il file deve essere inferiore a 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setPdfFile(file);
    }
  };

  const handleResendQuoteEmail = async (quote: Quote) => {
    try {
      setSendingEmail(quote.id);
      
      await sendCustomQuoteEmail({
        clientEmail: quote.clientEmail,
        clientName: quote.clientName || quote.clientEmail,
        description: quote.description || 'Preventivo personalizzato',
        amount: quote.totalAmount,
        quoteId: quote.id,
        pdfUrl: quote.pdfUrl,
        notes: 'Email inviata nuovamente dall\'amministratore'
      });
      
      toast({
        title: "Email inviata!",
        description: `Email preventivo inviata a ${quote.clientEmail}`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Errore invio email:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'invio dell'email",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'sent':
        return 'Inviato';
      case 'approved':
        return 'Approvato';
      case 'rejected':
        return 'Rifiutato';
      default:
        return 'Sconosciuto';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestione Preventivi</h1>
              <p className="text-gray-600 mt-1">Visualizza e gestisci tutti i preventivi</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90"
          >
            <Plus className="h-4 w-4" />
            Crea Preventivo
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Preventivi ({quotes.length})</CardTitle>
            <CardDescription>
              Elenco di tutti i preventivi creati e richiesti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
              </div>
            ) : quotes.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data Creazione</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{quote.clientName || quote.clientEmail}</div>
                            <div className="text-sm text-gray-500">{quote.clientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(quote.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                            {getStatusText(quote.status)}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(quote.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={quote.description}>
                            {quote.description || 'Nessuna descrizione'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {quote.pdfUrl ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(quote.pdfUrl, '_blank')}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              Visualizza
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">Nessun PDF</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResendQuoteEmail(quote)}
                              disabled={sendingEmail === quote.id}
                              className="flex items-center gap-1"
                            >
                              {sendingEmail === quote.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <Mail className="h-3 w-3" />
                              )}
                              {sendingEmail === quote.id ? 'Invio...' : 'Invia Email'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // TODO: Implementa modifica preventivo
                                toast({ title: "Info", description: "Funzionalità in sviluppo" });
                              }}
                            >
                              Modifica
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-500">Nessun preventivo trovato.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Crea il primo preventivo cliccando il pulsante "Crea Preventivo"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog per creare preventivo */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Crea Nuovo Preventivo
              </DialogTitle>
              <DialogDescription>
                Crea un preventivo personalizzato per un cliente esistente o nuovo
              </DialogDescription>
            </DialogHeader>

            <Tabs value={clientType} onValueChange={(value) => setClientType(value as 'existing' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente Esistente
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuovo Cliente
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Seleziona Cliente</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Scegli un cliente registrato..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      value={newClientData.firstName}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Nome del cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Cognome *</Label>
                    <Input
                      id="lastName"
                      value={newClientData.lastName}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Cognome del cliente"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@esempio.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Dettagli Preventivo</h4>
              
              <div>
                <Label htmlFor="description">Descrizione Lavoro *</Label>
                <Textarea
                  id="description"
                  value={quoteData.description}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrivi il lavoro da svolgere..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Importo (CHF) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={quoteData.amount}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valido fino a</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Note Aggiuntive</Label>
                <Textarea
                  id="notes"
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Note interne o per il cliente..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="pdf">Carica PDF Preventivo</Label>
                <div className="mt-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {pdfFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isUploading}
              >
                Annulla
              </Button>
              <Button 
                onClick={handleCreateQuote}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creazione...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Crea Preventivo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default AdminQuotes; 