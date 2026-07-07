const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    parsedData: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        portfolio: String,
        address: String,
        skills: [String],
        education: [{
            degree: String,
            school: String,
            year: String
        }],
        experience: [{
            job_title: String,
            company: String,
            duration: String,
            description: String
        }]
    },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
