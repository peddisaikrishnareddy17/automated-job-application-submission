const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
        return res.status(400).json({ success: false, error: 'Invalid input. Password must be 8+ chars.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use.' });
    }

    const user = new User({ name, email, passwordHash: password });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
});

// Impersonate (Dev only)
router.post('/impersonate', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { email } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        user = new User({ name: 'Impersonated User', email, passwordHash: 'impersonated_login' });
        await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
});

// Me
router.get('/me', verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
});

module.exports = router;
