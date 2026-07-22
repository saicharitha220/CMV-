import connectDB from './src/config/db.js';
(async () => {
  try {
    const ok = await connectDB();
    console.log('CONNECTDB_RESULT', ok);
    process.exit(0);
  } catch (err) {
    console.error('CONNECTDB_ERROR', err);
    process.exit(1);
  }
})();
