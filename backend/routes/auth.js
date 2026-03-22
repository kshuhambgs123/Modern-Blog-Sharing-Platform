const router  = require('express').Router();
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' });

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    const { password: _pw, ...info } = savedUser._doc;
    res.status(201).json({ message: 'Registration successful', user: info });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Wrong credentials' });

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _pw, ...info } = user._doc;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }).status(200).json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { sameSite: 'lax', secure: false })
     .status(200).json({ message: 'Logged out successfully' });
});

// ─── REFETCH (Check Auth / Session Restore) ───────────────────────────────────
router.get('/refetch', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, async (err, data) => {
    if (err) return res.status(403).json({ message: 'Token expired or invalid' });

    const user = await User.findById(data._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  });
});

module.exports = router;
