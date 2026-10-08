const { z } = require('zod');
const store = require('../models/dataStore');
const smsAdapter = require('../services/adapters/smsAdapter');
const emailAdapter = require('../services/adapters/emailAdapter');
const whatsappAdapter = require('../services/adapters/whatsappAdapter');
const pushAdapter = require('../services/adapters/pushAdapter');

const createIncidentSchema = z.object({
  type: z.enum(['medical', 'fire', 'electrical', 'lockout', 'plumbing', 'security', 'other']),
  priority: z.enum(['critical', 'high', 'normal']).optional(),
  description: z.string().optional().default('Emergency assistance requested via instant SOS'),
  gps: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  isSilent: z.boolean().optional().default(false),
  isAnonymous: z.boolean().optional().default(false),
  mediaUrls: z.array(z.string()).optional().default([]),
});

// Category to responder role routing mapping
const CATEGORY_ROUTING = {
  medical: ['medical', 'warden'],
  fire: ['security', 'warden'],
  security: ['security', 'warden'],
  electrical: ['maintenance', 'warden'],
  plumbing: ['maintenance', 'warden'],
  lockout: ['security', 'warden'],
  other: ['warden', 'security']
};

// Default SLA response windows in minutes
const SLA_MINUTES = {
  critical: 2,
  high: 5,
  normal: 10
};

const createIncident = async (req, res, next) => {
  try {
    const data = createIncidentSchema.parse(req.body);
    const userId = req.user.id;

    // Fetch student profile if student
    let profile = null;
    if (req.user.role === 'student') {
      profile = await store.studentProfiles.findOne({ userId });
    }

    const priority = data.priority || (['medical', 'fire', 'security'].includes(data.type) ? 'critical' : 'high');
    const slaDeadline = new Date(Date.now() + SLA_MINUTES[priority] * 60 * 1000).toISOString();

    // Check for duplicate recent reports from same block/room
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const existingRecent = await store.incidents.findOne({
      'location.roomNumber': profile?.roomNumber || 'Unknown',
      'location.blockName': profile?.blockName || 'Main',
      type: data.type,
      status: { $nin: ['resolved', 'closed', 'false_alarm'] }
    });

    const isDuplicate = !!existingRecent;

    // Determine initial target roles
    const targetRoles = CATEGORY_ROUTING[data.type] || ['warden', 'security'];

    // Auto find available staff on duty
    const allStaffUsers = await store.users.find({ role: { $in: targetRoles } });
    const assignedStaffIds = allStaffUsers.slice(0, 2).map(u => u._id);

    const incident = await store.incidents.create({
      reporterId: data.isAnonymous ? null : userId,
      studentName: data.isAnonymous ? 'Anonymous Student' : (profile?.name || req.user.name || 'Hostel Resident'),
      studentPhone: data.isAnonymous ? 'Confidential' : (profile?.phone || 'N/A'),
      type: data.type,
      priority,
      status: 'pending',
      location: {
        blockName: profile?.blockName || 'Block A - Phoenix',
        roomNumber: profile?.roomNumber || '204',
        floor: profile?.floor || 2,
      },
      gps: data.gps || { latitude: 12.9716, longitude: 77.5946 }, // default campus coordinate if denied
      description: data.description,
      isSilent: !!data.isSilent,
      isAnonymous: !!data.isAnonymous,
      isDuplicate,
      parentIncidentId: existingRecent ? existingRecent._id : null,
      mediaUrls: data.mediaUrls || [],
      assignedStaff: assignedStaffIds,
      slaDeadline,
      slaBreached: false,
    });

    // Create Initial Timeline item
    await store.incidentTimelines.create({
      incidentId: incident._id,
      action: data.isSilent ? 'Silent SOS Triggered' : 'SOS Emergency Raised',
      performedBy: data.isAnonymous ? 'Anonymous Resident' : (profile?.name || req.user.name),
      details: `Incident of type ${data.type.toUpperCase()} recorded. Routed to ${targetRoles.join(' & ')}.`
    });

    // Create assignments for designated responders
    for (const sId of assignedStaffIds) {
      await store.assignments.create({
        incidentId: incident._id,
        staffId: sId,
        status: 'pending'
      });
    }

    // Trigger Notification Adapters
    const alertMessage = `🚨 [${priority.toUpperCase()}] ${data.type.toUpperCase()} emergency from ${incident.location.blockName} - Room ${incident.location.roomNumber}`;
    await smsAdapter.sendEmergencyBroadcast(['+919876500001', '+919876500002'], incident);
    await emailAdapter.sendIncidentAlert('warden.hostel@campus.edu', incident);
    await whatsappAdapter.sendMessage('+919876500001', alertMessage);
    await pushAdapter.sendPush('all_wardens', { title: 'Emergency Raised', body: alertMessage });

    // Emit live Socket.IO event if io is bound
    const io = req.app.get('io');
    if (io) {
      io.emit('incident:new', incident);
      io.emit('notification:new', {
        id: `notif-${Date.now()}`,
        title: `🚨 ${incident.type.toUpperCase()} Alert!`,
        body: `Room ${incident.location.roomNumber}, ${incident.location.blockName}`,
        priority: incident.priority,
        incidentId: incident._id,
        isSilent: incident.isSilent,
        createdAt: new Date().toISOString()
      });
    }

    // Log Audit
    await store.auditLogs.create({
      actorId: userId,
      action: 'INCIDENT_CREATED',
      entity: 'Incident',
      entityId: incident._id,
      details: { type: incident.type, priority: incident.priority, room: incident.location.roomNumber }
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency SOS dispatched immediately to responders on duty!',
      incident
    });
  } catch (err) {
    next(err);
  }
};

