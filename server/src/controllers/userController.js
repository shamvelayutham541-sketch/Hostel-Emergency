const store = require('../models/dataStore');

const listStaff = async (req, res, next) => {
  try {
    const staffRoles = ['warden', 'security', 'medical', 'maintenance', 'admin'];
    const users = await store.users.find({ role: { $in: staffRoles } });

    // Fetch shift statuses
    const results = await Promise.all(users.map(async (u) => {
      const shift = await store.staffShifts.findOne({ staffId: u._id });
      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        shiftStatus: shift?.status || 'on_duty',
        lastUpdated: shift?.updatedAt || u.updatedAt
      };
    }));

    return res.json({ success: true, count: results.length, staff: results });
  } catch (err) {
    next(err);
  }
};

const updateStaffShiftStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'on_duty', 'off_duty', 'busy'
    const staffId = req.user.id;

    if (!['on_duty', 'off_duty', 'busy'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid shift status' });
    }

    let shift = await store.staffShifts.findOne({ staffId });
    if (shift) {
      shift = await store.staffShifts.findByIdAndUpdate(shift._id, { status });
    } else {
      shift = await store.staffShifts.create({
        staffId,
        start: new Date().toISOString(),
        end: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        status
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('staff:status', { staffId, status, staffName: req.user.name });
    }

    return res.json({ success: true, message: `Status updated to ${status}`, shift });
  } catch (err) {
    next(err);
  }
};

const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const profile = await store.studentProfiles.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    return res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    let profile = await store.studentProfiles.findOne({ userId });

    if (!profile) {
      profile = await store.studentProfiles.create({ userId, ...updates });
    } else {
      profile = await store.studentProfiles.findByIdAndUpdate(profile._id, updates);
    }

    return res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (err) {
    next(err);
  }
};

const listAllUsers = async (req, res, next) => {
  try {
    const users = await store.users.find();
    return res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive !== false,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listStaff,
  updateStaffShiftStatus,
  getStudentProfile,
  updateStudentProfile,
  listAllUsers
};
