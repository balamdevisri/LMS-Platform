/**
 * Centralized Firestore Payload Serializer & Sanitizer
 *
 * Ensures all data written to Firestore via setDoc(), updateDoc(), or addDoc()
 * is strictly compliant with Firestore data types:
 * - Recursively omits any properties with `undefined` values.
 * - Recursively filters out `undefined` entries in arrays.
 * - Preserves explicit `null` values (for explicit field clearing).
 * - Preserves empty strings `""`, numbers `0`, booleans `false`.
 * - Handles Date objects and Firestore FieldValues/Sentinels safely.
 *
 * This prevents runtime FirebaseError:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */

export function serializeFirestorePayload<T>(data: T): any {
  if (data === undefined) {
    return undefined;
  }

  if (data === null) {
    return null;
  }

  // Preserve primitives
  if (typeof data !== 'object') {
    return data;
  }

  // Preserve Date instances
  if (data instanceof Date) {
    return isNaN(data.getTime()) ? new Date().toISOString() : data.toISOString();
  }

  // Handle Arrays recursively
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => serializeFirestorePayload(item));
  }

  // Check for Firestore Sentinel objects (FieldValue, Timestamp, etc.)
  if (
    data &&
    typeof data === 'object' &&
    ('_methodName' in (data as any) || '_seconds' in (data as any) || typeof (data as any).isEqual === 'function')
  ) {
    return data;
  }

  // Handle plain objects recursively: omit keys with undefined values
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    const sanitized = serializeFirestorePayload(value);
    if (sanitized !== undefined) {
      cleanObj[key] = sanitized;
    }
  }

  return cleanObj;
}

/**
 * Convenience helper to sanitize a lesson payload before writing to Firestore.
 */
export function sanitizeLessonWritePayload(lesson: Record<string, any>): Record<string, any> {
  const serialized = serializeFirestorePayload(lesson);
  // Guarantee required minimal defaults for robust indexing
  if (!serialized.title) {
    serialized.title = 'Untitled Lesson';
  }
  return serialized;
}
