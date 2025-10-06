import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA36G825R6uYJ1RxAF6NUfPRUkbSYCSCwc",
  authDomain: "dmakesnew.firebaseapp.com",
  projectId: "dmakesnew",
  storageBucket: "dmakesnew.appspot.com",
  messagingSenderId: "756891766850",
  appId: "1:756891766850:web:ae0c2367babe9d435d5ddb",
  measurementId: "G-DKHFWX2E1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Tentativo di autenticazione anonima...");

signInAnonymously(auth)
  .then(() => {
    console.log("Autenticazione anonima riuscita!");
  })
  .catch((error) => {
    console.error("Errore di autenticazione:", error.code, error.message);
  }); 