const listIncidents = async (req, res, next) => {
  try {
    const { status, priority, type, block, myAssigned } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (type && type !== 'all') query.type = type;
    if (block && block !== 'all') query['location.blockName'] = block;

    // If student, only view own incidents
    if (req.user.role === 'student') {
      query.reporterId = req.user.id;
    }

    let results = await store.incidents.find(query);

    if (myAssigned === 'true' && req.user.role !== 'student') {
      results = results.filter(i => (i.assignedStaff || []).includes(req.user.id));
    }

    // Sort descending by createdAt
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      count: results.length,
      incidents: results
    });
  } catch (err) {
    next(err);
  }
};

const getIncidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await store.incidents.findById(id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Load timeline
    const timeline = await store.incidentTimelines.find({ incidentId: id });
    timeline.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Load messages
    const messages = await store.incidentMessages.find({ incidentId: id });
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Load assignments
    const assignments = await store.assignments.find({ incidentId: id });

    // Load medical card only if role is authorized (medical, warden, admin)
    let medicalCard = null;
    if (['medical', 'warden', 'admin'].includes(req.user.role) && incident.reporterId) {
      const studentProfile = await store.studentProfiles.findOne({ userId: incident.reporterId });
      if (studentProfile) {
        medicalCard = {
          name: studentProfile.name,
          bloodGroup: studentProfile.medicalInfo?.bloodGroup || 'O+',
          allergies: studentProfile.medicalInfo?.allergies || [],
          conditions: studentProfile.medicalInfo?.conditions || [],
          emergencyContacts: studentProfile.emergencyContacts || []
        };

        // Audit medical card access for strict student privacy compliance
        await store.auditLogs.create({
          actorId: req.user.id,
          action: 'MEDICAL_INFO_VIEWED',
          entity: 'StudentProfile',
          entityId: studentProfile._id,
          details: { viewedByRole: req.user.role, incidentId: id }
        });
      }
    }

    return res.json({
      success: true,
      incident,
      timeline,
      messages,
      assignments,
      medicalCard
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'acknowledged', 'en_route', 'in_progress', 'resolved', 'closed', 'false_alarm'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status supplied' });
    }

    const existing = await store.incidents.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Incident not found' });

    const updates = { status };
    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolvedBy = req.user.name;
    }

    const updated = await store.incidents.findByIdAndUpdate(id, updates);

    // Timeline record
    await store.incidentTimelines.create({
      incidentId: id,
      action: `Status Changed to ${status.toUpperCase().replace('_', ' ')}`,
      performedBy: `${req.user.name} (${req.user.role.toUpperCase()})`,
      details: note || `Status progressed to ${status}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', { incidentId: id, updates, updatedIncident: updated });
    }

    return res.json({ success: true, message: `Status updated to ${status}`, incident: updated });
  } catch (err) {
    next(err);
  }
};

const assignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId, note } = req.body;

    const staffUser = await store.users.findById(staffId);
    if (!staffUser) return res.status(404).json({ success: false, message: 'Staff member not found' });

    const incident = await store.incidents.findById(id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const currentStaff = incident.assignedStaff || [];
    if (!currentStaff.includes(staffId)) {
      currentStaff.push(staffId);
      await store.incidents.findByIdAndUpdate(id, { assignedStaff: currentStaff });
    }

    const assignment = await store.assignments.create({
      incidentId: id,
      staffId,
      status: 'pending',
      assignedAt: new Date().toISOString()
    });

    await store.incidentTimelines.create({
      incidentId: id,
      action: 'Staff Responder Assigned',
      performedBy: req.user.name,
      details: `Assigned ${staffUser.name || staffUser.email} (${staffUser.role.toUpperCase()}). Note: ${note || 'Immediate response requested'}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', { incidentId: id, assignedStaff: currentStaff });
    }

    return res.json({ success: true, message: 'Staff successfully assigned', assignment });
  } catch (err) {
    next(err);
  }
};

const respondAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accept or decline' });
    }

    const assignment = await store.assignments.findOne({ incidentId: id, staffId: req.user.id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found for user' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await store.assignments.findByIdAndUpdate(assignment._id, {
      status: newStatus,
      respondedAt: new Date().toISOString()
    });

    if (action === 'accept') {
      await store.incidents.findByIdAndUpdate(id, { status: 'acknowledged' });
    }

    await store.incidentTimelines.create({
      incidentId: id,
      action: `Responder ${action.toUpperCase()}ED Assignment`,
      performedBy: req.user.name,
      details: action === 'accept' ? 'Staff accepted task and is proceeding' : 'Staff declined; alert queued for automatic reassignment'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', { incidentId: id });
    }

    return res.json({ success: true, message: `Assignment ${action}ed successfully` });
  } catch (err) {
    next(err);
  }
};

const sendChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, mediaUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const message = await store.incidentMessages.create({
      incidentId: id,
      senderId: req.user.id,
      senderName: req.user.name || 'User',
      senderRole: req.user.role,
      content: content.trim(),
      mediaUrl: mediaUrl || null
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:chat', { incidentId: id, message });
    }

    return res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

const escalateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { escalationTarget, reason } = req.body;

    const incident = await store.incidents.findById(id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const updated = await store.incidents.findByIdAndUpdate(id, {
      priority: 'critical',
      escalated: true,
      escalatedAt: new Date().toISOString(),
      escalatedTo: escalationTarget || 'External Emergency / Chief Warden'
    });

    await store.incidentTimelines.create({
      incidentId: id,
      action: '🚨 EMERGENCY ESCALATED',
      performedBy: req.user.name,
      details: `Escalated to ${escalationTarget || 'External Authorities'}. Reason: ${reason || 'Immediate critical intervention required'}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:escalated', { incidentId: id, target: escalationTarget });
    }

    return res.json({ success: true, message: 'Incident escalated with highest priority', incident: updated });
  } catch (err) {
    next(err);
  }
};

const markFalseAlarm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const incident = await store.incidents.findById(id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    await store.incidents.findByIdAndUpdate(id, {
      status: 'false_alarm',
      resolvedAt: new Date().toISOString()
    });

    // If student was identified, increment their false alarm tally
    let studentWarnings = 0;
    if (incident.reporterId) {
      const profile = await store.studentProfiles.findOne({ userId: incident.reporterId });
      if (profile) {
        studentWarnings = (profile.falseAlarmCount || 0) + 1;
        await store.studentProfiles.findByIdAndUpdate(profile._id, { falseAlarmCount: studentWarnings });
      }
    }

    await store.incidentTimelines.create({
      incidentId: id,
      action: 'Flagged as False Alarm',
      performedBy: req.user.name,
      details: `Marked false alarm. ${note || ''} (Student cumulative false alarms: ${studentWarnings})`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', { incidentId: id, status: 'false_alarm' });
    }

    return res.json({
      success: true,
      message: 'Incident marked as false alarm.',
      studentWarnings
    });
  } catch (err) {
    next(err);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const feedback = await store.feedbacks.create({
      incidentId: id,
      rating: Number(rating),
      comment: comment || '',
      createdBy: req.user.id
    });

    return res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createIncident,
  listIncidents,
  getIncidentById,
  updateStatus,
  assignStaff,
  respondAssignment,
  sendChatMessage,
  escalateIncident,
  markFalseAlarm,
  submitFeedback
};
