const authService = require('./auth.service');

const sendTokenResponse = (user, tokens, statusCode, res, message) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    res
        .status(statusCode)
        .cookie('refreshToken', tokens.refreshToken, cookieOptions)
        .json({
            success: true,
            message,
            data: {
                token: tokens.accessToken,
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
        const accessToken = await authService.refreshAccessToken(req.cookies.refreshToken);
        res.status(200).json({
            success: true,
            data: { token: accessToken },
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
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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
