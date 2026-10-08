const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactController');

// Publicly viewable or authenticated
router.get('/', contactController.getEmergencyContacts);

module.exports = router;
