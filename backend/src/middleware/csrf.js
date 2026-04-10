/**
 * Custom CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery by requiring a custom header
 * and verifying the request source.
 */
const csrfProtection = (req, res, next) => {
    // 1. Skip for safe methods (GET, HEAD, OPTIONS)
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // 1.1 Skip for Payment Gateway Callbacks (must be exempt from CSRF)
    const whitelistedRoutes = [
        '/api/orders/iyzico/callback'
    ];
    if (whitelistedRoutes.includes(req.originalUrl.split('?')[0])) {
        return next();
    }

    // 2. Origin/Referer Check (Strict)
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;
    const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean);
    
    // In production, we should be strict
    if (process.env.NODE_ENV === 'production') {
        if (!origin && !referer) {
            return res.status(403).json({ success: false, message: 'CSRF Protection: Missing Origin/Referer' });
        }

        const requestOrigin = origin || (referer ? new URL(referer).origin : null);
        if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
             // For local development or same-host, origin might match host
             const hostOrigin = `${req.protocol}://${host}`;
             if (requestOrigin !== hostOrigin) {
                return res.status(403).json({ success: false, message: 'CSRF Protection: Origin mismatch' });
             }
        }
    }

    // 3. Custom Header Check
    // Standard APIs use a custom header that cannot be set by <form> submissions or simple <a> tags.
    // Modern browsers prevent cross-site scripts from setting custom headers without CORS preflight.
    const csrfHeader = req.headers['x-csrf-token'] || req.headers['x-requested-with'];
    
    if (!csrfHeader && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            message: 'CSRF Protection: Missing X-CSRF-Token or X-Requested-With header'
        });
    }

    next();
};

module.exports = csrfProtection;
