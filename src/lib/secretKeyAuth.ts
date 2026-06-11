import { getDb } from './mongodb';

/**
 * Verify that the request contains a valid admin secret key.
 * Returns the role associated with the key (e.g., 'admin' or 'student')
 * or throws an error which should be transformed into a 401 response.
 * NOTE: This is only used for admin operations (add/edit/delete students).
 * Student submissions use submissionKey verification directly in each route.
 */
export async function verifySecretKey(key: string | undefined): Promise<string> {
  // Allow the secret key defined in .env.local to bypass DB lookup
  const devKey = process.env.SECRET_KEY;
  if (devKey && key === devKey) return 'admin';

  if (!key) throw new Error('No secret key provided');

  const db = await getDb();
  const doc = await db.collection('secretKeys').findOne({ key });
  if (!doc) throw new Error('Invalid secret key');
  return doc.role as string;
}
