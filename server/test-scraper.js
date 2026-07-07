const { getJobs } = require('./services/jobProvider');

// Mock preferences to match the UI test
const mockPreferences = {
    jobTitle: 'Software Engineer',
    location: 'Remote'
};

const runTest = async () => {
    console.log(`Starting Job Fetcher test for: ${mockPreferences.jobTitle} in ${mockPreferences.location}`);
    try {
        const jobs = await getJobs({ 
            jobTitle: mockPreferences.jobTitle, 
            location: mockPreferences.location, 
            limit: 5 
        });
        
        const fs = require('fs');
        fs.writeFileSync('scraper-results.json', JSON.stringify({
            count: jobs.length,
            sample1: jobs[0],
            sample2: jobs[1]
        }, null, 2));
        console.log(`Saved results to scraper-results.json. Found ${jobs.length} jobs.`);
    } catch (error) {
        console.error('Test failed with error:', error.message);
    }
};

runTest();
