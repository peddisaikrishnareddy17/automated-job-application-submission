const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken } = require('../middleware/auth');
const { runAutomation } = require('../automation/runner');

// List
router.get('/', verifyToken, async (req, res) => {
    const apps = await Application.find({ userId: req.user.id }).populate('jobId');
    res.json({ success: true, data: apps });
});

// Start (Manual Apply)
router.post('/start', verifyToken, async (req, res) => {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, error: 'jobId required' });

    let application = await Application.findOne({ userId: req.user.id, jobId });

    if (!application) {
        application = new Application({
            userId: req.user.id,
            jobId,
            status: 'in_progress',
            automationLog: ['Opened job URL manually'],
            appliedAt: new Date()
        });
        await application.save();
    }

    // Trigger automation asynchronously
    runAutomation(application._id).catch(err => console.error('Background automation failed:', err));

    res.status(201).json({ success: true, data: application });
});

// Custom URL Apply (Phase 3 Native Test Interface)
router.post('/auto-apply', verifyToken, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Valid Job URL required' });

    try {
        // 1. Discover or create a dummy synthetic Job wrapper to trick the engine dynamically 
        const Job = require('../models/Job');
        let syntheticJob = await Job.findOne({ url: url });

        if (!syntheticJob) {
            syntheticJob = new Job({
                title: 'Custom URL Application',
                company: 'Unknown (Direct Link)',
                location: 'Remote/Unknown',
                description: 'Auto-applying via direct AI link parser',
                apply_url: url,
                url: url,
                portal: 'arbeitnow' // Forces it strictly through generic.js
            });
            await syntheticJob.save();
        }

        // 2. Wrap it in an application ticket
        const application = new Application({
            userId: req.user.id,
            jobId: syntheticJob._id,
            status: 'in_progress',
            automationLog: ['Directly parsing custom Job URL injection via Phase 3 AI Form Scanner'],
            appliedAt: new Date()
        });
        await application.save();

        runAutomation(application._id).catch(err => console.error('Custom URL auto-apply failed:', err));
        
        res.status(201).json({ success: true, data: application });
    } catch (e) {
        console.error('Auto apply generation failed:', e);
        res.status(500).json({ success: false, error: 'Failed to queue custom URL' });
    }
});

// Update Status
router.patch('/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;
    const app = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { status, $push: { automationLog: `Status manually updated to: ${status}` } },
        { new: true }
    );
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
    res.json({ success: true, data: app });
});

// Status details
router.get('/:id/status', verifyToken, async (req, res) => {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
    res.json({ success: true, data: { status: app.status, automationLog: app.automationLog } });
});

module.exports = router;
