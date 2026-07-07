const express = require('express');
const router = express.Router();
const Preferences = require('../models/Preferences');
const { verifyToken } = require('../middleware/auth');

// Get
router.get('/', verifyToken, async (req, res) => {
    const prefs = await Preferences.findOne({ userId: req.user.id });
    res.json({ success: true, data: prefs || {} });
});

// Upsert
router.put('/', verifyToken, async (req, res) => {
    const prefs = await Preferences.findOneAndUpdate(
        { userId: req.user.id },
        { ...req.body, userId: req.user.id },
        { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: prefs });
});

module.exports = router;
