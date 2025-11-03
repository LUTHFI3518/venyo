import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage is optional - will be null if Storage isn't enabled or available
export const storage = (() => {
  try {
    return getStorage(app);
  } catch (error) {
    console.warn('Firebase Storage not available (Storage may require Blaze plan):', error);
    return null;
  }
})();

export const googleProvider = new GoogleAuthProvider();

// Initialize messaging (only in browser)
export const getMessagingInstance = () => {
  if (typeof window !== 'undefined') {
    try {
      return getMessaging(app);
    } catch (error) {
      console.log('Messaging not initialized:', error);
      return null;
    }
  }
  return null;
};

export default app;
