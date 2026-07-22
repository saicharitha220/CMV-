import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const DEFAULT_MONGO_URI = process.env.NODE_ENV === 'production'
  ? null
  : 'mongodb://127.0.0.1:27017/cms_assignment';
const DOCKER_MONGO_URI = 'mongodb://mongo:27017/cms_assignment';
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;
const MEMORY_DOWNLOAD_DIR = process.env.MONGO_MEMORY_DOWNLOAD_DIR || '/tmp/mongodb-memory-server';
const rawMongoUri = typeof process.env.MONGO_URI === 'string' ? process.env.MONGO_URI.trim() : '';
const hasMongoUri = rawMongoUri.length > 0;
const USE_MEMORY_FALLBACK = process.env.NODE_ENV !== 'production'
  || Boolean(process.env.MONGO_MEMORY_FALLBACK)
  || !hasMongoUri;

let inMemoryMongoServer = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToUri = async (uri) => {
  console.log('connectToUri: trying', uri);
  // If there's an existing mongoose connection (maybe from a failed attempt),
  // disconnect it before trying a new URI to avoid "openUri on active connection" errors.
  try {
    if (mongoose.connection && mongoose.connection.readyState && mongoose.connection.readyState !== 0) {
      console.log('connectToUri: existing mongoose connection detected (state=' + mongoose.connection.readyState + '), disconnecting');
      // eslint-disable-next-line no-await-in-loop
      await mongoose.disconnect();
      // wait for mongoose to report disconnected
      const start = Date.now();
      while (mongoose.connection && mongoose.connection.readyState !== 0 && Date.now() - start < 2000) {
        // eslint-disable-next-line no-await-in-loop
        await delay(100);
      }
      console.log('connectToUri: disconnected previous mongoose connection (state=' + (mongoose.connection ? mongoose.connection.readyState : 'unknown') + ')');
    }
  } catch (e) {
    console.warn('connectToUri: error while disconnecting previous mongoose connection:', e && e.message ? e.message : e);
  }
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      // Use a temporary connection to probe the URI without modifying the global mongoose connection.
      const tempConn = mongoose.createConnection();
      await tempConn.openUri(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB probe succeeded for ${uri}`);
      await tempConn.close();

      // Now establish the main mongoose connection
      const mainConn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB connected: ${mainConn.connection.host} via ${uri}`);
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} to ${uri} failed: ${error && error.message ? error.message : error}`);
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }
  return false;
};

const startInMemoryMongo = async () => {
  try {
    console.warn('Attempting to start in-memory MongoDB for development...');
    inMemoryMongoServer = await MongoMemoryServer.create({
      binary: {
        downloadDir: MEMORY_DOWNLOAD_DIR,
      },
    });
    const uri = inMemoryMongoServer.getUri();
    const connected = await connectToUri(uri);
    if (connected) {
      console.log('Connected to in-memory MongoDB');
      return true;
    }
    await inMemoryMongoServer.stop();
    inMemoryMongoServer = null;
    return false;
  } catch (err) {
    console.error('Failed to start in-memory MongoDB:', err && err.message ? err.message : err);
    inMemoryMongoServer = null;
    return false;
  }
};

const connectDB = async () => {
  console.log('connectDB: starting connection sequence');
  const uris = [rawMongoUri, DEFAULT_MONGO_URI, DOCKER_MONGO_URI].filter(Boolean);

  console.log('connectDB: candidate URIs ->', uris);

  for (const uri of uris) {
    const connected = await connectToUri(uri);
    if (connected) {
      return true;
    }
  }

  if (!USE_MEMORY_FALLBACK) {
    console.error('MongoDB connection failed for all configured URIs, and memory fallback is disabled in production.');
    return false;
  }

  console.warn('MongoDB connection failed for all configured URIs. Falling back to in-memory MongoDB.');
  const mem = await startInMemoryMongo();
  if (mem) return true;

  return false;
};

export default connectDB;
export { startInMemoryMongo };
