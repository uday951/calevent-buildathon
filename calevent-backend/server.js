import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { corsOptions, staticCorsOptions, generalLimiter, helmetConfig, corsErrorHandler } from './middleware/security.js';

// Import database connection
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatbotRoutes from './routes/customBotRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import comboRoutes from './routes/comboRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRequestRoutes from './routes/eventRequestRoutes.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('⚠️ WARNING: Missing required environment variables:', missingEnvVars.join(', '));
  console.warn('⚠️ The server might not function correctly until these are added in Render Environment variables.');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Static file serving for uploads (before CORS to avoid restrictions)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Serve frontend public folder (event images seeded from /weddings, /Birthdays, etc.)
app.use('/', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '..', 'public')));

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(corsErrorHandler);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CALEVENT Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/combo', comboRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event-requests', eventRequestRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CALEVENT API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      providers: '/api/provider',
      customers: '/api/customer',
      bookings: '/api/bookings',
      payments: '/api/payments',
      chatbot: '/api/chatbot',
      search: '/api/search',
      feed: '/api/feed',
      image: '/api/image',
      combo: '/api/combo',
      ai: '/api/ai'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 CALEVENT Backend Server Started Successfully!
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📚 API Documentation: http://localhost:${PORT}/
🔗 Frontend URL: ${process.env.FRONTEND_URL}
  `);

  // --- Self-Ping Mechanism ---
  // To prevent the Render free tier from sleeping, we hit our own health endpoint
  // Note: 5 seconds is very aggressive! Render's limit is usually handling inactivity after 15 minutes.
  // The user requested 5 seconds, so we will use 5 seconds (5000ms).
  const PING_INTERVAL = 5 * 1000;
  setInterval(() => {
    const backendUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    fetch(`${backendUrl}/health`)
      .then(res => {
        // You can uncomment this if you want to see the 5-sec logs, but it will flood your terminal!
        // console.log(`[Self-Ping] Successful check to ${backendUrl}/health - Status: ${res.status}`);
      })
      .catch(err => console.error(`[Self-Ping Error]:`, err.message));
  }, PING_INTERVAL);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

export default app;