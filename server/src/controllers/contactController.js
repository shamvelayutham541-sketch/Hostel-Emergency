const store = require('../models/dataStore');

const getEmergencyContacts = async (req, res, next) => {
  try {
    let contacts = await store.emergencyContacts.find();
    if (contacts.length === 0) {
      // Seed default essential emergency contacts
      const defaults = [
        { name: 'Chief Hostel Warden', phone: '+91 98765 43210', role: 'Warden Office', icon: 'ShieldCheck', available: '24/7 Priority' },
        { name: 'Campus Security Gate 1', phone: '+91 98765 43211', role: 'Security Control', icon: 'ShieldAlert', available: '24/7 Live' },
        { name: 'Campus Medical Centre / Ambulance', phone: '108', role: 'Ambulance Hotline', icon: 'Ambulance', available: 'Immediate dispatch' },
        { name: 'National Fire Service', phone: '101', role: 'Fire & Rescue', icon: 'Flame', available: 'Emergency response' },
        { name: 'National Police Helpline', phone: '100', role: 'Police Control', icon: 'Siren', available: '24/7' },
        { name: 'National Women Safety Helpline', phone: '1091', role: 'Women Cell', icon: 'HeartHandshake', available: 'Confidential 24/7' },
        { name: 'Emergency Electrician & Plumber', phone: '+91 98765 43215', role: 'Hostel Maintenance', icon: 'Wrench', available: 'On Campus' },
        { name: 'City Multi-Specialty Hospital', phone: '+91 80 2345 6789', role: 'Nearest Trauma Centre (1.2 km)', icon: 'Hospital', available: 'ICU & Trauma' },
      ];
      contacts = await store.emergencyContacts.insertMany(defaults);
    }

    return res.json({ success: true, count: contacts.length, contacts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmergencyContacts };
