const mongoose = require('mongoose');

const securityAttemptSchema = new mongoose.Schema({
    identifier: {
        type: String, // IP address or User ID
        required: true,
        index: true
    },
    type: {
        type: String, // 'payment', 'login', etc.
        required: true,
        enum: ['payment', 'login']
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient lookup
securityAttemptSchema.index({ identifier: 1, type: 1 });

module.exports = mongoose.model('SecurityAttempt', securityAttemptSchema);
