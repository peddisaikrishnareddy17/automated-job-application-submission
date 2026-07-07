const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
        type: String,
        enum: ["applied", "selected", "denied", "skipped", "pending", "in_progress", "submitted", "failed"], // Kept old ones for safety
        default: "applied"
    },
    automationLog: [String],
    appliedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
