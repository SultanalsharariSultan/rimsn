import { MongoClient, Db } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;

export function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB || 'rimsn';
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise.then((client) => client.db(databaseName));
}
