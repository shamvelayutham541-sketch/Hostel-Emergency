const express = require('express');
const router = express.Router();
const incidentController = require('../../controllers/incidentController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');
const { sosLimiter } = require('../../middleware/rateLimiter');

// All incident routes require authentication
router.use(requireAuth);

router.post('/', sosLimiter, incidentController.createIncident);
router.get('/', incidentController.listIncidents);
router.get('/:id', incidentController.getIncidentById);

// Staff and Warden operational routes
router.patch('/:id/status', requireRole('warden', 'security', 'medical', 'maintenance', 'admin'), incidentController.updateStatus);
router.post('/:id/assign', requireRole('warden', 'admin'), incidentController.assignStaff);
router.post('/:id/respond', incidentController.respondAssignment);
router.post('/:id/escalate', requireRole('warden', 'security', 'medical', 'admin'), incidentController.escalateIncident);
router.patch('/:id/false-alarm', requireRole('warden', 'admin'), incidentController.markFalseAlarm);

// Live Chat & Feedback
router.post('/:id/messages', incidentController.sendChatMessage);
router.post('/:id/feedback', incidentController.submitFeedback);

module.exports = router;
