const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/job-assistant-test';

mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('MongoDB is running locally.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection failed. Not running.', err.message);
    process.exit(1);
  });
