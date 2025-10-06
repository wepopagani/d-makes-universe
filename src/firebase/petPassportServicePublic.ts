import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Configurazione Firebase per accesso pubblico
const firebaseConfig = {
  apiKey: "AIzaSyC6i0YOfn2YrasjYm13YrQmUr3c2RLtv0M",
  authDomain: "dmakes-a2c74.firebaseapp.com",
  projectId: "dmakes-a2c74",
  storageBucket: "dmakes-a2c74.firebasestorage.app",
  messagingSenderId: "148613353871",
  appId: "1:148613353871:web:a6d2344662873abcfabbfa",
  measurementId: "G-SGS82T97MV"
};

// Inizializza app separata per accesso pubblico
const publicApp = initializeApp(firebaseConfig, 'public');
const publicDb = getFirestore(publicApp);

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

// Ottieni un passaporto per numero (accesso pubblico)
export const getPetPassportByNumberPublic = async (passportNumber: string): Promise<PetPassport | null> => {
  try {
    console.log('🌐 getPetPassportByNumberPublic called with:', passportNumber);
    
    const q = query(
      collection(publicDb, COLLECTION_NAME),
      where('passportNumber', '==', passportNumber),
      where('isActive', '==', true)
    );
    
    console.log('📡 Executing public Firestore query...');
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Public query results:', {
      empty: querySnapshot.empty,
      size: querySnapshot.size,
      docs: querySnapshot.docs.length
    });
    
    if (querySnapshot.empty) {
      console.log('❌ No public documents found for passport number:', passportNumber);
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    console.log('✅ Found public passport:', {
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
    console.error('💥 Errore nel recupero pubblico del passaporto:', error);
    console.error('Public error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}; 