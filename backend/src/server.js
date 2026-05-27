require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');
const errorHandler = require('./middleware/error');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes  = require('./routes/authRoutes');
const pinRoutes   = require('./routes/pinRoutes');
const boardRoutes = require('./routes/boardRoutes');
const userRoutes  = require('./routes/userRoutes');

// ─── Connect DB ───────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'PinVault API running', env: process.env.NODE_ENV })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/pins',   pinRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users',  userRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ─── Central error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
