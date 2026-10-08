const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/staff', userController.listStaff);
router.patch('/staff/shift', requireRole('warden', 'security', 'medical', 'maintenance', 'admin'), userController.updateStaffShiftStatus);
router.get('/profile', userController.getStudentProfile);
router.put('/profile', userController.updateStudentProfile);
router.get('/all', requireRole('admin', 'warden'), userController.listAllUsers);

module.exports = router;
