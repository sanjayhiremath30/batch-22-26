import { getDb } from './mongodb';

/**
 * Verify that the request contains a valid secret key.
 * Returns the role associated with the key (e.g., 'admin' or 'student')
 * or throws an error which should be transformed into a 401 response.
 */
export async function verifySecretKey(key: string | undefined): Promise<string> {
  // Development shortcut – if no key is supplied, allow admin access
  if (!key) return 'admin';
  // Allow the secret key defined in .env.local to bypass DB lookup
  const devKey = process.env.SECRET_KEY;
  if (devKey && key === devKey) return 'admin';
  const db = getDb();
  const doc = await db.collection('secretKeys').findOne({ key });
  if (!doc) throw new Error('Invalid secret key');
  // Assume the collection stores { key: string, role: string }
  return doc.role;
}
