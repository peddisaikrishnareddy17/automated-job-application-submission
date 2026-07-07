const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobassistant')
    .then(async () => {
        console.log('Connected to MongoDB');
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error dropping database:', err);
        process.exit(1);
    });
