import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ottieni tutti gli utenti
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      // Includi solo le informazioni essenziali
      users.push({
        id: doc.id,
        displayName: userData.displayName || null,
        email: userData.email
      });
    });
    
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 