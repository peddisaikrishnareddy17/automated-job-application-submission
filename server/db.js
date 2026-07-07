const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

const connectWithRetry = async (attempts = 3, delay = 2000) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Successfully connected to MongoDB');
      return;
    } catch (err) {
      console.error(`Attempt ${i} to connect to MongoDB failed: ${err.message}`);
      if (i === attempts) {
        console.error('All connection attempts failed. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

connectWithRetry();

module.exports = mongoose;
