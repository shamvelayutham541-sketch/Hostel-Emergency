const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const incidentRoutes = require('./incidentRoutes');
const userRoutes = require('./userRoutes');
const broadcastRoutes = require('./broadcastRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const contactRoutes = require('./contactRoutes');

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/users', userRoutes);
router.use('/broadcasts', broadcastRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/contacts', contactRoutes);

module.exports = router;
