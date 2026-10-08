const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/dashboard', requireRole('warden', 'admin', 'security', 'medical'), analyticsController.getDashboardStats);
router.get('/export-csv', requireRole('warden', 'admin'), analyticsController.exportIncidentsCSV);

module.exports = router;
