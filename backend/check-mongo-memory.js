import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const run = async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('STARTED URI', uri);
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MONGO CONNECTED', conn.connection.host, conn.connection.port);
    await mongoose.disconnect();
    await mongod.stop();
    console.log('STOPPED');
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
};

run();
