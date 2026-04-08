const mongoose = require('mongoose');


let mongoServer;

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.MONGO_URI) {
      // Local Development: strictly require memory server here
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      await mongoose.connect(mongoUri);
      console.log(`MongoDB Memory Server started & connected: ${mongoUri}`);
    } else {
      // Production Serverless (Vercel)
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        console.error('ERROR: MONGO_URI is not defined in environment variables.');
        process.exit(1);
      }
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected to production database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectDB;
