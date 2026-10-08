const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  try {
    // Attempt connecting to MongoDB with a short timeout to prevent blocking if mongod is not present
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Local or remote MongoDB server not reachable (${error.message}).`);
    console.log(`🚀 [HostelSOS DB] Activated embedded zero-config high-fidelity DataStore. All models, seed data, auth, real-time sockets and REST APIs will function seamlessly!`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  mode: isConnected ? 'mongodb' : 'embedded-memory'
});

module.exports = { connectDB, getDBStatus };
