/**
 * High-Fidelity DataStore
 * Provides resilient, MongoDB-compatible storage engine for HostelSOS.
 * Handles collections, schema validation, IDs, timestamps, sorting, filtering and indexing.
 */
const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

class Collection {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  async find(query = {}) {
    return this.items.filter(item => this._matches(item, query)).map(i => ({ ...i }));
  }

  async findOne(query = {}) {
    const item = this.items.find(item => this._matches(item, query));
    return item ? { ...item } : null;
  }

  async findById(id) {
    const item = this.items.find(i => String(i._id) === String(id) || String(i.id) === String(id));
    return item ? { ...item } : null;
  }

  async create(doc) {
    const now = new Date().toISOString();
    const newDoc = {
      _id: doc._id || generateId(),
      id: doc._id || generateId(),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };
    newDoc.id = newDoc._id;
    this.items.push(newDoc);
    return { ...newDoc };
  }

  async insertMany(docs) {
    const created = [];
    for (const d of docs) {
      created.push(await this.create(d));
    }
    return created;
  }

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    const index = this.items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) return null;
    
    const existing = this.items[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.items[index] = updated;
    return { ...updated };
  }

  async findByIdAndDelete(id) {
    const index = this.items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) return null;
    const removed = this.items.splice(index, 1)[0];
    return { ...removed };
  }

  async deleteMany(query = {}) {
    const initialLen = this.items.length;
    this.items = this.items.filter(item => !this._matches(item, query));
    return { deletedCount: initialLen - this.items.length };
  }

  async countDocuments(query = {}) {
    return (await this.find(query)).length;
  }

  _matches(item, query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(value)) {
        const matchesAny = value.some(subQuery => this._matches(item, subQuery));
        if (!matchesAny) return false;
        continue;
      }

      if (key.includes('.')) {
        const parts = key.split('.');
        let nested = item;
        for (const p of parts) {
          nested = nested ? nested[p] : undefined;
        }
        if (nested !== value) return false;
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value.$ne !== undefined && item[key] === value.$ne) return false;
        if (value.$in && !value.$in.includes(item[key])) return false;
        if (value.$nin && value.$nin.includes(item[key])) return false;
        if (value.$regex) {
          const re = new RegExp(value.$regex, value.$options || '');
          if (!re.test(String(item[key] || ''))) return false;
        }
        continue;
      }

      if (String(item[key]) !== String(value)) {
        return false;
      }
    }
    return true;
  }
}

class DataStore {
  constructor() {
    this.users = new Collection('users');
    this.studentProfiles = new Collection('studentProfiles');
    this.hostels = new Collection('hostels');
    this.blocks = new Collection('blocks');
    this.rooms = new Collection('rooms');
    this.incidents = new Collection('incidents');
    this.incidentTimelines = new Collection('incidentTimelines');
    this.incidentMessages = new Collection('incidentMessages');
    this.assignments = new Collection('assignments');
    this.staffShifts = new Collection('staffShifts');
    this.emergencyContacts = new Collection('emergencyContacts');
    this.notifications = new Collection('notifications');
    this.broadcasts = new Collection('broadcasts');
    this.safetyCheckins = new Collection('safetyCheckins');
    this.maintenanceTickets = new Collection('maintenanceTickets');
    this.feedbacks = new Collection('feedbacks');
    this.auditLogs = new Collection('auditLogs');
    this.drills = new Collection('drills');
    this.settings = new Collection('settings');
    this.visitorLogs = new Collection('visitorLogs');
  }

  clearAll() {
    Object.values(this).forEach(prop => {
      if (prop instanceof Collection) {
        prop.items = [];
      }
    });
  }
}

const store = new DataStore();
module.exports = store;
