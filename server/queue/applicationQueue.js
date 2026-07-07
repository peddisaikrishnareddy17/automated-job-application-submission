const Queue = require('bull');

const applicationQueue = new Queue('applications', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const addJob = async (applicationId) => {
    await applicationQueue.add({ applicationId }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: true
    });
};

const processJobs = (handler) => {
    applicationQueue.process(async (job) => {
        await handler(job.data.applicationId);
    });
};

module.exports = { addJob, processJobs };
