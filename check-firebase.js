import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA36G825R6uYJ1RxAF6NUfPRUkbSYCSCwc",
  authDomain: "dmakesnew.firebaseapp.com",
  projectId: "dmakesnew",
  storageBucket: "dmakesnew.appspot.com", // Valore da verificare
  messagingSenderId: "756891766850",
  appId: "1:756891766850:web:ae0c2367babe9d435d5ddb",
  measurementId: "G-DKHFWX2E1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("Firebase inizializzato con successo con la seguente configurazione:");
console.log(JSON.stringify(firebaseConfig, null, 2)); 