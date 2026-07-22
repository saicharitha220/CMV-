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

  await initDb();

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

  if (dbConnected) {
    console.log('Database initialized successfully. Backend is ready.');
  } else {
    console.warn('Backend started without a connected database. Health checks will report disconnected.');
  }
};

startServer();
