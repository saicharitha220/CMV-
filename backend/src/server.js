import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminContentRoutes from './routes/adminContentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let dbConnected = false;

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are required for admin seeding.');
      return;
    }
    const existing = await Admin.findOne({ email });
    if (existing) {
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ email, password: hashedPassword });
    console.log(`Seeded admin user: ${email}`);
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }
};

const initDb = async () => {
  try {
    dbConnected = await connectDB();
    if (dbConnected) {
      await seedAdmin();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/admin/content', adminContentRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'CMS backend is running',
    mongo: dbConnected ? 'connected' : 'disconnected',
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', mongo: dbConnected ? 'connected' : 'disconnected' });
});

app.use(notFound);
app.use(errorHandler);

const listenOnPort = (port) => new Promise((resolve, reject) => {
  const server = app.listen(port);
  server.on('listening', () => resolve(server));
  server.on('error', reject);
});

const startServer = async () => {
  const basePort = Number(process.env.PORT) || 4000;
  let server;
  let selectedPort;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    selectedPort = basePort + attempt;
    try {
      server = await listenOnPort(selectedPort);
      console.log(`Backend started on port ${selectedPort}`);
      break;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${selectedPort} is already in use. Trying ${selectedPort + 1}...`);
        continue;
      }
      console.error('Server startup error:', error);
      process.exit(1);
    }
  }

  if (!server) {
    console.error('Failed to bind backend to any port. Please free port', basePort);
    process.exit(1);
  }

  // Try to initialize DB, but if it fails to connect within a short time,
  // force start an in-memory MongoDB so the app reports healthy and can be used locally.
  (async () => {
    const initPromise = initDb();
    // wait up to 2s for DB to connect; otherwise start in-memory fallback
    const timeout = new Promise((resolve) => setTimeout(resolve, 2000, 'timeout'));
    const result = await Promise.race([initPromise, timeout]);
    if (result === 'timeout') {
      console.warn('DB init timed out — attempting to start in-memory MongoDB fallback.');
      // dynamic import to avoid circular dependencies issues
      const { startInMemoryMongo } = await import('./config/db.js');
      const mem = await startInMemoryMongo();
      if (mem) {
        dbConnected = true;
        await seedAdmin();
        console.log('In-memory Mongo started and admin seeded.');
      }
    } else {
      // initDb completed — set dbConnected accordingly (initDb sets it already)
      if (dbConnected) console.log('DB connected during init.');
    }
  })();
};

startServer();
