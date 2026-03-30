const mongoose = require('mongoose');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully.');
      });

      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  // In development, fall back to in-memory MongoDB so devs don't need a local install
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Local MongoDB unavailable — starting in-memory MongoDB for development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${uri}`);
      return;
    } catch (memError) {
      console.error(`In-memory MongoDB failed: ${memError.message}`);
    }
  }

  console.error('=== FATAL: Could not connect to MongoDB after all retries. Exiting. ===');
  process.exit(1);
};

module.exports = connectDB;
