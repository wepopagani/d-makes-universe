/**
 * Script per aggiornare i progetti esistenti con il campo paymentStatus
 * 
 * Per eseguire:
 * 1. Avvia il server di sviluppo: npm run dev
 * 2. Apri la console del browser e incolla questo codice
 */

import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

async function updateProjectsWithPaymentStatus() {
  try {
    console.log('🔄 Iniziando aggiornamento progetti...');
    
    // Ottieni tutti i progetti
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    
    let updatedCount = 0;
    let alreadyUpdatedCount = 0;
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      
      // Verifica se il progetto ha già il campo paymentStatus
      if (!projectData.paymentStatus) {
        // Aggiorna il progetto con il campo paymentStatus predefinito
        await updateDoc(doc(db, 'projects', projectDoc.id), {
          paymentStatus: 'da_pagare',
          updatedAt: Timestamp.now()
        });
        
        updatedCount++;
        console.log(`✅ Aggiornato progetto: ${projectDoc.id} - ${projectData.name}`);
      } else {
        alreadyUpdatedCount++;
      }
    }
    
    console.log(`🎉 Aggiornamento completato!`);
    console.log(`📊 Progetti aggiornati: ${updatedCount}`);
    console.log(`📊 Progetti già aggiornati: ${alreadyUpdatedCount}`);
    console.log(`📊 Totale progetti: ${projectsSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento dei progetti:', error);
  }
}

// Esporta la funzione per poterla utilizzare nella console del browser
export default updateProjectsWithPaymentStatus; 