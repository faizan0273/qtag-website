import mongoose from 'mongoose';
import { env } from './env';

/**
 * Mongoose connection helper.
 *
 * Next.js dev mode hot-reloads modules, which would otherwise spawn a new
 * connection per reload and exhaust MongoDB's connection pool. We cache the
 * connection on the global object so it survives reloads.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
if (!global._mongoose) global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => {
        // eslint-disable-next-line no-console
        console.log('✅ MongoDB connected');
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        // eslint-disable-next-line no-console
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
