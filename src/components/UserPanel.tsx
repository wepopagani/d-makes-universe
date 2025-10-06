import React, { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { User, Edit, Check, X, Mail, Lock } from 'lucide-react';
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Definisco un tipo per i dati del profilo
interface ProfileData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  indirizzo: string;
  citta: string;
  cap: string;
}

const UserPanel = () => {
  const { currentUser, updateUserProfile, updateUserEmail } = useAuth();
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stati per la gestione del profilo
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableFields, setEditableFields] = useState({
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Stati per la gestione del cambio email
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: '',
    password: ''
  });
  const [isChangingEmailLoading, setIsChangingEmailLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user profile
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data() as ProfileData;
          setUserData(data);
          
          // Inizializza i campi modificabili
          setEditableFields({
            telefono: data.telefono || '',
            indirizzo: data.indirizzo || '',
            citta: data.citta || '',
            cap: data.cap || ''
          });
        } else {
          // Se il documento non esiste, crea un profilo vuoto
          setUserData({
            nome: currentUser.displayName?.split(' ')[0] || '',
            cognome: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: currentUser.email || '',
            telefono: '',
            indirizzo: '',
            citta: '',
            cap: ''
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Errore",
          description: "Impossibile recuperare i dati del profilo",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, toast]);
  
  // Funzione per salvare le modifiche al profilo
  const handleSaveProfile = async () => {
    if (!currentUser || !userData) return;
    
    setIsSavingProfile(true);
    
    try {
      // Prepara l'oggetto con i dati da aggiornare
      const updatedData = {
        telefono: editableFields.telefono,
        indirizzo: editableFields.indirizzo,
        citta: editableFields.citta,
        cap: editableFields.cap
      };
      
      // Aggiorna il profilo con i campi modificabili
      await updateUserProfile(updatedData);
      
      // Aggiorna lo stato locale manualmente per sicurezza
      setUserData(prevUserData => {
        if (!prevUserData) return null;
        return {
          ...prevUserData,
          ...updatedData
        };
      });
      
      setIsEditingProfile(false);
      
      toast({
        title: "Profilo aggiornato",
        description: "I tuoi dati sono stati aggiornati con successo",
      });
    } catch (error: any) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // Funzione per cambiare email
  const handleChangeEmail = async () => {
    if (!currentUser || !emailChangeData.newEmail || !emailChangeData.password) return;
    
    setIsChangingEmailLoading(true);
    
    try {
      await updateUserEmail(emailChangeData.newEmail, emailChangeData.password);
      
      setIsChangingEmail(false);
      setEmailChangeData({ newEmail: '', password: '' });
      
      toast({
        title: "Email aggiornata",
        description: "La tua email è stata cambiata con successo. Potresti dover effettuare nuovamente l'accesso.",
      });
    } catch (error: any) {
      console.error("Errore nel cambio email:", error);
      
      let errorMessage = "Si è verificato un errore durante il cambio email";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Password non corretta";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Questa email è già in uso";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Formato email non valido";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Per sicurezza, devi effettuare nuovamente l'accesso prima di cambiare email";
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingEmailLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex space-x-4 mt-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="p-4 mb-4 bg-red-50 text-red-700 rounded border border-red-200">
        <p className="font-medium">Non sei autenticato</p>
        <p className="text-sm">Esegui il login per visualizzare quest'area</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Profilo utente */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Profilo Utente</CardTitle>
              <CardDescription>Informazioni personali</CardDescription>
            </div>
            {!isEditingProfile ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salva
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {userData && (
            <div>
              {isEditingProfile ? (
                // Form di modifica
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input 
                        id="nome" 
                        value={userData.nome} 
                        disabled
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="cognome">Cognome</Label>
                      <Input 
                        id="cognome" 
                        value={userData.cognome} 
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={userData.email} 
                        disabled
                        readOnly
                      />
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingEmail(true)}
                      className="mt-6"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Cambia Email
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input 
                      id="telefono" 
                      value={editableFields.telefono}
                      onChange={(e) => setEditableFields({...editableFields, telefono: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="indirizzo">Indirizzo</Label>
                    <Input 
                      id="indirizzo" 
                      value={editableFields.indirizzo}
                      onChange={(e) => setEditableFields({...editableFields, indirizzo: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="citta">Città</Label>
                      <Input 
                        id="citta" 
                        value={editableFields.citta}
                        onChange={(e) => setEditableFields({...editableFields, citta: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cap">CAP</Label>
                      <Input 
                        id="cap" 
                        value={editableFields.cap}
                        onChange={(e) => setEditableFields({...editableFields, cap: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Vista normale
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome</Label>
                      <p className="text-lg">{userData.nome || 'Non specificato'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cognome</Label>
                      <p className="text-lg">{userData.cognome || 'Non specificato'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-lg">{userData.email}</p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingEmail(true)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Cambia Email
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 font-medium">Telefono:</dt>
                      <dd className="font-medium">{userData.telefono || 'Non specificato'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 font-medium">Indirizzo:</dt>
                      <dd className="font-medium">{userData.indirizzo || 'Non specificato'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 font-medium">Città:</dt>
                      <dd className="font-medium">{userData.citta || 'Non specificata'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 font-medium">CAP:</dt>
                      <dd className="font-medium">{userData.cap || 'Non specificato'}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog per cambio email */}
      <Dialog open={isChangingEmail} onOpenChange={setIsChangingEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-brand-accent" />
              Cambia Email
            </DialogTitle>
            <DialogDescription>
              Inserisci la tua nuova email e la password attuale per confermare il cambio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmail">Nuova Email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="nuova-email@esempio.com"
                value={emailChangeData.newEmail}
                onChange={(e) => setEmailChangeData({
                  ...emailChangeData,
                  newEmail: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="currentPassword">Password Attuale</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Inserisci la tua password"
                value={emailChangeData.password}
                onChange={(e) => setEmailChangeData({
                  ...emailChangeData,
                  password: e.target.value
                })}
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsChangingEmail(false);
                setEmailChangeData({ newEmail: '', password: '' });
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={handleChangeEmail}
              disabled={isChangingEmailLoading || !emailChangeData.newEmail || !emailChangeData.password}
              className="bg-brand-accent hover:bg-brand-accent/90"
            >
              {isChangingEmailLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Conferma Cambio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPanel;