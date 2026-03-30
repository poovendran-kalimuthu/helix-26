import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/db.js';
import MongoStore from 'connect-mongo';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import Passport Config
import './config/passport.js';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import evaluatorRoutes from './routes/evaluator.js';
import attendanceRoutes from './routes/attendance.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();
 
// Essential for ngrok/proxy to work with OAuth and session cookies
app.set('trust proxy', 1);

// Enable CORS
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash if present
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session Setup - MUST BE BEFORE PASSPORT MIDDLEWARE
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true, // Required for cookies over HTTPS behind proxy
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: true, // Must be true for SameSite: none
    httpOnly: true,
    sameSite: 'none', // Critical for Vercel -> Render communication
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport Config middleware
app.use(passport.initialize());
app.use(passport.session()); // Session support for login sessions

// Map Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluator', evaluatorRoutes);
app.use('/api/attendance', attendanceRoutes);

// Example protected route
app.get('/api/dashboard', protect, (req, res) => {
  res.json({
    message: 'Welcome to the protected dashboard area!',
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
