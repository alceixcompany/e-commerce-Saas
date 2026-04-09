const jwt = require('jsonwebtoken');
const authRepo = require('./auth.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
};

const login = async ({ email, password }) => {
    const user = await authRepo.findUserByEmail(email, { includePassword: true });
    if (!user) throw createHttpError('Invalid credentials', 401);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw createHttpError('Invalid credentials', 401);

    if (user.accountStatus === 'inactive') {
        throw createHttpError('Your account has been deactivated. Please contact support.', 403);
    }

    user.lastLogin = new Date();
    await authRepo.saveUser(user);

    return user;
};

const register = async ({ name, email, password }) => {
    const userExists = await authRepo.findUserByEmail(email);
    if (userExists) throw createHttpError('User already exists with this email', 400);

    return authRepo.createUser({ name, email, password });
};

const issueTokens = async (user) => {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Support multiple sessions: push new token to list
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    
    // Limit number of sessions (e.g., max 5) to prevent bloat
    if (user.refreshTokens.length > 5) {
        user.refreshTokens.shift();
    }

    await authRepo.saveUser(user);

    return { accessToken, refreshToken };
};

// In-memory cache to handle parallel refresh race conditions
// Stores { oldToken: { accessToken, refreshToken, timestamp } }
const recentRotations = new Map();

// Cleanup expired rotations every minute
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of recentRotations.entries()) {
        if (now - data.timestamp > 30000) { // 30 seconds window
            recentRotations.delete(token);
        }
    }
}, 60000);

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw createHttpError('No refresh token provided', 401);

    // 1. Check if this token was JUST rotated (parallel request race condition)
    if (recentRotations.has(refreshToken)) {
        const rotationData = recentRotations.get(refreshToken);
        return { 
            accessToken: rotationData.accessToken, 
            refreshToken: rotationData.refreshToken 
        };
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await authRepo.findUserByIdWithRefresh(decoded.id);

        // 2. Check if token still exists in user's active sessions
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            // Potential reuse attack or genuine expiration
            throw createHttpError('Invalid or expired refresh token', 401);
        }

        // --- REFRESH TOKEN ROTATION ---
        // 3. Remove the old used token
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

        // 4. Generate new pair
        const accessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        // 5. Store in race-condition cache before saving to DB
        recentRotations.set(refreshToken, {
            accessToken,
            refreshToken: newRefreshToken,
            timestamp: Date.now()
        });

        // 6. Save the new refresh token to DB
        user.refreshTokens.push(newRefreshToken);
        await authRepo.saveUser(user);

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw createHttpError('Token refresh failed', 401);
    }
};

const logout = async (refreshToken) => {
    if (!refreshToken) return;
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded && decoded.id) {
            // Remove ONLY this specific session token
            await authRepo.removeRefreshToken(decoded.id, refreshToken);
        }
    } catch (error) {
        // ignore invalid token
    }
};

module.exports = {
    login,
    register,
    issueTokens,
    refreshAccessToken,
    logout,
};
