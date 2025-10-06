import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { UserProfileData } from '@/types/user';
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from 'react-router-dom';

interface ExtendedUserData extends UserProfileData {
  id: string;
  createdAt?: Date;
  lastLogin?: Date;
  isAdmin?: boolean;
}

const AdminUsersList = () => {
  const [users, setUsers] = useState<ExtendedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<ExtendedUserData | null>(null);
  const [userToEdit, setUserToEdit] = useState<ExtendedUserData | null>(null);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Nuovo stato per il nuovo cliente
  const [newClient, setNewClient] = useState<Partial<UserProfileData>>({
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

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: ExtendedUserData[] = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data() as any;
        
        // Convert Firebase Timestamp to Date if necessary
        let createdAt = userData.createdAt;
        let lastLogin = userData.lastLogin;
        
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate();
        }
        
        if (lastLogin && typeof lastLogin.toDate === 'function') {
          lastLogin = lastLogin.toDate();
        }

        usersList.push({
          ...userData,
          id: doc.id,
          createdAt: createdAt,
          lastLogin: lastLogin,
          isAdmin: userData.isAdmin || false
        });
      });

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli utenti.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle admin status
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? {...user, isAdmin: !currentStatus} 
          : user
      ));
      
      toast({
        title: 'Stato modificato',
        description: `Lo stato di admin è stato ${!currentStatus ? 'attivato' : 'disattivato'}.`,
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato di admin.',
        variant: 'destructive',
      });
    }
  };

  // Function to format date to relative time
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(date, { addSuffix: true, locale: it });
  };

  // Function to delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast({
        title: 'Utente eliminato',
        description: `L'utente ${userToDelete.nome} ${userToDelete.cognome} è stato eliminato con successo.`,
      });
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'utente.',
        variant: 'destructive',
      });
    }
  };
  
  // Funzione per modificare i dati utente
  const handleEditUser = (user: ExtendedUserData) => {
    setUserToEdit({...user});
  };
  
  // Funzione per salvare le modifiche
  const saveUserChanges = async () => {
    if (!userToEdit) return;
    
    try {
      const dataToUpdate: any = {
        telefono: userToEdit.telefono,
        indirizzo: userToEdit.indirizzo,
        citta: userToEdit.citta,
        cap: userToEdit.cap,
        isAzienda: userToEdit.isAzienda || false,
        note: userToEdit.note || ''
      };
      
      // Se è un'azienda, salva il nome azienda, altrimenti nome e cognome
      if (userToEdit.isAzienda) {
        dataToUpdate.azienda = userToEdit.azienda;
        // Mantieni nome e cognome vuoti per le aziende
        dataToUpdate.nome = '';
        dataToUpdate.cognome = '';
      } else {
        dataToUpdate.nome = userToEdit.nome;
        dataToUpdate.cognome = userToEdit.cognome;
        // Svuota il campo azienda se l'utente è un privato
        dataToUpdate.azienda = '';
      }
      
      await updateDoc(doc(db, 'users', userToEdit.id), dataToUpdate);
      
      // Aggiorna la lista degli utenti
      setUsers(users.map(user => 
        user.id === userToEdit.id ? userToEdit : user
      ));
      
      setUserToEdit(null);
      
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
        createdAt: new Date(),
        isAdmin: false
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestione Utenti</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddClientDialogOpen(true)} variant="default">
            Aggiungi Cliente
          </Button>
          <Button onClick={fetchUsers} variant="outline">Aggiorna</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-lg text-gray-500">Nessun utente trovato.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Lista degli utenti registrati: {users.length} totali</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead>Indirizzo</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.isAzienda ? user.azienda : `${user.nome} ${user.cognome}`}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telefono || 'N/A'}</TableCell>
                      <TableCell>{user.citta && user.cap ? `${user.citta}, ${user.cap}` : (user.citta || 'N/A')}</TableCell>
                      <TableCell>{user.indirizzo || 'N/A'}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/user-files/${user.id}`)}
                            className="text-xs"
                          >
                            Vedi file
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Modifica
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setUserToDelete(user)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

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

      {/* Dialog per modificare i dati utente */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica dati utente</DialogTitle>
            <DialogDescription>
              Modifica le informazioni dell'utente.
            </DialogDescription>
          </DialogHeader>
          
          {userToEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="edit-is-company"
                    checked={!!userToEdit.isAzienda}
                    onCheckedChange={(checked) => setUserToEdit({...userToEdit, isAzienda: checked})}
                  />
                  <Label htmlFor="edit-is-company">Azienda</Label>
                </div>
              </div>
              
              {userToEdit.isAzienda ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-azienda">Nome Azienda</Label>
                  <Input 
                    id="edit-azienda" 
                    value={userToEdit.azienda || ''} 
                    onChange={(e) => setUserToEdit({...userToEdit, azienda: e.target.value})}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome</Label>
                    <Input 
                      id="edit-nome" 
                      value={userToEdit.nome} 
                      onChange={(e) => setUserToEdit({...userToEdit, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cognome">Cognome</Label>
                    <Input 
                      id="edit-cognome" 
                      value={userToEdit.cognome} 
                      onChange={(e) => setUserToEdit({...userToEdit, cognome: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  value={userToEdit.email} 
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
                  value={userToEdit.telefono} 
                  onChange={(e) => setUserToEdit({...userToEdit, telefono: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-indirizzo">Indirizzo</Label>
                <Input 
                  id="edit-indirizzo" 
                  value={userToEdit.indirizzo} 
                  onChange={(e) => setUserToEdit({...userToEdit, indirizzo: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-citta">Città</Label>
                  <Input 
                    id="edit-citta" 
                    value={userToEdit.citta} 
                    onChange={(e) => setUserToEdit({...userToEdit, citta: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cap">CAP</Label>
                  <Input 
                    id="edit-cap" 
                    value={userToEdit.cap} 
                    onChange={(e) => setUserToEdit({...userToEdit, cap: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-note">Note</Label>
                <Textarea 
                  id="edit-note" 
                  value={userToEdit.note || ''} 
                  onChange={(e) => setUserToEdit({...userToEdit, note: e.target.value})}
                  placeholder="Note aggiuntive sul cliente"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToEdit(null)}>
              Annulla
            </Button>
            <Button onClick={saveUserChanges}>
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogo di conferma eliminazione */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare l'utente {userToDelete?.nome} {userToDelete?.cognome}?
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUserToDelete(null)}
            >
              Annulla
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersList; 