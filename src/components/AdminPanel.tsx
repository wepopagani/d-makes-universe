import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useAuth } from '@/firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserProfileData, FileInfo } from '@/types/user';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Menu, ChevronDown, Home, Package, MessageSquare, FileText, BarChart3, Users, TrendingUp } from "lucide-react";
import AdminMessagesContainer from "./AdminMessagesContainer";
import AdminProjectsManager from "./AdminProjectsManager";

interface ExtendedUserData extends UserProfileData {
  id: string;
  lastLogin?: Date;
  createdAt?: Date;
  totalFiles?: number;
  isAzienda?: boolean;
  azienda?: string;
  note?: string;
}

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ExtendedUserData[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ExtendedUserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<ExtendedUserData | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Nuovo stato per la dialog di aggiunta cliente
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<ExtendedUserData>>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: '',
    isAzienda: false,
    azienda: '',
    note: ''
  });
  
  // Stati per la dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalQuotes: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  
  // Carica utenti inizialmente
  useEffect(() => {
    // Just set loading to false since we've removed client area functionality
    setLoading(false);
    // Carica le statistiche della dashboard
    fetchDashboardStats();
  }, []);
  
  // Funzione per caricare le statistiche della dashboard
  const fetchDashboardStats = async () => {
    try {
      setDashboardLoading(true);
      
      // Carica ordini e preventivi
      const ordersQuery = query(collection(db, "orders"));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      let totalOrders = 0;
      let totalQuotes = 0;
      let pendingOrders = 0;
      let completedOrders = 0;
      let pendingQuotes = 0;
      let approvedQuotes = 0;
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        
        if (data.isOrder === true) {
          totalOrders++;
          if (data.productionStatus === 'completato') {
            completedOrders++;
          } else {
            pendingOrders++;
          }
          
          // Calcola revenue
          if (data.totalAmount > 0) {
            totalRevenue += data.totalAmount;
            
            // Revenue mensile
            if (createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
              monthlyRevenue += data.totalAmount;
            }
          }
        } else {
          totalQuotes++;
          if (data.status === 'pending') {
            pendingQuotes++;
          } else if (data.status === 'approved') {
            approvedQuotes++;
          }
        }
      });
      
      // Carica utenti
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;
      
      setDashboardStats({
        totalOrders,
        totalQuotes,
        totalUsers,
        pendingOrders,
        completedOrders,
        pendingQuotes,
        approvedQuotes,
        totalRevenue,
        monthlyRevenue
      });
      
    } catch (error) {
      console.error('Errore durante il caricamento delle statistiche:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche della dashboard.",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  };
  
  // Funzione per caricare gli utenti
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData: ExtendedUserData[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        // Get user data
        const userData = userDoc.data() as UserProfileData;
        
        // Count files for this user
        const filesQuery = query(collection(db, 'files'), where('userId', '==', userDoc.id));
        const filesSnapshot = await getDocs(filesQuery);
        
        // Add to users array
        usersData.push({
          id: userDoc.id,
          nome: userData.nome || '',
          cognome: userData.cognome || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          indirizzo: userData.indirizzo || '',
          citta: userData.citta || '',
          cap: userData.cap || '',
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin,
          totalFiles: filesSnapshot.size,
          isAzienda: userData.isAzienda || false,
          azienda: userData.azienda || '',
          note: userData.note || ''
        });
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Errore durante il caricamento degli utenti:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista degli utenti.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per caricare i file di un utente
  const fetchUserFiles = async (userId: string) => {
    try {
      const filesQuery = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(filesQuery);
      
      const filesData: FileInfo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        filesData.push({
          id: doc.id,
          name: data.originalName || data.name,
          type: data.type,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          uploadedAt: data.uploadedAt.toDate(),
          userId: data.userId,
          userEmail: data.userEmail
        });
      });
      
      setFiles(filesData);
      return filesData;
    } catch (error) {
      console.error('Errore durante il caricamento dei file:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i file dell'utente.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Funzione per gestire la selezione di un utente
  const handleUserSelect = async (user: ExtendedUserData) => {
    setSelectedUser(user);
    await fetchUserFiles(user.id);
  };
  
  // Funzione per modificare i dati di un utente
  const handleEditUser = (user: ExtendedUserData) => {
    setEditUserData({...user});
    setIsEditDialogOpen(true);
  };
  
  // Funzione per salvare le modifiche ai dati utente
  const saveUserChanges = async () => {
    if (!editUserData) return;
    
    try {
      const dataToUpdate: any = {
        telefono: editUserData.telefono,
        indirizzo: editUserData.indirizzo,
        citta: editUserData.citta,
        cap: editUserData.cap,
        isAzienda: editUserData.isAzienda || false,
        note: editUserData.note || ''
      };
      
      // Se è un'azienda, salva il nome azienda, altrimenti nome e cognome
      if (editUserData.isAzienda) {
        dataToUpdate.azienda = editUserData.azienda;
        // Mantieni nome e cognome vuoti per le aziende
        dataToUpdate.nome = '';
        dataToUpdate.cognome = '';
      } else {
        dataToUpdate.nome = editUserData.nome;
        dataToUpdate.cognome = editUserData.cognome;
        // Svuota il campo azienda se l'utente è un privato
        dataToUpdate.azienda = '';
      }
      
      await updateDoc(doc(db, 'users', editUserData.id), dataToUpdate);
      
      // Aggiorna la lista degli utenti
      setUsers(users.map(user => 
        user.id === editUserData.id ? editUserData : user
      ));
      
      // Aggiorna l'utente selezionato se necessario
      if (selectedUser && selectedUser.id === editUserData.id) {
        setSelectedUser(editUserData);
      }
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Utente aggiornato",
        description: "I dati dell'utente sono stati aggiornati con successo.",
      });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'utente:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i dati dell'utente.",
        variant: "destructive",
      });
    }
  };
  
  // Funzione per aggiungere un nuovo cliente
  const handleAddClient = async () => {
    if (!newClient.email || (newClient.isAzienda ? !newClient.azienda : (!newClient.nome || !newClient.cognome))) {
      toast({
        title: "Dati mancanti",
        description: "Compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Prepara i dati per Firestore
      const userData: any = {
        nome: newClient.isAzienda ? '' : newClient.nome,
        cognome: newClient.isAzienda ? '' : newClient.cognome,
        email: newClient.email,
        telefono: newClient.telefono || '',
        indirizzo: newClient.indirizzo || '',
        citta: newClient.citta || '',
        cap: newClient.cap || '',
        createdAt: Timestamp.now(),
        lastLogin: null,
        isAzienda: newClient.isAzienda || false,
        note: newClient.note || ''
      };
      
      // Aggiungi il campo azienda solo se è un'azienda
      if (newClient.isAzienda) {
        userData.azienda = newClient.azienda;
      }
      
      // Aggiungi il documento a Firestore
      const docRef = await addDoc(collection(db, 'users'), userData);
      
      // Aggiorna l'UI
      const newUserData: ExtendedUserData = {
        id: docRef.id,
        ...userData,
        totalFiles: 0
      };
      
      setUsers([newUserData, ...users]);
      
      // Resetta il form e chiudi la dialog
      setNewClient({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        indirizzo: '',
        citta: '',
        cap: '',
        isAzienda: false,
        azienda: '',
        note: ''
      });
      setIsAddClientDialogOpen(false);
      
      toast({
        title: "Cliente aggiunto",
        description: "Il nuovo cliente è stato aggiunto con successo.",
      });
    } catch (error) {
      console.error('Errore durante l\'aggiunta del cliente:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il nuovo cliente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">Pannello Amministratore</h2>
      
        {/* Mobile Navigation - Dropdown menu */}
        <div className="md:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "projects" && "Ordini"}
                {activeTab === "messages" && "Messaggi"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Torna al sito
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveTab("projects")}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Ordini
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveTab("messages")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Messaggi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4 hidden md:flex">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Ordini</TabsTrigger>
          <TabsTrigger value="messages">Messaggi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {/* Contenuto per la Dashboard */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold">Dashboard Amministratore</h3>
                <p className="text-gray-600 mt-1">Panoramica generale del sistema</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchDashboardStats}
                disabled={dashboardLoading}
                className="mt-4 md:mt-0"
              >
                {dashboardLoading ? 'Aggiornando...' : 'Aggiorna'}
              </Button>
            </div>
            
            {dashboardLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <>
                {/* Statistiche principali */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:bg-blue-50"
                    onClick={() => navigate('/admin/orders')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.pendingOrders} in corso, {dashboardStats.completedOrders} completati
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:bg-blue-50"
                    onClick={() => navigate('/admin/orders?tab=quotes')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Preventivi</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalQuotes}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.pendingQuotes} in attesa, {dashboardStats.approvedQuotes} approvati
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:bg-blue-50"
                    onClick={() => navigate('/admin/clients')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Clienti</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        Utenti registrati
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:bg-blue-50"
                    onClick={() => navigate('/admin/revenue')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">CHF {dashboardStats.totalRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        CHF {dashboardStats.monthlyRevenue.toFixed(2)} questo mese
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Sezioni di riepilogo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
                    onClick={() => navigate('/admin/orders')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Stato Ordini
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">In corso</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${dashboardStats.totalOrders > 0 ? (dashboardStats.pendingOrders / dashboardStats.totalOrders) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.pendingOrders}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completati</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${dashboardStats.totalOrders > 0 ? (dashboardStats.completedOrders / dashboardStats.totalOrders) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.completedOrders}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
                    onClick={() => navigate('/admin/orders?tab=quotes')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Stato Preventivi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">In attesa</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${dashboardStats.totalQuotes > 0 ? (dashboardStats.pendingQuotes / dashboardStats.totalQuotes) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.pendingQuotes}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Approvati</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${dashboardStats.totalQuotes > 0 ? (dashboardStats.approvedQuotes / dashboardStats.totalQuotes) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.approvedQuotes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Azioni rapide */}
                <Card>
                  <CardHeader>
                    <CardTitle>Azioni Rapide</CardTitle>
                    <CardDescription>
                      Accesso rapido alle funzioni principali
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("projects")}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <Package className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Gestisci Ordini</div>
                          <div className="text-xs text-muted-foreground">Visualizza e gestisci tutti gli ordini</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("messages")}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Messaggi</div>
                          <div className="text-xs text-muted-foreground">Gestisci la comunicazione con i clienti</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={fetchDashboardStats}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <BarChart3 className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Aggiorna Dati</div>
                          <div className="text-xs text-muted-foreground">Ricarica le statistiche</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          {/* Contenuto per la scheda Ordini */}
          <AdminProjectsManager />
        </TabsContent>
        
        <TabsContent value="messages">
          {/* Contenuto per la scheda Messaggi */}
          <div className="h-[70vh]">
            <AdminMessagesContainer />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog per modificare i dati utente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica dati utente</DialogTitle>
            <DialogDescription>
              Modifica le informazioni dell'utente.
            </DialogDescription>
          </DialogHeader>
          
          {editUserData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="edit-is-company"
                    checked={!!editUserData.isAzienda}
                    onCheckedChange={(checked) => setEditUserData({...editUserData, isAzienda: checked})}
                  />
                  <Label htmlFor="edit-is-company">Azienda</Label>
                </div>
              </div>
              
              {editUserData.isAzienda ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-azienda">Nome Azienda</Label>
                  <Input 
                    id="edit-azienda" 
                    value={editUserData.azienda || ''} 
                    onChange={(e) => setEditUserData({...editUserData, azienda: e.target.value})}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome</Label>
                    <Input 
                      id="edit-nome" 
                      value={editUserData.nome} 
                      onChange={(e) => setEditUserData({...editUserData, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cognome">Cognome</Label>
                    <Input 
                      id="edit-cognome" 
                      value={editUserData.cognome} 
                      onChange={(e) => setEditUserData({...editUserData, cognome: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  value={editUserData.email} 
                  disabled
                />
                <p className="text-xs text-gray-500">
                  L'email non può essere modificata da questa interfaccia.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Telefono</Label>
                <Input 
                  id="edit-telefono" 
                  value={editUserData.telefono} 
                  onChange={(e) => setEditUserData({...editUserData, telefono: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-indirizzo">Indirizzo</Label>
                <Input 
                  id="edit-indirizzo" 
                  value={editUserData.indirizzo} 
                  onChange={(e) => setEditUserData({...editUserData, indirizzo: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-citta">Città</Label>
                  <Input 
                    id="edit-citta" 
                    value={editUserData.citta} 
                    onChange={(e) => setEditUserData({...editUserData, citta: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cap">CAP</Label>
                  <Input 
                    id="edit-cap" 
                    value={editUserData.cap} 
                    onChange={(e) => setEditUserData({...editUserData, cap: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-note">Note</Label>
                <Textarea 
                  id="edit-note" 
                  value={editUserData.note || ''} 
                  onChange={(e) => setEditUserData({...editUserData, note: e.target.value})}
                  placeholder="Note aggiuntive sul cliente"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={saveUserChanges}>
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per aggiungere un nuovo cliente */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
            <DialogDescription>
              Inserisci i dati del nuovo cliente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="new-is-company"
                  checked={!!newClient.isAzienda}
                  onCheckedChange={(checked) => setNewClient({...newClient, isAzienda: checked})}
                />
                <Label htmlFor="new-is-company">Azienda</Label>
              </div>
            </div>
            
            {newClient.isAzienda ? (
              <div className="space-y-2">
                <Label htmlFor="new-azienda">Nome Azienda *</Label>
                <Input 
                  id="new-azienda" 
                  value={newClient.azienda || ''} 
                  onChange={(e) => setNewClient({...newClient, azienda: e.target.value})}
                  placeholder="Nome dell'azienda"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-nome">Nome *</Label>
                  <Input 
                    id="new-nome" 
                    value={newClient.nome || ''} 
                    onChange={(e) => setNewClient({...newClient, nome: e.target.value})}
                    placeholder="Nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cognome">Cognome *</Label>
                  <Input 
                    id="new-cognome" 
                    value={newClient.cognome || ''} 
                    onChange={(e) => setNewClient({...newClient, cognome: e.target.value})}
                    placeholder="Cognome"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input 
                id="new-email" 
                value={newClient.email || ''} 
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="email@esempio.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-telefono">Telefono</Label>
              <Input 
                id="new-telefono" 
                value={newClient.telefono || ''} 
                onChange={(e) => setNewClient({...newClient, telefono: e.target.value})}
                placeholder="Numero di telefono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-indirizzo">Indirizzo</Label>
              <Input 
                id="new-indirizzo" 
                value={newClient.indirizzo || ''} 
                onChange={(e) => setNewClient({...newClient, indirizzo: e.target.value})}
                placeholder="Via e numero civico"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-citta">Città</Label>
                <Input 
                  id="new-citta" 
                  value={newClient.citta || ''} 
                  onChange={(e) => setNewClient({...newClient, citta: e.target.value})}
                  placeholder="Città"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cap">CAP</Label>
                <Input 
                  id="new-cap" 
                  value={newClient.cap || ''} 
                  onChange={(e) => setNewClient({...newClient, cap: e.target.value})}
                  placeholder="Codice postale"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-note">Note</Label>
              <Textarea 
                id="new-note" 
                value={newClient.note || ''} 
                onChange={(e) => setNewClient({...newClient, note: e.target.value})}
                placeholder="Note aggiuntive sul cliente"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddClient}>
              Aggiungi Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel; 