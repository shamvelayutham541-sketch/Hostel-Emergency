const bcrypt = require('bcryptjs');
const { z } = require('zod');
const store = require('../models/dataStore');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  studentId: z.string().min(2),
  phone: z.string().min(8),
  hostelId: z.string().optional(),
  blockName: z.string().min(1),
  roomNumber: z.string().min(1),
  floor: z.number().optional().default(1),
  bloodGroup: z.string().optional().default('O+'),
  allergies: z.string().optional().default('None'),
  emergencyContactName: z.string().optional().default('Guardian'),
  emergencyContactPhone: z.string().optional().default('+91 9876543210'),
  emergencyContactRelation: z.string().optional().default('Parent'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await store.users.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await store.users.create({
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'student',
      name: data.name,
      isActive: true,
    });

    // Create associated student profile
    const profile = await store.studentProfiles.create({
      userId: user._id,
      studentId: data.studentId,
      name: data.name,
      phone: data.phone,
      blockName: data.blockName,
      roomNumber: data.roomNumber,
      floor: data.floor || 1,
      emergencyContacts: [
        {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relation: data.emergencyContactRelation
        }
      ],
      medicalInfo: {
        bloodGroup: data.bloodGroup || 'O+',
        allergies: data.allergies ? [data.allergies] : [],
        conditions: [],
        medication: []
      },
      profilePhotoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`
    });

    const tokens = generateTokens(user);
    await store.users.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    // Log audit
    await store.auditLogs.create({
      actorId: user._id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role }
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile
      },
      tokens
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await store.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact the warden.' });
    }

    const tokens = generateTokens(user);
    await store.users.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    let profile = null;
    if (user.role === 'student') {
      profile = await store.studentProfiles.findOne({ userId: user._id });
    }

    // Log audit
    await store.auditLogs.create({
      actorId: user._id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role, ip: req.ip }
    });

    return res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name || (profile?.name) || 'User',
        role: user.role,
        profile
      },
      tokens
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await store.users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = null;
    if (user.role === 'student') {
      profile = await store.studentProfiles.findOne({ userId: user._id });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || profile?.name || 'User',
        role: user.role,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(incomingToken);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await store.users.findById(decoded.userId);
    if (!user || user.refreshToken !== incomingToken) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked or invalid' });
    }

    const newTokens = generateTokens(user);
    await store.users.findByIdAndUpdate(user._id, { refreshToken: newTokens.refreshToken });

    return res.json({
      success: true,
      tokens: newTokens
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
};
