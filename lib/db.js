import mongoose from "mongoose";

// Caching for local development
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export function isDatabaseEnabled() {
  const useDatabase = (process.env.USE_DATABASE ?? "true").trim().toLowerCase();
  const hasMongoUri = Boolean(process.env.MONGODB_URI?.trim());

  return useDatabase !== "false" && hasMongoUri;
}

export async function makeSureDbIsReady() {
  if (cached.conn) {
    return cached.conn;
  }

  const useDatabase = (process.env.USE_DATABASE ?? "true").trim().toLowerCase();
  if (useDatabase === "false") {
    throw new Error("Database usage is disabled (USE_DATABASE=false)");
  }

  const MONGODB_URI = process.env.MONGODB_URI?.trim();
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { 
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // Fail fast after 2 seconds
      connectTimeoutMS: 2000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ Connected to MongoDB");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}
