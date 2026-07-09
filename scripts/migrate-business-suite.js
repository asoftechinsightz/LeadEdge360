const { MongoClient } = require('mongodb');

async function main() {
  const { loadEnvForScripts, getMongoConnectConfig } = await import('../lib/mongo-connect.js');
  loadEnvForScripts();
  const { mongoUrl: uri, dbName } = getMongoConnectConfig();

  const client = new MongoClient(uri);

  await client.connect();

  const db = client.db(dbName);

  const result = await db.collection('users').updateMany(
    {},
    {
      $set: {
        companyName: '',
        products: ['leadedge360'],
        activeProduct: 'leadedge360',
        businessSuiteEnabled: true,
        subscriptionTier: 'starter'
      }
    }
  );

  console.log('Users Updated:', result.modifiedCount);

  await client.close();
}

main().catch(console.error);
