const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    jobTitle: String,
    location: String,
    remote: Boolean,
    salaryMin: Number,
    salaryMax: Number,
    skills: [String],
    experienceYears: Number,
    preferredPortals: [String], // ["linkedin", "naukri", "indeed"]
    updatedAt: { type: Date, default: Date.now }
});

preferencesSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Preferences', preferencesSchema);
