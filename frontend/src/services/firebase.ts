import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? (process.env as any) : {});

const rawAppId = cleanEnv(env.VITE_FIREBASE_APP_ID) || '1:977716272905:web:de0781e0988aecfc823dd8';
const safeAppId = rawAppId.startsWith('1:') ? rawAppId : `1:${rawAppId}`;

const rawAuthDomain = cleanEnv(env.VITE_FIREBASE_AUTH_DOMAIN);
const safeAuthDomain = (!rawAuthDomain || rawAuthDomain.includes('auth.kaizenq.in'))
  ? 'shaivika-lms-ai.firebaseapp.com'
  : rawAuthDomain;

const firebaseConfig = {
  apiKey:
    cleanEnv(env.VITE_FIREBASE_API_KEY) ||
    'AIzaSyCKPJ4klGTGxdgTxC3Q93YiaTZixlI0vE0',

  authDomain: safeAuthDomain,

  projectId:
    cleanEnv(env.VITE_FIREBASE_PROJECT_ID) ||
    'shaivika-lms-ai',

  storageBucket:
    cleanEnv(env.VITE_FIREBASE_STORAGE_BUCKET) ||
    'shaivika-lms-ai.firebasestorage.app',

  messagingSenderId:
    cleanEnv(env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    '977716272905',

  appId: safeAppId,
  measurementId: cleanEnv(env.VITE_FIREBASE_MEASUREMENT_ID) || 'G-621GCQ0W26',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app =
    getApps().find((firebaseApp) => firebaseApp.name === '[DEFAULT]') ??
    initializeApp(firebaseConfig);

  auth = getAuth(app);
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    db = getFirestore(app);
  }
  storage = getStorage(app);

  if (typeof window !== 'undefined') {
    console.log('[KAIZENQ BUILD AUDIT]', {
      environment: import.meta.env.MODE,
      buildVersion: 'firebase-cleanup-v3',
      firebaseProject: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      appId: firebaseConfig.appId,
    });
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export {
  app,
  auth,
  db,
  storage,
  firebaseConfig,
};

export default app;