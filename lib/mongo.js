import { MongoClient } from 'mongodb'

let client
let clientPromise

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'asoftech_saas'

if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function getDb() {
  const c = await clientPromise
  return c.db(dbName)
}

export default clientPromise
