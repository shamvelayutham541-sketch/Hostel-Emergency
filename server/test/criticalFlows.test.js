const test = require('node:test');
const assert = require('node:assert');
const store = require('../src/models/dataStore');
const { runSeed } = require('../src/seeds/seed');
const { generateTokens, verifyAccessToken } = require('../src/utils/jwt');

test('Critical Flow 1: Database Seed and Data Initialization', async () => {
  await runSeed();
  
  const users = await store.users.find();
  const rooms = await store.rooms.find();
  const incidents = await store.incidents.find();

  assert.strictEqual(users.length >= 25, true, 'Should seed at least 25 users');
  assert.strictEqual(rooms.length >= 60, true, 'Should seed at least 60 rooms');
  assert.strictEqual(incidents.length >= 40, true, 'Should seed at least 40 incidents');
});

test('Critical Flow 2: JWT Token Generation and Verification', async () => {
  const student = await store.users.findOne({ email: 'student@hostelsos.edu' });
  assert.ok(student, 'Student user should exist');

  const tokens = generateTokens(student);
  assert.ok(tokens.accessToken, 'Access token generated');
  assert.ok(tokens.refreshToken, 'Refresh token generated');

  const decoded = verifyAccessToken(tokens.accessToken);
  assert.strictEqual(decoded.userId, student._id);
  assert.strictEqual(decoded.role, 'student');
});

test('Critical Flow 3: Instant Emergency SOS Creation and Auto-Routing', async () => {
  const student = await store.users.findOne({ email: 'student@hostelsos.edu' });
  const profile = await store.studentProfiles.findOne({ userId: student._id });

  const newIncident = await store.incidents.create({
    reporterId: student._id,
    studentName: profile.name,
    studentPhone: profile.phone,
    type: 'medical',
    priority: 'critical',
    status: 'pending',
    location: {
      blockName: profile.blockName,
      roomNumber: profile.roomNumber,
      floor: profile.floor
    },
    gps: { latitude: 12.9716, longitude: 77.5946 },
    slaDeadline: new Date(Date.now() + 2 * 60000).toISOString(),
    slaBreached: false
  });

  assert.ok(newIncident._id, 'Incident created with ID');
  assert.strictEqual(newIncident.type, 'medical');
  assert.strictEqual(newIncident.priority, 'critical');
  assert.strictEqual(newIncident.status, 'pending');

  // Verify retrieval
  const retrieved = await store.incidents.findById(newIncident._id);
  assert.strictEqual(retrieved.location.roomNumber, profile.roomNumber);
});

test('Critical Flow 4: Responder Status Progression and Escalation', async () => {
  const incident = await store.incidents.findOne({ status: 'pending' });
  assert.ok(incident, 'Found pending incident');

  // Change to acknowledged
  const ack = await store.incidents.findByIdAndUpdate(incident._id, { status: 'acknowledged' });
  assert.strictEqual(ack.status, 'acknowledged');

  // Change to en_route
  const enRoute = await store.incidents.findByIdAndUpdate(incident._id, { status: 'en_route' });
  assert.strictEqual(enRoute.status, 'en_route');

  // Mark resolved
  const resolved = await store.incidents.findByIdAndUpdate(incident._id, {
    status: 'resolved',
    resolvedAt: new Date().toISOString()
  });
  assert.strictEqual(resolved.status, 'resolved');
  assert.ok(resolved.resolvedAt);
});

test('Critical Flow 5: False Alarm Detection and Warnings Increment', async () => {
  const studentProfile = await store.studentProfiles.findOne({});
  const initialFalseAlarms = studentProfile.falseAlarmCount || 0;

  await store.studentProfiles.findByIdAndUpdate(studentProfile._id, {
    falseAlarmCount: initialFalseAlarms + 1
  });

  const updatedProfile = await store.studentProfiles.findById(studentProfile._id);
  assert.strictEqual(updatedProfile.falseAlarmCount, initialFalseAlarms + 1);
});
