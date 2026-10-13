const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, phone, location });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  return res.json(req.user);
}

module.exports = { register, login, getMe };
