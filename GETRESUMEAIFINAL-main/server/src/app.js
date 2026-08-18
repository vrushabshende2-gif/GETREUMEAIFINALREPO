const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Trust reverse proxy for rate limiter (required for Render)
app.set('trust proxy', 1);

// Parse cookies
app.use(cookieParser());

// Set security headers
app.use(helmet());

// Prevent NoSQL injections
app.use(mongoSanitize());

// Dynamic CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '1mb' })); // Limit body size

// Prevent HTTP Param pollution
app.use(hpp());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Main Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/ats', require('./routes/atsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Get Resume AI API' });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
