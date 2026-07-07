const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Verify user still exists in DB (protects against test script wipes)
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User no longer exists.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token.' });
    }
};

module.exports = { verifyToken };
