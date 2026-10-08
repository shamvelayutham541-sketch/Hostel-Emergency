const store = require('../models/dataStore');

const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, target, targetId, isDrill } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const broadcast = await store.broadcasts.create({
      title,
      message,
      target: target || 'all',
      targetId: targetId || null,
      isDrill: !!isDrill,
      createdBy: req.user.id,
      createdByName: req.user.name,
      acknowledgedBy: [], // Array of { userId, name, room, status: 'safe'|'needs_help', timestamp }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('broadcast:new', broadcast);
    }

    // Log audit
    await store.auditLogs.create({
      actorId: req.user.id,
      action: isDrill ? 'DRILL_BROADCAST_SENT' : 'PANIC_BROADCAST_SENT',
      entity: 'Broadcast',
      entityId: broadcast._id,
      details: { title, target }
    });

    return res.status(201).json({ success: true, message: 'Broadcast published hostel-wide', broadcast });
  } catch (err) {
    next(err);
  }
};

const listBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await store.broadcasts.find();
    broadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, count: broadcasts.length, broadcasts });
  } catch (err) {
    next(err);
  }
};

const markSafetyCheckin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // 'safe' or 'needs_help'

    const broadcast = await store.broadcasts.findById(id);
    if (!broadcast) return res.status(404).json({ success: false, message: 'Broadcast not found' });

    let profile = await store.studentProfiles.findOne({ userId: req.user.id });

    const acks = broadcast.acknowledgedBy || [];
    const existingIndex = acks.findIndex(a => a.userId === req.user.id);

    const checkinRecord = {
      userId: req.user.id,
      name: req.user.name,
      roomNumber: profile?.roomNumber || 'N/A',
      blockName: profile?.blockName || 'Hostel',
      status: status || 'safe',
      note: note || '',
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      acks[existingIndex] = checkinRecord;
    } else {
      acks.push(checkinRecord);
    }

    const updated = await store.broadcasts.findByIdAndUpdate(id, { acknowledgedBy: acks });

    const io = req.app.get('io');
    if (io) {
      io.emit('broadcast:checkin', { broadcastId: id, checkin: checkinRecord });
    }

    return res.json({ success: true, message: 'Status recorded', broadcast: updated });
  } catch (err) {
    next(err);
  }
};

const getEvacuationHeadcount = async (req, res, next) => {
  try {
    const { broadcastId } = req.params;
    const broadcast = await store.broadcasts.findById(broadcastId);
    if (!broadcast) return res.status(404).json({ success: false, message: 'Broadcast not found' });

    const students = await store.studentProfiles.find();
    const checkedInUserIds = new Set((broadcast.acknowledgedBy || []).map(a => a.userId));

    const safeStudents = (broadcast.acknowledgedBy || []).filter(a => a.status === 'safe');
    const needHelp = (broadcast.acknowledgedBy || []).filter(a => a.status === 'needs_help');
    const unverified = students.filter(s => !checkedInUserIds.has(s.userId));

    // Assembly points
    const assemblyPoints = [
      { id: 'AP-1', name: 'Main Football Ground', block: 'Phoenix & Orion', status: 'Active', wardenInCharge: 'Officer Rajesh Kumar' },
      { id: 'AP-2', name: 'Open Amphitheater Area', block: 'Zenith', status: 'Active', wardenInCharge: 'Dr. Priya Sharma' },
      { id: 'AP-3', name: 'Basketball Court Zone B', block: 'Visitors & Staff', status: 'Active', wardenInCharge: 'Chief Security Nair' },
    ];

    return res.json({
      success: true,
      totalStudents: students.length,
      safeCount: safeStudents.length,
      needHelpCount: needHelp.length,
      unverifiedCount: unverified.length,
      safeList: safeStudents,
      needHelpList: needHelp,
      unverifiedList: unverified.map(u => ({
        id: u.userId,
        name: u.name,
        roomNumber: u.roomNumber,
        blockName: u.blockName,
        phone: u.phone
      })),
      assemblyPoints
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBroadcast,
  listBroadcasts,
  markSafetyCheckin,
  getEvacuationHeadcount
};
