import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { env } from '../config/env';

/**
 * Robust PEM private key sanitizer
 */
const sanitizePrivateKey = (keyStr?: string): string | undefined => {
  if (!keyStr) return undefined;
  let str = keyStr.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.substring(1, str.length - 1);
  }
  str = str.split('\\n').join('\n');

  const beginTag = '-----BEGIN PRIVATE KEY-----';
  const endTag = '-----END PRIVATE KEY-----';

  if (str.includes(beginTag) && str.includes(endTag)) {
    const body = str
      .substring(str.indexOf(beginTag) + beginTag.length, str.indexOf(endTag))
      .replace(/\s+/g, '');
    const lines = body.match(/.{1,64}/g) || [];
    return `${beginTag}\n${lines.join('\n')}\n${endTag}\n`;
  }
  return str;
};
export let hasValidCredentials = false;

if (!getApps().length) {
  const cleanPrivateKey = sanitizePrivateKey(env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY);
  const isValidPrivateKey = Boolean(
    cleanPrivateKey &&
    (cleanPrivateKey.includes('PRIVATE KEY') || cleanPrivateKey.includes('-----BEGIN'))
  );

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && isValidPrivateKey) {
    try {
      const credential = cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: cleanPrivateKey,
      });
      initializeApp({ credential });
      hasValidCredentials = true;
      console.log('🎉 Firebase Admin SDK initialized successfully!');
    } catch (err: any) {
      console.warn('⚠️ Firebase Admin Cert Initialization Notice:', err?.message || err);
    }
  } else {
    try {
      initializeApp({
        projectId: env.FIREBASE_PROJECT_ID || 'shaivika-lms-ai',
      });
      console.log('🎉 Firebase Admin SDK initialized with project ID default (shaivika-lms-ai)!');
    } catch (e: any) {
      console.warn('⚠️ Firebase Admin Default Initialization Notice:', e?.message || e);
    }
  }
}

/**
 * Non-blocking Mock Firestore DB proxy for dev environments
 * NEVER throws an exception so signup flow is NEVER interrupted.
 */
const createDbMock = (): Firestore => {
  const createChainableMock = (): any => {
    return new Proxy(() => {}, {
      get(_target, _prop) {
        if (_prop === 'then') return (resolve: any) => resolve({ id: 'mock_doc_id', exists: false, docs: [], empty: true });
        return createChainableMock();
      },
      apply() {
        return createChainableMock();
      },
    });
  };

  return new Proxy({} as any, {
    get(_target, prop) {
      if (prop === 'collection' || prop === 'doc') {
        return () => createChainableMock();
      }
      return createChainableMock();
    },
  });
};

export const isFirebaseAdminInitialized = (): boolean => getApps().length > 0 && hasValidCredentials;
export const db = isFirebaseAdminInitialized() ? getFirestore() : (createDbMock() as Firestore);
export const adminAuth = isFirebaseAdminInitialized() ? getAuth() : ({} as Auth);
export const storage = isFirebaseAdminInitialized() ? getStorage() : ({} as Storage);