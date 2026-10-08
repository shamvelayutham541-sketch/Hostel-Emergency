const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const env = require('./config/env');
const { connectDB, getDBStatus } = require('./config/db');
const routes = require('./routes/v1');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { setupIncidentSockets } = require('./sockets/incidentSocket');
const escalationService = require('./services/escalationService');
const { runSeed } = require('./seeds/seed');
const store = require('./models/dataStore');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Pass io to Express app context so controllers can emit events
app.set('io', io);

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(generalLimiter);

// Healthcheck & System Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HostelSOS Rapid Emergency Response Backend',
    database: getDBStatus(),
    version: '1.0.0'
  });
});

// Mount V1 API
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Setup WebSockets
setupIncidentSockets(io);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed dataStore if empty so demo runs immediately out-of-the-box
    const userCount = await store.users.countDocuments();
    if (userCount === 0) {
      console.log('📦 Empty database detected. Auto-populating rich demo dataset...');
      await runSeed();
    }

    // Start background SLA escalation watchdog
    escalationService.start(io);

    server.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚨 HOSTELSOS BACKEND RUNNING ON PORT http://localhost:${env.PORT}`);
      console.log(`📡 Socket.IO Real-Time Engine Active`);
      console.log(`⏱️ SLA Watchdog and Escalation Service Active`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
