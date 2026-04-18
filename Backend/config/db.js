const mongoose = require("mongoose");

const connectDB = async (retries = 5, delayMs = 5000) => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error("MongoDB URI not provided in environment (MONGODB_URI or MONGO_URI)");
      return;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${delayMs / 1000}s... (${retries} retries left)`);
      setTimeout(() => connectDB(retries - 1, delayMs), delayMs);
    } else {
      console.error("MongoDB connection failed after retries. Continuing without DB.");
    }
  }
};

module.exports = connectDB;
