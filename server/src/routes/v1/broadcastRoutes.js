const express = require('express');
const router = express.Router();
const broadcastController = require('../../controllers/broadcastController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/', broadcastController.listBroadcasts);
router.post('/', requireRole('warden', 'admin'), broadcastController.createBroadcast);
router.post('/:id/checkin', broadcastController.markSafetyCheckin);
router.get('/:broadcastId/headcount', requireRole('warden', 'security', 'admin'), broadcastController.getEvacuationHeadcount);

module.exports = router;
