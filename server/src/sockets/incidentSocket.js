/**
 * Socket.IO Handler for Real-Time Emergency Response
 * Handles connection, rooms (per-block, staff channel, student channel),
 * and bi-directional events.
 */
const { verifyAccessToken } = require('../utils/jwt');

const setupIncidentSockets = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        socket.user = decoded;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    const userRole = socket.user?.role || 'guest';
    const userId = socket.user?.userId || socket.id;

    console.log(`🔌 [Socket.IO] Connected client: ${socket.id} (Role: ${userRole}, User: ${userId})`);

    // Join specific role channels
    if (['warden', 'security', 'medical', 'maintenance', 'admin'].includes(userRole)) {
      socket.join('staff-channel');
      console.log(`👥 Joined staff channel: ${socket.id}`);
    }

    if (userRole === 'admin') {
      socket.join('admin-channel');
    }

    // Join room for specific incident tracking
    socket.on('join:incident', (incidentId) => {
      socket.join(`incident:${incidentId}`);
      console.log(`📡 Socket ${socket.id} joined channel incident:${incidentId}`);
    });

    socket.on('leave:incident', (incidentId) => {
      socket.leave(`incident:${incidentId}`);
    });

    // Responder ping / location beacon update
    socket.on('responder:location', (data) => {
      io.to(`incident:${data.incidentId}`).emit('responder:location_update', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Disconnected client: ${socket.id}`);
    });
  });
};

module.exports = { setupIncidentSockets };
