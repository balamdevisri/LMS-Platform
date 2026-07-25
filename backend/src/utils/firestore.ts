import * as admin from 'firebase-admin';
import { ApiError } from './ApiError';
import logger from '../config/logger';

/**
 * Converts a JavaScript Date to a Firestore Timestamp or ServerTimestamp.
 */
export const toFirestoreDateTime = (date?: Date): any => {
  if (!date) {
    return admin.firestore.FieldValue.serverTimestamp();
  }
  return admin.firestore.Timestamp.fromDate(date);
};

/**
 * Converts a Firestore Timestamp to a standard JavaScript Date.
 */
export const fromFirestoreDateTime = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp._seconds !== undefined) {
    return new admin.firestore.Timestamp(timestamp._seconds, timestamp._nanoseconds || 0).toDate();
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * Translates a typescript object to a document structure safe for saving in Firestore.
 * Removes 'id' and converts native Date objects to Firestore Timestamps.
 */
export const toDocument = <T extends Record<string, any>>(data: T): Record<string, any> => {
  if (!data) return {};
  const doc: Record<string, any> = { ...data };

  if ('id' in doc) {
    delete doc.id;
  }

  // Translate status from frontend ('Published'/'Draft') to database format ('published'/'draft')
  if ('status' in doc && typeof doc.status === 'string') {
    if (doc.status === 'Published') doc.status = 'published';
    else if (doc.status === 'Draft') doc.status = 'draft';
  }

  for (const key of Object.keys(doc)) {
    const val = doc[key];
    if (val instanceof Date) {
      doc[key] = toFirestoreDateTime(val);
    } else if (val === undefined) {
      // Remove undefined values since Firestore rejects them
      delete doc[key];
    } else if (val !== null && typeof val === 'object') {
      // Handle nested objects recursively (e.g. instructor)
      if (!(val instanceof admin.firestore.FieldValue)) {
        doc[key] = toDocument(val);
      }
    }
  }

  return doc;
};

/**
 * Maps a Firestore document snapshot to a clean typed object.
 * Extracts the document ID and converts Timestamps back to JavaScript Dates.
 */
export const fromDocument = <T>(doc: any): T => {
  if (!doc.exists) {
    throw new ApiError(404, 'Document not found');
  }
  const data = doc.data();
  const id = doc.id;

  const converted: Record<string, any> = { ...data, id };

  // Translate status from database format ('published'/'draft') to frontend ('Published'/'Draft')
  if ('status' in converted && typeof converted.status === 'string') {
    if (converted.status === 'published') converted.status = 'Published';
    else if (converted.status === 'draft') converted.status = 'Draft';
  }

  const convertTimestamps = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && (typeof val.toDate === 'function' || val._seconds !== undefined)) {
        obj[key] = fromFirestoreDateTime(val);
      } else if (val && typeof val === 'object' && !(val instanceof Date)) {
        obj[key] = convertTimestamps(val);
      }
    }
    return obj;
  };

  return convertTimestamps(converted) as T;
};

/**
 * Wraps Firestore database operations to throw normalized ApiError.
 */
export const handleFirestoreError = (error: any, context: string): never => {
  logger.error(`Firestore error during ${context}: ${error?.message || error}`);
  
  if (error instanceof ApiError) {
    throw error;
  }
  
  throw new ApiError(
    500,
    `Database operation failed during ${context}. Please try again later.`
  );
};
