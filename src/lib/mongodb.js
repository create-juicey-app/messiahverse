import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  dbName: 'messiahverse', // Add explicit database name here
}

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your Mongo URI to .env')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export function normalizeId(id) {
  if (!id) return null;
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch {
    return id;
  }
}

export async function getDb() {
  const client = await clientPromise
  return client.db('messiahverse')
}
