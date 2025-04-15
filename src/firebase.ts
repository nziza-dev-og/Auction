import  { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl4bl9C5Y7oEGr5o8U32XAiH_BLU4yTXk",
  authDomain: "holder-73156.firebaseapp.com",
  projectId: "holder-73156",
  storageBucket: "holder-73156.firebasestorage.app",
  messagingSenderId: "531032272720",
  appId: "1:531032272720:web:1243d48dc92c3fb33b4655",
  measurementId: "G-7EZ0NS9RQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set up Firebase persisting data
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence when possible
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Persistence enabled successfully');
    })
    .catch((err) => {
      console.warn('Failed to enable persistence:', err);
    });
} catch (err) {
  console.error('Error enabling persistence:', err);
}

export default app;
 