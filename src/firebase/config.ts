// Configurazione Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace these placeholder values with your actual Firebase project credentials
// You can find these in your Firebase console: https://console.firebase.google.com/
// Project settings > Your apps > Web app > Config
const firebaseConfig = {
  apiKey: "AIzaSyC6i0YOfn2YrasjYm13YrQmUr3c2RLtv0M",
  authDomain: "dmakes-a2c74.firebaseapp.com",
  projectId: "dmakes-a2c74",
  storageBucket: "dmakes-a2c74.firebasestorage.app",
  messagingSenderId: "148613353871",
  appId: "1:148613353871:web:a6d2344662873abcfabbfa",
  measurementId: "G-SGS82T97MV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized with project:", firebaseConfig.projectId);

// Initialize Firebase services with proper error handling
let auth, db, storage;

try {
  // Initialize auth
  auth = getAuth(app);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Storage with custom settings
  storage = getStorage(app);
  
  // Log auth state to confirm service initialization
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("Auth service detected signed-in user:", user.uid);
    } else {
      console.log("Auth service detected no user signed in");
    }
  });
} catch (error) {
  console.error("Error initializing Firebase services:", error);
  throw error;
}

// Utility function to get a custom download URL that works with CORS for STL files
export const getCustomDownloadURL = async (path: string) => {
  try {
    // Get normal download URL
    const normalURL = await import('firebase/storage').then(({ getDownloadURL, ref }) => {
      return getDownloadURL(ref(storage, path));
    });
    
    // Check if it's an STL file or other 3D model format
    if (path.toLowerCase().endsWith('.stl') || 
        path.toLowerCase().endsWith('.obj') || 
        path.toLowerCase().endsWith('.3mf') ||
        path.toLowerCase().endsWith('.step') ||
        path.toLowerCase().endsWith('.stp') ||
        path.toLowerCase().endsWith('.gltf') ||
        path.toLowerCase().endsWith('.glb')) {
      console.log("Using proxied URL for 3D model:", path);
      
      // Crea una URL pulita
      const baseUrl = normalURL.split('?')[0];
      
      // Aggiungi solo i parametri essenziali
      return `${baseUrl}?alt=media&_t=${Date.now()}`;
    }
    
    return normalURL;
  } catch (error) {
    console.error("Error getting download URL:", error);
    // Return a fallback direct URL if possible
    return `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(path)}?alt=media&_t=${Date.now()}`;
  }
};

// Export initialized services
export { auth, db, storage };
export default app; 