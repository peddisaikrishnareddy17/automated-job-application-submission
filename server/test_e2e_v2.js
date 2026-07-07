const mongoose = require('mongoose');
const User = require('./models/User');
const Preferences = require('./models/Preferences');
const Resume = require('./models/Resume');
const Job = require('./models/Job');
const Application = require('./models/Application');
const { getJobs } = require('./services/jobProvider');
const { runAutomation } = require('./automation/runner');
const path = require('path');
const fs = require('fs');

const uri = 'mongodb://127.0.0.1:27017/job-assistant-test';

(async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(uri);
        
        console.log('1. Fetching existing user...');
        const user = await User.findOne();
        if (!user) {
            console.error('No user found in DB. Please register via the web UI first so your login details and resume can be used.');
            process.exit(1);
        }
        console.log(`-> Using user: ${user.email} (fetching actual login credentials)`);
        
        console.log('2. Fetching user preferences...');
        let prefs = await Preferences.findOne({ userId: user._id });
        if (!prefs) {
            console.log('-> No preferences found, using defaults.');
            prefs = new Preferences({
                userId: user._id,
                jobTitle: 'Developer',
                location: 'Remote'
            });
            await prefs.save();
        }
        
        console.log('3. Fetching user resume...');
        const resume = await Resume.findOne({ userId: user._id }).sort({ uploadedAt: -1 });
        if (!resume) {
            console.error('No resume uploaded for user. Please upload a resume via the web UI first.');
            process.exit(1);
        }
        console.log(`-> Using resume: ${resume.originalName}`);
        
        console.log('4. Testing jobProvider APIs (Arbeitnow & RemoteOK)...');
        const apiJobs = await getJobs({ jobTitle: 'Developer', limit: 3 });
        console.log(`-> Fetched ${apiJobs.length} real jobs from Open APIs.`);
        
        if (apiJobs.length === 0) {
            console.warn('API returned no jobs, generating a synthetic one...');
            apiJobs.push({ title: 'Synthetic Dev', company: 'Mock Inc', location: 'Remote', apply_url: 'dummy', portal: 'arbeitnow' });
        }
        
        const targetJobData = apiJobs[0];
        console.log(`-> Using job: ${targetJobData.title} at ${targetJobData.company}`);
        
        console.log('5. Retargeting Job to Local Mock HTML for stable automation testing...');
        // Change the apply_url to our testing HTML file so Selenium doesn't hit a real, unpredictable website.
        targetJobData.apply_url = 'file:///' + path.join(__dirname, '../test/mock_job_form.html').replace(/\\/g, '/');
        targetJobData.url = targetJobData.apply_url;
        targetJobData.portal = 'arbeitnow'; // Forces use of our Generic handler
        
        const job = new Job(targetJobData);
        await job.save();
        
        console.log('6. Creating Application Ticket instance...');
        const application = new Application({
            userId: user._id,
            jobId: job._id,
            status: 'pending'
        });
        await application.save();
        
        console.log('\n7. Kicking off Core Automation Runner...');
        console.log('-'.repeat(40));
        await runAutomation(application._id);
        console.log('-'.repeat(40));
        
        // Verify output
        const updatedApp = await Application.findById(application._id);
        console.log(`Final Application Status: ${updatedApp.status}`);
        if(updatedApp.status === 'submitted') {
            console.log('\n✅ E2E System Test PASSED. Goals reached successfully.');
        } else {
            console.log('\n❌ E2E System Test FAILED. Check logs above.');
            console.log('Logs:', updatedApp.automationLog);
        }
    } catch(err) {
        console.error('Fatal error during E2E test sequence:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
})();
