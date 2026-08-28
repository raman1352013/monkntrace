const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

const connectDB = async () => {
  try {
    let conn;
    try {
      conn = await mongoose.connect(config.database.uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
    } catch (primaryErr) {
      logger.warn(`Primary MongoDB connection failed (${primaryErr.message}). Attempting fallback to local MongoDB...`);
      conn = await mongoose.connect('mongodb://127.0.0.1:27017/monktrace', {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
    }

    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      port: conn.connection.port,
      database: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('MongoDB connection failed', { message: error.message });
    logger.error('Note: Please ensure local MongoDB is running OR your IP address is whitelisted in MongoDB Atlas.');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing MongoDB connection', { error: error.message });
    process.exit(1);
  }
});

module.exports = connectDB;
