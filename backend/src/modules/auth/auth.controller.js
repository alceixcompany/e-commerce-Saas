const authService = require('./auth.service');
const logger = require('../../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

const getRequestCookiePolicy = (req) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const isSecureRequest = req.secure || forwardedProto === 'https';
    const forceProdSecure = process.env.COOKIE_FORCE_SECURE !== 'false';

    // In production, cross-site auth requires `Secure + SameSite=None`.
    // Allow opt-out only via explicit env override for exceptional debugging.
    const secureCookie = isProd ? (forceProdSecure ? true : !!isSecureRequest) : false;
    const sameSite = secureCookie ? 'none' : 'lax';

    return { secureCookie, sameSite };
};

const buildCookieOptions = (req, expiresInMs) => {
    const { secureCookie, sameSite } = getRequestCookiePolicy(req);
    return {
        httpOnly: true,
        secure: secureCookie,
        sameSite,
        path: '/',
        expires: new Date(Date.now() + expiresInMs),
    };
};

const buildClearCookieOptions = (req) => {
    const { secureCookie, sameSite } = getRequestCookiePolicy(req);
    return {
        httpOnly: true,
        secure: secureCookie,
        sameSite,
        path: '/',
    };
};

const getRequestMeta = (req) => ({
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    proto: req.headers['x-forwarded-proto'] || req.protocol,
    isSecure: !!(req.secure || req.headers['x-forwarded-proto'] === 'https'),
});

const sendTokenResponse = (req, user, tokens, statusCode, res, message) => {
    // Access token cookie (short-lived)
    res
        .status(statusCode)
        .cookie('accessToken', tokens.accessToken, buildCookieOptions(req, 60 * 60 * 1000)) // 1 hour (longer than JWT)
        .cookie('refreshToken', tokens.refreshToken, buildCookieOptions(req, 14 * 24 * 60 * 60 * 1000)) // 14 days (longer than JWT)
        .json({
            success: true,
            message,
            data: {
                // We no longer send the token in the JSON body 
                // to completely hide it from JavaScript (Senior practice)
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });

    logger.info('Auth cookies set', {
        route: req.originalUrl,
        method: req.method,
        sameSite: accessCookieOptions.sameSite,
        secureCookie: accessCookieOptions.secure,
        nodeEnv: process.env.NODE_ENV,
        ...getRequestMeta(req),
    });
};

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        const tokens = await authService.issueTokens(user);
        sendTokenResponse(req, user, tokens, 201, res, 'User registered successfully');
    } catch (error) {
        logger.warn('Auth register failed', { message: error.message, ...getRequestMeta(req) });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        const tokens = await authService.issueTokens(user);
        sendTokenResponse(req, user, tokens, 200, res, 'Login successful');
    } catch (error) {
        logger.warn('Auth login failed', { message: error.message, ...getRequestMeta(req) });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const refresh = async (req, res) => {
    try {
        if (!req.cookies.refreshToken) {
            logger.warn('Auth refresh missing cookie', { ...getRequestMeta(req) });
        }

        const { accessToken, refreshToken } = await authService.refreshAccessToken(req.cookies.refreshToken);

        res
            .status(200)
            .cookie('accessToken', accessToken, buildCookieOptions(req, 60 * 60 * 1000))
            .cookie('refreshToken', refreshToken, buildCookieOptions(req, 14 * 24 * 60 * 60 * 1000))
            .json({
                success: true,
                message: 'Token refreshed successfully',
                // No token in JSON body
            });
    } catch (error) {
        logger.warn('Auth refresh failed', { message: error.message, ...getRequestMeta(req) });
        res.status(401).json({
            success: false,
            message: 'Token refresh failed',
        });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.cookies.refreshToken);
        const clearOptions = buildClearCookieOptions(req);
        res.clearCookie('accessToken', clearOptions);
        res.clearCookie('refreshToken', clearOptions);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        logger.warn('Auth logout failed', { message: error.message, ...getRequestMeta(req) });
        res.status(500).json({
            success: false,
            message: 'Logout failed',
        });
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
