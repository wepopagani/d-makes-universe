import { db } from '../firebase/config';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Funzione per creare dati di esempio nel database
export const seedDatabase = async () => {
  const auth = getAuth();
  const sampleUsers = [
    {
      email: 'cliente1@example.com',
      password: 'password123',
      userData: {
        nome: 'Mario',
        cognome: 'Rossi',
        telefono: '123456789',
        indirizzo: 'Via Roma 123',
        citta: 'Milano',
        cap: '20100',
        isAdmin: false
      }
    },
    {
      email: 'cliente2@example.com',
      password: 'password123',
      userData: {
        nome: 'Lucia',
        cognome: 'Bianchi',
        telefono: '987654321',
        indirizzo: 'Via Dante 45',
        citta: 'Roma',
        cap: '00100',
        isAdmin: false
      }
    }
  ];

  // Crea gli utenti di esempio
  for (const user of sampleUsers) {
    try {
      // Crea l'utente in auth
      const userCred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCred.user.uid;
      
      // Salva i dati dell'utente in Firestore
      await setDoc(doc(db, 'users', uid), {
        ...user.userData,
        email: user.email,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
      
      console.log(`Utente creato: ${user.email} con ID: ${uid}`);
      
      // Crea progetti di esempio per ogni utente
      await createSampleProjects(uid, user.userData.nome);
    } catch (error) {
      console.error(`Errore nella creazione dell'utente ${user.email}:`, error);
    }
  }
  
  console.log('Database popolato con successo!');
};

// Funzione per creare progetti di esempio
const createSampleProjects = async (userId: string, userName: string) => {
  const projects = [
    {
      name: `Progetto di stampa 3D - ${userName}`,
      description: 'Stampa di modelli 3D personalizzati',
      status: 'in_progress',
      paymentStatus: 'da_pagare',
      files: [],
      notes: 'Cliente richiede stampa ad alta risoluzione',
      productionProgress: 30,
      paymentProgress: 0
    },
    {
      name: `Creazione prototipo - ${userName}`,
      description: 'Prototipo per nuovo prodotto',
      status: 'planning',
      paymentStatus: 'pagato_carta',
      files: [],
      notes: 'Urgente - consegna entro due settimane',
      productionProgress: 0,
      paymentProgress: 100
    }
  ];
  
  for (const project of projects) {
    try {
      // Crea un ID per il progetto
      const projectRef = doc(collection(db, 'projects'));
      const projectId = projectRef.id;
      
      // Salva il progetto
      await setDoc(projectRef, {
        ...project,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`Progetto creato per l'utente ${userId}: ${project.name}`);
      
      // Crea ordini/preventivi di esempio per questo progetto
      await createSampleOrders(userId, projectId, project.name);
    } catch (error) {
      console.error(`Errore nella creazione del progetto per l'utente ${userId}:`, error);
    }
  }
};

// Funzione per creare ordini e preventivi di esempio
const createSampleOrders = async (userId: string, projectId: string, projectName: string) => {
  const orders = [
    {
      status: 'pending', // preventivo in attesa
      totalAmount: 150.00,
      paymentStatus: 'pending',
      productionStatus: 'non_iniziato',
      isOrder: false, // è un preventivo
      items: [
        {
          id: 'item-1',
          fileId: 'file-1',
          fileName: 'modello3d-1.stl',
          fileUrl: 'https://example.com/files/modello3d-1.stl',
          quantity: 1,
          material: 'PLA',
          color: 'Blu',
          resolution: '0.2mm',
          price: 80.00,
          notes: 'Stampa base',
          productionStatus: 'non_iniziato',
          paymentStatus: 'da_pagare'
        },
        {
          id: 'item-2',
          fileId: 'file-2',
          fileName: 'modello3d-2.stl',
          fileUrl: 'https://example.com/files/modello3d-2.stl',
          quantity: 2,
          material: 'PETG',
          color: 'Nero',
          resolution: '0.1mm',
          price: 35.00,
          notes: 'Stampa di alta qualità',
          productionStatus: 'non_iniziato',
          paymentStatus: 'da_pagare'
        }
      ],
      userEmail: 'cliente@example.com',
      notes: 'Preventivo in attesa di approvazione',
      shippingAddress: {
        nome: 'Mario',
        cognome: 'Rossi',
        indirizzo: 'Via Roma 123',
        citta: 'Milano',
        cap: '20100',
        telefono: '123456789'
      }
    },
    {
      status: 'approved', // ordine approvato
      totalAmount: 220.00,
      paymentStatus: 'da_pagare',
      productionStatus: 'in_corso',
      isOrder: true, // è un ordine
      items: [
        {
          id: 'item-3',
          fileId: 'file-3',
          fileName: 'modello3d-3.stl',
          fileUrl: 'https://example.com/files/modello3d-3.stl',
          quantity: 3,
          material: 'Resina Standard',
          color: 'Trasparente',
          resolution: '0.05mm (Resina)',
          price: 45.00,
          notes: 'Stampa in resina di alta qualità',
          productionStatus: 'completato',
          paymentStatus: 'pagato_carta'
        },
        {
          id: 'item-4',
          fileId: 'file-4',
          fileName: 'modello3d-4.stl',
          fileUrl: 'https://example.com/files/modello3d-4.stl',
          quantity: 1,
          material: 'ABS',
          color: 'Bianco',
          resolution: '0.2mm',
          price: 85.00,
          notes: 'Stampa resistente',
          productionStatus: 'in_corso',
          paymentStatus: 'da_pagare'
        }
      ],
      userEmail: 'cliente@example.com',
      notes: 'Ordine in lavorazione',
      projectName: projectName,
      projectId: projectId,
      shippingAddress: {
        nome: 'Mario',
        cognome: 'Rossi',
        indirizzo: 'Via Roma 123',
        citta: 'Milano',
        cap: '20100',
        telefono: '123456789'
      }
    }
  ];
  
  for (const order of orders) {
    try {
      // Crea un ID per l'ordine
      const orderRef = doc(collection(db, 'orders'));
      
      // Salva l'ordine
      await setDoc(orderRef, {
        ...order,
        userId,
        projectId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`Ordine creato per il progetto ${projectId}`);
    } catch (error) {
      console.error(`Errore nella creazione dell'ordine per il progetto ${projectId}:`, error);
    }
  }
};

// Esporta la funzione principale
export default seedDatabase; 