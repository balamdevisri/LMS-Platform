import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY) || 'AIzaSyCKPJ4klGTGxdgTxC3Q93YiaTZixlI0vE0',
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || 'shaivika-lms-ai.firebaseapp.com',
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || 'shaivika-lms-ai',
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || 'shaivika-lms-ai.firebasestorage.app',
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || '977716272905',
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || '1:977716272905:web:de0781e0988aecfc823dd8',
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || 'G-621GCQ0W26',
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

    if (typeof window !== 'undefined' && firebaseConfig.measurementId && import.meta.env.PROD) {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            try {
              analytics = getAnalytics(app);
            } catch {
              analytics = null;
            }
          }
        })
        .catch(() => {
          analytics = null;
        });
    }
  }
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}

export { app, auth, db, analytics, firebaseConfig };
export default app;
