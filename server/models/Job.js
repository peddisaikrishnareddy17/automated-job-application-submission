const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    url: { type: String, required: true, unique: true },
    portal: String,
    description: String,
    postedAt: Date,
    fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
