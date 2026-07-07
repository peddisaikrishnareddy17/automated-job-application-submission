const express = require('express');
const router = express.Router();
const path = require('path');
const Job = require('../models/Job');
const Preferences = require('../models/Preferences');
const Resume = require('../models/Resume');
const { verifyToken } = require('../middleware/auth');
const jobProvider = require('../services/jobProvider');
const { parseResumeForJobSearch } = require('../services/resumeParser');

// Fetch New Jobs
router.post('/fetch', verifyToken, async (req, res) => {
    try {
        const prefs = await Preferences.findOne({ userId: req.user.id });
        if (!prefs) return res.status(400).json({ success: false, error: 'Please set preferences first' });

        console.log(`Fetching jobs for user: ${req.user.id}`);

        // Check for uploaded resume for AI matching
        const resume = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
        let searchTitles = prefs.jobTitle && prefs.jobTitle.trim() !== '' ? [prefs.jobTitle] : ['Software Engineer'];

        if (resume && process.env.GEMINI_API_KEY) {
            console.log(`Analyzing resume: ${resume.originalName} with Gemini AI`);
            const resumePath = path.join(__dirname, '../uploads/', resume.filename);
            const aiSuggestedTitles = await parseResumeForJobSearch(resumePath);

            if (aiSuggestedTitles && aiSuggestedTitles.length > 0) {
                console.log('AI Suggested Job Search Queries:', aiSuggestedTitles);
                // Combine manual preference with AI suggestions, removing duplicates
                searchTitles = [...new Set([...aiSuggestedTitles, prefs.jobTitle])];
            }
        }

        const savedJobs = [];

        // Fetch jobs for each identified title
        for (const title of searchTitles) {
            if (!title) continue;

            console.log(`Searching portals for: '${title}'`);
            const currentPrefs = { ...prefs.toObject(), jobTitle: title };
            const newJobs = await jobProvider.getJobs({
                jobTitle: title,
                location: currentPrefs.location,
                limit: 10
            });

            for (const jobData of newJobs) {
                try {
                    const job = new Job(jobData);
                    await job.save();
                    savedJobs.push(job);
                } catch (err) {
                    // Duplicate URL expected
                }
            }
        }

        console.log(`Saved ${savedJobs.length} new jobs to database`);

        res.json({ success: true, data: savedJobs });
    } catch (error) {
        console.error('CRITICAL ERROR inside /jobs/fetch:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error while fetching jobs' });
    }
});

// List
router.get('/', verifyToken, async (req, res) => {
    const { portal, location, remote, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (portal) filter.portal = portal;
    if (location) filter.location = new RegExp(location, 'i');
    // remote filter depends on description or metadata

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
        .sort({ fetchedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({ success: true, data: { total, jobs, page, limit } });
});

module.exports = router;
