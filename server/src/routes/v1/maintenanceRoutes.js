const express = require('express');
const router = express.Router();
const maintenanceController = require('../../controllers/maintenanceController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(requireAuth);

router.post('/', maintenanceController.createTicket);
router.get('/', maintenanceController.listTickets);
router.patch('/:id', requireRole('maintenance', 'warden', 'admin'), maintenanceController.updateTicketStatus);

module.exports = router;
