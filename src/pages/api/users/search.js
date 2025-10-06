import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  try {
    // Cerca l'utente tramite email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prendi il primo utente trovato
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Restituisci solo le informazioni essenziali
    return res.status(200).json({
      user: {
        id: userDoc.id,
        displayName: userData.displayName || null,
        email: userData.email
      }
    });
  } catch (error) {
    console.error('Error searching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 