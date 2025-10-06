import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { sendWelcomeEmail, sendAdminNotificationEmail } from '@/utils/emailService';

// Interfaccia per i dati dell'utente
export interface UserData {
  nome: string;
  cognome: string;
  telefono: string;
  indirizzo: string;
  citta: string;
  cap: string;
  email: string;
  createdAt?: Date;
  lastLogin?: Date;
  isAdmin?: boolean;
}

// Definisci il tipo per il contesto
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logInWithGoogle: () => Promise<UserCredential>;
  logOut: () => Promise<void>;
  fetchUserData: () => Promise<UserData | null>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  updateUserEmail: (email: string, password: string) => Promise<void>;
  updateUserPassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

// Crea il contesto
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizzato per utilizzare il contesto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}

// Provider del contesto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Funzione per recuperare i dati dell'utente
  async function fetchUserData(): Promise<UserData | null> {
    if (!currentUser) return null;
    
    console.log("Attempting to fetch user data for:", currentUser.uid);
    
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        
        // Converti i timestamp in Date se necessario
        if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
          data.createdAt = new Date((data.createdAt as any).seconds * 1000);
        }
        if (data.lastLogin && typeof data.lastLogin === 'object' && 'seconds' in data.lastLogin) {
          data.lastLogin = new Date((data.lastLogin as any).seconds * 1000);
        }
        
        // Controlla se l'utente è admin
        const admin = currentUser.email === 'info@3dmakes.ch';
        data.isAdmin = admin;
        setIsAdmin(admin);
        
        // Logica speciale per utenti admin
        if (admin) {
          console.log("Admin user detected, enabling special privileges");
          // Gli utenti admin hanno accesso completo
          // Se in futuro servisse, qui potremmo aggiungere logica speciale per admin
        }
        
        console.log("User data fetched successfully:", data);
        setUserData(data);
        return data;
      }
      console.log("User document does not exist for user:", currentUser.uid);
      return null;
    } catch (error) {
      console.error("Errore nel recupero dei dati utente:", error);
      return null;
    }
  }

  // Funzione per la registrazione che include la creazione del profilo
  async function signUp(email: string, password: string, userData: UserData) {
    // Prima creiamo l'account con Firebase Auth
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    
    // Controlla se l'utente è admin
    const admin = email === 'info@3dmakes.ch';
    
    // Poi salviamo i dati utente in Firestore
    await setDoc(doc(db, "users", credentials.user.uid), {
      nome: userData.nome,
      cognome: userData.cognome,
      telefono: userData.telefono,
      indirizzo: userData.indirizzo,
      citta: userData.citta,
      cap: userData.cap,
      email: userData.email,
      isAdmin: admin,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    });
    
    userData.isAdmin = admin;
    setIsAdmin(admin);
    setUserData(userData);
    
    // Invia email di benvenuto
    try {
      await sendWelcomeEmail({
        email: userData.email,
        nome: userData.nome,
        cognome: userData.cognome
      });
      
      // Notifica admin del nuovo utente
      await sendAdminNotificationEmail({
        type: 'new_user',
        details: `Nuovo utente registrato: ${userData.nome} ${userData.cognome}`,
        userInfo: `Email: ${userData.email}, Telefono: ${userData.telefono}`
      });
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email di benvenuto:', emailError);
      // Non blocchiamo la registrazione se l'email fallisce
    }
    
    return credentials;
  }

  // Funzione per il login
  async function logIn(email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    
    // Aggiorna la data di ultimo accesso
    await updateDoc(doc(db, "users", credentials.user.uid), {
      lastLogin: Timestamp.now()
    });
    
    await fetchUserData();
    return credentials;
  }

  // Funzione per il login con Google
  async function logInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return handleOAuthLogin(provider);
  }

  // Funzione generica per gestire i login OAuth
  async function handleOAuthLogin(provider: GoogleAuthProvider) {
    const credentials = await signInWithPopup(auth, provider);
    
    // Verifica se è la prima volta o aggiorna il lastLogin
    const userDoc = await getDoc(doc(db, "users", credentials.user.uid));
    
    if (userDoc.exists()) {
      // Utente esistente, aggiorna solo lastLogin
      await updateDoc(doc(db, "users", credentials.user.uid), {
        lastLogin: Timestamp.now()
      });
    } else {
      // Nuovo utente, crea documento in Firestore
      const email = credentials.user.email || '';
      const displayName = credentials.user.displayName || '';
      let firstName = displayName;
      let lastName = '';
      
      // Split del nome se possibile
      if (displayName.includes(' ')) {
        const parts = displayName.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }
      
      // Controlla se l'utente è admin
      const admin = email === 'info@3dmakes.ch';
      
      await setDoc(doc(db, "users", credentials.user.uid), {
        nome: firstName,
        cognome: lastName,
        email: email,
        telefono: '',
        indirizzo: '',
        citta: '',
        cap: '',
        isAdmin: admin,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });

      // Invia email di benvenuto per nuovo utente Google
      try {
        await sendWelcomeEmail({
          email: email,
          nome: firstName,
          cognome: lastName
        });
        
        // Notifica admin del nuovo utente
        await sendAdminNotificationEmail({
          type: 'new_user',
          details: `Nuovo utente registrato con Google: ${firstName} ${lastName}`,
          userInfo: `Email: ${email}`
        });
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email di benvenuto Google:', emailError);
        // Non blocchiamo la registrazione se l'email fallisce
      }
    }
    
    await fetchUserData();
    return credentials;
  }

  // Funzione per il logout
  async function logOut() {
    setUserData(null);
    setIsAdmin(false);
    return signOut(auth);
  }

  // Funzione per aggiornare il profilo dell'utente
  async function updateUserProfile(data: Partial<UserData>) {
    if (!currentUser) throw new Error("Nessun utente autenticato");
    
    // Aggiorna i dati in Firestore
    await updateDoc(doc(db, "users", currentUser.uid), data);
    
    // Aggiorna lo stato locale - corretto per preservare correttamente i dati esistenti
    setUserData(prev => {
      if (!prev) return null;
      // Crea una copia profonda dell'oggetto
      const updatedData = { ...prev, ...data };
      return updatedData;
    });
    
    // Aggiorna anche isAdmin se necessario
    if (data.email === 'info@3dmakes.ch') {
      setIsAdmin(true);
    } else if (data.email) {
      setIsAdmin(false);
    }
  }

  // Funzione per aggiornare l'email dell'utente
  async function updateUserEmail(email: string, password: string) {
    if (!currentUser) throw new Error("Nessun utente autenticato");
    
    // Riautentica l'utente
    const credential = EmailAuthProvider.credential(
      currentUser.email || '',
      password
    );
    await reauthenticateWithCredential(currentUser, credential);
    
    // Aggiorna l'email in Firebase Auth
    await updateEmail(currentUser, email);
    
    // Controlla se l'utente è admin
    const admin = email === 'info@3dmakes.ch';
    
    // Aggiorna l'email in Firestore
    await updateDoc(doc(db, "users", currentUser.uid), { 
      email,
      isAdmin: admin
    });
    
    // Aggiorna lo stato locale
    setUserData(prev => prev ? { ...prev, email, isAdmin: admin } : null);
    setIsAdmin(admin);
  }

  // Funzione per aggiornare la password dell'utente
  async function updateUserPassword(oldPassword: string, newPassword: string) {
    if (!currentUser) throw new Error("Nessun utente autenticato");
    
    // Riautentica l'utente
    const credential = EmailAuthProvider.credential(
      currentUser.email || '',
      oldPassword
    );
    await reauthenticateWithCredential(currentUser, credential);
    
    // Aggiorna la password
    await updatePassword(currentUser, newPassword);
  }

  // Effetto per monitorare i cambiamenti nello stato di autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        console.log("Auth state changed: User is logged in", user.uid);
        await fetchUserData();
      } else {
        console.log("Auth state changed: No user logged in");
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  // Effetto aggiuntivo per assicurarsi che userData sia aggiornato quando currentUser cambia
  useEffect(() => {
    if (currentUser && !userData) {
      console.log("Current user exists but no user data, fetching data...");
      fetchUserData();
    }
  }, [currentUser, userData]);

  // Valori forniti dal contesto
  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    signUp,
    logIn,
    logInWithGoogle,
    logOut,
    fetchUserData,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 