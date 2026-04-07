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

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw createHttpError('No refresh token provided', 401);

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await authRepo.findUserByIdWithRefresh(decoded.id);

        // Check if token still exists in user's active sessions
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            throw createHttpError('Invalid or expired refresh token', 401);
        }

        // --- REFRESH TOKEN ROTATION ---
        // 1. Remove the old used token
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

        // 2. Generate new pair
        const accessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        // 3. Save the new refresh token
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
