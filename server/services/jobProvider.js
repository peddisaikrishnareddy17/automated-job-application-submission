const axios = require('axios');

/**
 * Normalizes job payload into a unified format:
 * { title, company, location, description, apply_url, portal }
 */
const normalizeArbeitnow = (job) => {
    return {
        title: job.title || '',
        company: job.company_name || '',
        location: job.location || '',
        description: job.description || '',
        apply_url: job.url || '',
        url: job.url || '',
        portal: 'arbeitnow'
    };
};

const normalizeRemoteOK = (job) => {
    return {
        title: job.position || job.title || '',
        company: job.company || '',
        location: job.location || 'Remote',
        description: job.description || '',
        apply_url: job.apply_url || job.url || '',
        url: job.apply_url || job.url || '',
        portal: 'remoteok'
    };
};

const normalizeAdzuna = (job) => {
    return {
        title: job.title || '',
        company: job.company?.display_name || '',
        location: job.location?.display_name || '',
        description: job.description || '',
        apply_url: job.redirect_url || '',
        url: job.redirect_url || '',
        portal: 'adzuna'
    };
};

const normalizeUSAJobs = (job) => {
    return {
        title: job.MatchedObjectDescriptor?.PositionTitle || '',
        company: job.MatchedObjectDescriptor?.OrganizationName || '',
        location: job.MatchedObjectDescriptor?.PositionLocationDisplay || '',
        description: job.MatchedObjectDescriptor?.UserArea?.Details?.JobSummary || '',
        apply_url: job.MatchedObjectDescriptor?.ApplyURI?.[0] || job.MatchedObjectDescriptor?.PositionURI || '',
        url: job.MatchedObjectDescriptor?.ApplyURI?.[0] || job.MatchedObjectDescriptor?.PositionURI || '',
        portal: 'usajobs'
    };
};

const normalizeGreenhouse = (job, boardToken) => {
    return {
        title: job.title || '',
        company: boardToken || '',
        location: job.location?.name || '',
        description: '', // Greenhouse requires a second API call per job normally, will stay blank for listing
        apply_url: job.absolute_url || '',
        url: job.absolute_url || '',
        portal: 'greenhouse'
    };
};

const fetchArbeitnowJobs = async (keyword) => {
    try {
        // Arbeitnow doesn't have a direct keyword search via this free tier, we'll fetch recently published and filter.
        const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', { timeout: 10000 });
        if (response.data && response.data.data) {
            let jobs = response.data.data;
            if (keyword) {
                const lowerKeyword = keyword.toLowerCase();
                jobs = jobs.filter(j => 
                    (j.title && j.title.toLowerCase().includes(lowerKeyword)) || 
                    (j.description && j.description.toLowerCase().includes(lowerKeyword))
                );
            }
            return jobs.map(normalizeArbeitnow);
        }
    } catch (err) {
        console.error('Failed to fetch from Arbeitnow:', err.message);
    }
    return [];
};

const fetchRemoteOKJobs = async (keyword) => {
    try {
        const url = keyword ? `https://remoteok.com/api?tags=${encodeURIComponent(keyword)}` : 'https://remoteok.com/api';
        const response = await axios.get(url, { timeout: 10000 });
        if (Array.isArray(response.data)) {
            const actualJobs = response.data.filter(j => j.id && j.company);
            return actualJobs.map(normalizeRemoteOK);
        }
    } catch (err) {
        console.error('Failed to fetch from RemoteOK:', err.message);
    }
    return [];
};

const fetchAdzunaJobs = async (keyword) => {
    try {
        if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return [];
        const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}${keyword ? `&what=${encodeURIComponent(keyword)}` : ''}`;
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data && response.data.results) {
            return response.data.results.map(normalizeAdzuna);
        }
    } catch (err) {
        console.error('Failed to fetch from Adzuna:', err.message);
    }
    return [];
};

const fetchUSAJobs = async (keyword) => {
    try {
        if (!process.env.USAJOBS_API_KEY) return [];
        const url = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(keyword || 'software')}`;
        const response = await axios.get(url, {
            headers: {
                "Authorization-Key": process.env.USAJOBS_API_KEY,
                "User-Agent": "testbot@test.com"
            },
            timeout: 10000
        });
        if (response.data && response.data.SearchResult && response.data.SearchResult.SearchResultItems) {
            return response.data.SearchResult.SearchResultItems.map(normalizeUSAJobs);
        }
    } catch (err) {
        console.error('Failed to fetch from USAJobs:', err.message);
    }
    return [];
};

const fetchGreenhouseJobs = async () => {
    try {
        // Fetching from a known massive public greenhouse board as a demo provider, e.g. "canonical"
        const boardToken = 'canonical';
        const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data && response.data.jobs) {
            return response.data.jobs.map(j => normalizeGreenhouse(j, boardToken));
        }
    } catch (err) {
        console.error('Failed to fetch from Greenhouse:', err.message);
    }
    return [];
};

/**
 * Main service method to fetch jobs from multiple open APIs.
 * Supports keyword and location search.
 */
const getJobs = async ({ jobTitle, location, limit = 20 }) => {
    const providers = [];

    // Push fetch promises
    providers.push(fetchArbeitnowJobs(jobTitle));
    providers.push(fetchRemoteOKJobs(jobTitle));
    providers.push(fetchAdzunaJobs(jobTitle));
    providers.push(fetchUSAJobs(jobTitle));
    providers.push(fetchGreenhouseJobs());

    const results = await Promise.allSettled(providers);
    let allJobs = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

    // If a location is provided, filter the results roughly
    if (location) {
        const lowerLocation = location.toLowerCase();
        const filteredJobs = allJobs.filter(j => j.location && j.location.toLowerCase().includes(lowerLocation));
        if (filteredJobs.length > 0) {
            allJobs = filteredJobs;
        } else {
            console.log('Location filter yielded 0 results, bypassing location filter to provide valid job fallbacks.');
        }
    }

    // Deduplicate by URL
    const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.apply_url, job])).values());

    return uniqueJobs.slice(0, limit);
};

module.exports = { getJobs };
