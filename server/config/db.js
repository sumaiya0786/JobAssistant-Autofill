const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!uri) throw new Error("MONGO_URL is not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName });
  console.log(`[db] connected to MongoDB (db: ${dbName})`);
}

module.exports = { connectDB };
