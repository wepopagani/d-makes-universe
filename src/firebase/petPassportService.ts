import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export interface PetPassport {
  id?: string;
  passportNumber: string;
  animalName: string;
  breed: string;
  ownerName: string;
  phone: string;
  address: string;
  vcardFilename?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const COLLECTION_NAME = 'petPassports';

// Genera un numero di passaporto univoco (6 cifre)
export const generatePassportNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verifica se un numero di passaporto esiste già
export const checkPassportNumberExists = async (passportNumber: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('passportNumber', '==', passportNumber)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Errore nel controllo numero passaporto:', error);
    throw error;
  }
};

// Genera un numero di passaporto univoco garantito
export const generateUniquePassportNumber = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const number = generatePassportNumber();
    const exists = await checkPassportNumberExists(number);
    
    if (!exists) {
      return number;
    }
    
    attempts++;
  }
  
  throw new Error('Impossibile generare un numero di passaporto univoco');
};

// Crea un nuovo passaporto
export const createPetPassport = async (passportData: Omit<PetPassport, 'id' | 'passportNumber' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const passportNumber = await generateUniquePassportNumber();
    const now = new Date();
    
    const newPassport: Omit<PetPassport, 'id'> = {
      ...passportData,
      passportNumber,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      vcardFilename: passportData.vcardFilename || `${passportData.animalName.toLowerCase().replace(/\s+/g, '_')}_contatto.vcf`
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...newPassport,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    console.log('Passaporto creato con ID:', docRef.id);
    return passportNumber;
  } catch (error) {
    console.error('Errore nella creazione del passaporto:', error);
    throw error;
  }
};

// Ottieni un passaporto per numero
export const getPetPassportByNumber = async (passportNumber: string): Promise<PetPassport | null> => {
  try {
    console.log('🔍 getPetPassportByNumber called with:', passportNumber);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('passportNumber', '==', passportNumber),
      where('isActive', '==', true)
    );
    
    console.log('📡 Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Query results:', {
      empty: querySnapshot.empty,
      size: querySnapshot.size,
      docs: querySnapshot.docs.length
    });
    
    if (querySnapshot.empty) {
      console.log('❌ No documents found for passport number:', passportNumber);
      
      // Prova senza il filtro isActive per debug
      console.log('🔍 Trying query without isActive filter...');
      const qDebug = query(
        collection(db, COLLECTION_NAME),
        where('passportNumber', '==', passportNumber)
      );
      const debugSnapshot = await getDocs(qDebug);
      
      console.log('🐛 Debug query results:', {
        empty: debugSnapshot.empty,
        size: debugSnapshot.size,
        docs: debugSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    console.log('✅ Found passport:', {
      id: doc.id,
      animalName: data.animalName,
      isActive: data.isActive
    });
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as PetPassport;
  } catch (error) {
    console.error('💥 Errore nel recupero del passaporto:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Ottieni un passaporto per ID documento
export const getPetPassportById = async (id: string): Promise<PetPassport | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as PetPassport;
  } catch (error) {
    console.error('Errore nel recupero del passaporto:', error);
    throw error;
  }
};

// Ottieni tutti i passaporti (per admin)
export const getAllPetPassports = async (): Promise<PetPassport[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PetPassport;
    });
  } catch (error) {
    console.error('Errore nel recupero dei passaporti:', error);
    throw error;
  }
};

// Aggiorna un passaporto
export const updatePetPassport = async (id: string, updates: Partial<Omit<PetPassport, 'id' | 'passportNumber' | 'createdAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
    
    console.log('Passaporto aggiornato:', id);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del passaporto:', error);
    throw error;
  }
};

// Disattiva un passaporto (soft delete)
export const deactivatePetPassport = async (id: string): Promise<void> => {
  try {
    await updatePetPassport(id, { isActive: false });
    console.log('Passaporto disattivato:', id);
  } catch (error) {
    console.error('Errore nella disattivazione del passaporto:', error);
    throw error;
  }
};

// Riattiva un passaporto
export const reactivatePetPassport = async (id: string): Promise<void> => {
  try {
    await updatePetPassport(id, { isActive: true });
    console.log('Passaporto riattivato:', id);
  } catch (error) {
    console.error('Errore nella riattivazione del passaporto:', error);
    throw error;
  }
};

// Elimina definitivamente un passaporto (solo per admin)
export const deletePetPassport = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log('Passaporto eliminato definitivamente:', id);
  } catch (error) {
    console.error('Errore nell\'eliminazione del passaporto:', error);
    throw error;
  }
};

// Cerca passaporti per nome animale o proprietario
export const searchPetPassports = async (searchTerm: string): Promise<PetPassport[]> => {
  try {
    const allPassports = await getAllPetPassports();
    
    const filteredPassports = allPassports.filter(passport => 
      passport.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passport.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passport.passportNumber.includes(searchTerm)
    );
    
    return filteredPassports;
  } catch (error) {
    console.error('Errore nella ricerca dei passaporti:', error);
    throw error;
  }
}; 