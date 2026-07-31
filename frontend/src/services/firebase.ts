import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCKPJ4klGTGxdgTxC3Q93YiaTZixlI0vE0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shaivika-lms-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shaivika-lms-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shaivika-lms-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '977716272905',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:977716272905:web:de0781e0988aecfc823dd8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-621GCQ0W26',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            try {
              analytics = getAnalytics(app);
            } catch (err) {
              console.warn('Firebase Analytics initialization notice:', err);
            }
          }
        })
        .catch((err) => {
          console.warn('Firebase Analytics isSupported check notice:', err);
        });
    }
  }
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}

export { app, auth, db, analytics, firebaseConfig };
export default app;
