import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_COMPASS_URL as string;

if (!MONGO_URI) {
  throw new Error("Please define MONGO_URI in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
