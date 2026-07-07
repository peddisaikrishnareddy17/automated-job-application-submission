const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Resume = require('../models/Resume');
const { parseResumeFullData } = require('../services/resumeParser');
const { verifyToken } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only PDF and DOCX files are allowed'));
    }
});

// Upload
router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    let parsedData = null;
    try {
        const filePath = path.join(__dirname, '../uploads/', req.file.filename);
        parsedData = await parseResumeFullData(filePath);
    } catch (err) {
        console.error('Failed to parse resume data on upload:', err);
    }

    const resume = new Resume({
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        parsedData
    });
    await resume.save();

    res.status(201).json({ success: true, data: resume });
});

// List
router.get('/', verifyToken, async (req, res) => {
    const resumes = await Resume.find({ userId: req.user.id });
    res.json({ success: true, data: resumes });
});

// Delete
router.delete('/:id', verifyToken, async (req, res) => {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });

    const filePath = path.join(__dirname, '../uploads/', resume.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await resume.deleteOne();
    res.json({ success: true, data: { message: 'Resume deleted' } });
});

// Serve File
router.get('/file/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found' });
    res.sendFile(filePath);
});

module.exports = router;
