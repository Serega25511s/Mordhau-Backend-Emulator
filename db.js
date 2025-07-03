const MongoClient = require("mongodb").MongoClient;
const config = require("./config.json");
const fs = require("fs");
const path = require("path");

module.exports.Init = async function (callback) {

  const client = new MongoClient(config.mongodbUri);
  await client.connect();
  const db = client.db("mordhau");

  const collections = [
    "users",
    "servers",
    "matches",
    "inventory",
    "playerInventory",
    "awards",
    "endMatchResult"
  ];
  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) await db.createCollection(name);
  }

  const catalogCollection = db.collection("inventory");
  const catalogCount = await catalogCollection.countDocuments();
  if (catalogCount === 0) {
    const catalogPath = path.join(__dirname, "Catalog.json");
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, "utf8");
      let doc = JSON.parse(raw);
      if (doc._id) delete doc._id;
      await catalogCollection.insertOne(doc);
      console.log("Catalog.json импортирован в коллекцию inventory");
    } else {
      console.warn("Catalog.json не найден для импорта в коллекцию inventory");
    }
  }

  const serversIndexes = await db.collection("servers").indexes();
  const hasTTL = serversIndexes.some(idx => idx.key && idx.key.lastUpdate && idx.expireAfterSeconds);
  if (!hasTTL) {
    await db.collection("servers").createIndex(
      { lastUpdate: 1 },
      { expireAfterSeconds: 130, name: "lastUpdateTTL" }
    );
  }

  module.exports = {
    Users: db.collection("users"),
    Servers: db.collection("servers"),
    Matches: db.collection("matches"),
    Catalog: db.collection("inventory"),
    Inventors: db.collection("playerInventory"),
    Awards: db.collection("awards"),
    EndMatchResult: db.collection("endMatchResult")
  }
  console.log("Connected to DB!");

  callback();
};
