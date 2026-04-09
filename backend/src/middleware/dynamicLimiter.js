const SecurityAttempt = require('../models/SecurityAttempt');

/**
 * Middleware to check dynamic failure limits
 * @param {string} type - The type of attempt ('payment', 'login')
 * @param {number} maxAttempts - Max allowed failed attempts
 * @param {number} lockDurationSeconds - Lock duration in seconds
 */
const dynamicLimiter = (type, maxAttempts = 5, lockDurationSeconds = 3600) => {
    return async (req, res, next) => {
        // Use User ID if authenticated, fallback to IP
        const identifier = req.user ? req.user._id.toString() : req.ip;

        try {
            const attempt = await SecurityAttempt.findOne({ identifier, type });

            if (attempt && attempt.attempts >= maxAttempts) {
                const now = new Date();
                const diffSeconds = (now - new Date(attempt.lastAttempt)) / 1000;

                if (diffSeconds < lockDurationSeconds) {
                    const remainingSeconds = Math.ceil(lockDurationSeconds - diffSeconds);
                    const remainingMinutes = Math.ceil(remainingSeconds / 60);

                    return res.status(429).json({
                        success: false,
                        message: `Too many failed attempts. Please try again after ${remainingMinutes} minutes.`,
                        lockedUntil: new Date(attempt.lastAttempt.getTime() + lockDurationSeconds * 1000)
                    });
                } else {
                    // Lock expired, reset attempts so they can try again
                    attempt.attempts = 0;
                    await attempt.save();
                }
            }
            next();
        } catch (error) {
            console.error('Rate limit check error:', error);
            next(); // Allow request on error to not block users due to DB issues
        }
    };
};

/**
 * Helper to record success/failure
 */
const recordAttempt = async (identifier, type, status) => {
    try {
        if (status === 'success') {
            // Delete or reset on success
            await SecurityAttempt.deleteOne({ identifier, type });
        } else {
            // Increment on failure
            await SecurityAttempt.findOneAndUpdate(
                { identifier, type },
                { 
                    $inc: { attempts: 1 },
                    $set: { lastAttempt: new Date() }
                },
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        console.error('Record attempt error:', error);
    }
};

module.exports = { dynamicLimiter, recordAttempt };
