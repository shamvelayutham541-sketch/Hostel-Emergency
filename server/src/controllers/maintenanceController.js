const store = require('../models/dataStore');

const createTicket = async (req, res, next) => {
  try {
    const { category, title, description, priority, photos } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({ success: false, message: 'Category, title and description are required' });
    }

    let profile = null;
    if (req.user.role === 'student') {
      profile = await store.studentProfiles.findOne({ userId: req.user.id });
    }

    const ticket = await store.maintenanceTickets.create({
      reporterId: req.user.id,
      reporterName: req.user.name,
      roomNumber: profile?.roomNumber || 'Room 102',
      blockName: profile?.blockName || 'Block A - Phoenix',
      category, // 'Plumbing', 'Electrical', 'WiFi / LAN', 'Carpentry', 'AC / Heating', 'Other'
      title,
      description,
      priority: priority || 'normal',
      status: 'open',
      photos: photos || [],
      assignedTo: null
    });

    return res.status(201).json({ success: true, message: 'Maintenance ticket registered successfully', ticket });
  } catch (err) {
    next(err);
  }
};

const listTickets = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;

    if (req.user.role === 'student') {
      query.reporterId = req.user.id;
    }

    const tickets = await store.maintenanceTickets.find(query);
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, resolutionNotes } = req.body;

    const ticket = await store.maintenanceTickets.findById(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const updates = {};
    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
    if (status === 'resolved') updates.resolvedAt = new Date().toISOString();

    const updated = await store.maintenanceTickets.findByIdAndUpdate(id, updates);
    return res.json({ success: true, message: 'Ticket updated', ticket: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  listTickets,
  updateTicketStatus
};
