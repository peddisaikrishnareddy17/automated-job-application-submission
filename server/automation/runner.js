const Application = require('../models/Application');
const Resume = require('../models/Resume');
const User = require('../models/User');
const Job = require('../models/Job');
const { buildDriver } = require('./browser');
const portals = require('./portals');
const path = require('path');

const runAutomation = async (applicationId) => {
    const application = await Application.findById(applicationId).populate('jobId userId');
    if (!application) return;

    const { jobId: job, userId: user } = application;
    const resume = await Resume.findOne({ userId: user._id }).sort({ uploadedAt: -1 });

    if (!resume) {
        application.status = 'failed';
        application.automationLog.push('No resume found for user');
        await application.save();
        return;
    }

    application.status = 'in_progress';
    application.automationLog.push(`Starting automation for ${job.portal} at ${new Date().toISOString()}`);
    await application.save();

    let driver;
    try {
        driver = await buildDriver();
        const handler = portals.getPortalHandler(job.portal);

        if (!handler) {
            throw new Error(`No handler found for portal: ${job.portal}`);
        }

        const resumePath = path.join(__dirname, '../uploads/', resume.filename);
        await handler(driver, job, user, resumePath, resume.parsedData, async (msg) => {
            // Use atomic updates to prevent Mongoose ParallelSaveError during rapid form-filling 
            await Application.findByIdAndUpdate(applicationId, {
                $push: { automationLog: msg }
            });
        });

        await Application.findByIdAndUpdate(applicationId, {
            status: 'submitted',
            appliedAt: new Date(),
            $push: { automationLog: 'Application submitted successfully' }
        });
    } catch (err) {
        console.error(`Automation failed for ${applicationId}:`, err);
        const errorLog = `Error: ${err.message}`;
        const stackLog = err.stack ? `Stack: ${err.stack.split('\\n')[0]}` : '';
        await Application.findByIdAndUpdate(applicationId, {
            status: 'failed',
            $push: { automationLog: { $each: [errorLog, stackLog].filter(Boolean) } }
        });
    } finally {
        if (driver) await driver.quit();
    }
};

module.exports = { runAutomation };
