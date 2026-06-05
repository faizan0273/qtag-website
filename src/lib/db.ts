import mongoose from 'mongoose';
import { env } from './env';

/**
 * Mongoose connection helper.
 *
 * Next.js dev mode hot-reloads modules, which would otherwise spawn a new
 * connection per reload and exhaust MongoDB's connection pool. We cache the
 * connection on the global object so it survives reloads.
 *
 * Development: if MONGODB_URI points at localhost and nothing is listening,
 * we fall back to an in-memory MongoDB (via mongodb-memory-server) so login
 * and APIs work without Docker. Data is ephemeral until you run real Mongo.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var _qtagDevMemoryUri: string | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
if (!global._mongoose) global._mongoose = cached;

function isLocalMongoUri(uri: string): boolean {
  return /127\.0\.0\.1|localhost/.test(uri);
}

/** True when API routes should return a clear “database down” message. */
export function isMongoConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const name = (err as { name?: string }).name;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    name === 'MongooseServerSelectionError' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect ECONNREFUSED') ||
    msg.includes('Server selection timed out')
  );
}

async function getDevMemoryMongoUri(): Promise<string> {
  if (global._qtagDevMemoryUri) return global._qtagDevMemoryUri;

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create();
  const base = server.getUri();
  const uri = base.endsWith('/') ? `${base}qtag` : `${base}/qtag`;
  global._qtagDevMemoryUri = uri;

  // eslint-disable-next-line no-console
  console.warn(
    '\n⚠️  [Qtag dev] Local MongoDB is not running at',
    env.MONGODB_URI,
    '\n   → Using in-memory MongoDB (data resets when you stop `npm run dev`).',
    '\n   → For persistent data: `docker compose up -d` or set MONGODB_URI to MongoDB Atlas.\n',
  );

  return uri;
}

function connectToUri(uri: string): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: env.NODE_ENV === 'development' ? 5_000 : 10_000,
  });
}

async function establishConnection(): Promise<typeof mongoose> {
  const primary = env.MONGODB_URI;

  try {
    const m = await connectToUri(primary);
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
    return m;
  } catch (err) {
    const canUseMemoryFallback =
      env.NODE_ENV === 'development' && isLocalMongoUri(primary) && isMongoConnectionError(err);

    if (!canUseMemoryFallback) {
      // eslint-disable-next-line no-console
      console.error('❌ MongoDB connection failed:', err instanceof Error ? err.message : err);
      throw err;
    }

    await mongoose.disconnect().catch(() => undefined);

    const memoryUri = await getDevMemoryMongoUri();
    const m = await connectToUri(memoryUri);
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected (in-memory dev fallback)');
    return m;
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = establishConnection().catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
