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

    user.refreshToken = refreshToken;
    await authRepo.saveUser(user);

    return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw createHttpError('No refresh token provided', 401);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await authRepo.findUserByIdWithRefresh(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw createHttpError('Invalid refresh token', 401);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    return accessToken;
};

const logout = async (refreshToken) => {
    if (!refreshToken) return;
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded && decoded.id) {
            await authRepo.unsetRefreshToken(decoded.id);
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
