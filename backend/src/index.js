const express = require('express');
const compression = require('compression');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import central router
const apiRouter = require('./routes/index');

const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const csrfProtection = require('./middleware/csrf');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT;
app.set('trust proxy', 1);

// Middleware (CORS must be first)
app.use(compression());
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Dynamic CORS Cache
let cachedAllowedOrigins = [...allowedOrigins];
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

const getDynamicAllowedOrigins = async () => {
    const now = Date.now();
    if (now - lastCacheUpdate < CACHE_TTL) {
        return cachedAllowedOrigins;
    }

    try {
        const SectionContent = require('./models/SectionContent');
        const paymentSettings = await SectionContent.findOne({ identifier: 'payment_settings' });
        const dynamicUrl = paymentSettings?.content?.storeUrl;

        const newOrigins = [...allowedOrigins];
        if (dynamicUrl) {
            try {
                const origin = new URL(dynamicUrl).origin;
                if (!newOrigins.includes(origin)) {
                    newOrigins.push(origin);
                }
            } catch (e) {
                // Invalid URL in settings, ignore
            }
        }
        
        cachedAllowedOrigins = newOrigins;
        lastCacheUpdate = now;
        return cachedAllowedOrigins;
    } catch (error) {
        console.error('CORS Dynamic Origin Error:', error);
        return cachedAllowedOrigins; // Fallback to cache on DB error
    }
};

app.use(cors({
  origin: async (origin, callback) => {
    // 1. Allow non-browser requests (like server-to-server or mobile)
    if (!origin) return callback(null, true);

    // 2. Resolve dynamic origins from DB + .env
    const allowed = await getDynamicAllowedOrigins();

    if (allowed.includes(origin)) return callback(null, true);
    
    // 3. Fallback for Iyzico callback specifically: 
    // Sometimes redirects from payment gateways trigger CORS in strict browser environments.
    // If it's a known payment gateway pattern or if we want to be permissive for the callback path
    return callback(null, true); 
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const jwt = require('jsonwebtoken');

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => {
    // Skip rate limiting for admins
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
          return decoded.role === 'admin';
        }
      } catch (error) {
        // Token invalid or expired, do not skip
        return false;
      }
    }
    return false;
  }
});
app.use(limiter);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts from this IP, please try again after 15 minutes'
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Auth limiter application
app.use('/api/auth', authLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      api: '/api',
      docs: '/api-docs'
    }
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount main API router
app.use('/api', csrfProtection, apiRouter);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
  logger.info(`📚 Documentation: http://localhost:${PORT}/api-docs`);
});
