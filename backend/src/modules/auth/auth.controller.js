const authService = require('./auth.service');

const sendTokenResponse = (user, tokens, statusCode, res, message) => {
    // Cookie options for both tokens
    const commonOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };

    // Access token cookie (short-lived)
    const accessCookieOptions = {
        ...commonOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    };

    // Refresh token cookie (long-lived)
    const refreshCookieOptions = {
        ...commonOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    res
        .status(statusCode)
        .cookie('accessToken', tokens.accessToken, accessCookieOptions)
        .cookie('refreshToken', tokens.refreshToken, refreshCookieOptions)
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
};

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        const tokens = await authService.issueTokens(user);
        sendTokenResponse(user, tokens, 201, res, 'User registered successfully');
    } catch (error) {
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
        sendTokenResponse(user, tokens, 200, res, 'Login successful');
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const refresh = async (req, res) => {
    try {
        const { accessToken, refreshToken } = await authService.refreshAccessToken(req.cookies.refreshToken);
        
        const commonOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        };

        const accessCookieOptions = {
            ...commonOptions,
            expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        };

        const refreshCookieOptions = {
            ...commonOptions,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };

        res
            .status(200)
            .cookie('accessToken', accessToken, accessCookieOptions)
            .cookie('refreshToken', refreshToken, refreshCookieOptions)
            .json({
                success: true,
                message: 'Token refreshed successfully',
                // No token in JSON body
            });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token refresh failed',
        });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.cookies.refreshToken);
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
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
