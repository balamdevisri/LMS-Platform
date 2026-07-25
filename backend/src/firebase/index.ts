import * as admin from 'firebase-admin';
import { env } from '../config/env';

if (!admin.apps.length) {
  const isValidPrivateKey = Boolean(
    env.FIREBASE_PRIVATE_KEY &&
    (env.FIREBASE_PRIVATE_KEY.includes('PRIVATE KEY') || env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN'))
  );

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && isValidPrivateKey) {
    try {
      const credential = admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      });
      admin.initializeApp({ credential });
    } catch (err: any) {
      console.warn('Firebase cert initialization warning:', err?.message || err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: env.FIREBASE_PROJECT_ID || 'shaivika-lms-dev',
      });
    } catch (e: any) {
      console.warn('Firebase application default initialization warning:', e?.message || e);
    }
  }
}

// Safe fallback when Firebase Admin cert is not configured in local dev/test environment
const createDbMock = (): admin.firestore.Firestore => {
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === 'collection') {
        return (collectionName: string) => {
          return new Proxy({} as any, {
            get(colTarget, colProp) {
              return () => {
                throw new Error(
                  `Firestore operation '${String(colProp)}' failed: Firebase/Firestore has not been initialized. Please configure your service account credentials in the .env file.`
                );
              };
            }
          });
        };
      }
      return undefined;
    }
  });
};

export const db = admin.apps.length ? admin.firestore() : (createDbMock() as admin.firestore.Firestore);
export const adminAuth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
export const storage = admin.apps.length ? admin.storage() : ({} as admin.storage.Storage);