import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri: string = process.env.MONGODB_URI;
let client: MongoClient;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }
  if (!client) {
    client = new MongoClient(uri, {
      // Optional: set options like useUnifiedTopology if needed
    });
  }
  await client.connect();
  // Use DB_NAME if provided, otherwise fall back to default DB from URI
  const dbName = process.env.DB_NAME || client.db().databaseName;
  const db = client.db(dbName);
  cachedDb = db;
  console.log('✅ Connected to MongoDB:', dbName);
  return db;
}

export function getDb(): Db {
  if (!cachedDb) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return cachedDb;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    res.status(200).json({ message: 'MongoDB connection successful' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
  }
}
