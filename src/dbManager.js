const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const dbName = process.env.DB_NAME
const url = process.env.MONGO_DB_CONN_STRING

let client = null;

function _createClient(){
  return new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
}

function _getClient() {
  client = client === null ? _createClient() : client;
  return client
}

async function _getCollection(collName) {
  client = _getClient()
  await client.connect();
  const db = client.db(dbName);

  return db.collection(collName);
}

async function insertMany(collectionName, documents) {
  const collection = await _getCollection(collectionName)
  const insertResult = await collection.insertMany(documents);

  return insertResult;
}

async function insertOne(collectionName, document) {
  const collection = await _getCollection(collectionName)
  const insertResult = await collection.insertOne(document)

  return insertResult;
}

async function replaceOne(collectionName, filter, replacement) {
  const collection = await _getCollection(collectionName)
  const updateOneResult = await collection.replaceOne(filter, replacement)

  return updateOneResult;

}

async function find(collectionName, query = {}) {
  const collection = await _getCollection(collectionName)
  const findResult = await collection.find(query).toArray();
  return findResult;
}

async function dropCollection(collectionName) {
  const collection = await _getCollection(collectionName)
  await collection.drop()
}

async function closeClient() {
  if(client) {
    await client.close();
    client = null;
  }
}


module.exports = {
  insertMany,
  insertOne,
  replaceOne,
  find,
  closeClient,
  dropCollection
}
