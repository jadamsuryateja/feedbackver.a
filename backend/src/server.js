import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with the correct path
dotenv.config({ path: join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();
const httpServer = createServer(app);

// Get environment variables
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://feedbak-v5-lgsz.vercel.app';

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
});

// Update Express CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add preflight handler
app.options('*', cors());

// Connect to MongoDB
connectDB();

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request size limits for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.IO events
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Client connected:', socket.id);
  }

  // Join room based on role/branch
  socket.on('join-room', (room) => {
    socket.join(room);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Socket ${socket.id} joined room: ${room}`);
    }
  });

  // Handle configuration updates
  socket.on('config-updated', (data) => {
    // Notify specific branch
    if (data.branch) {
      io.to(`branch-${data.branch}`).emit('config-refresh');
    }
    
    // Notify admin
    io.to('admin').emit('config-refresh');
    
    // If BSH config, notify BSH users
    if (data.branch === 'BSH') {
      io.to('bsh').emit('config-refresh');
    }
  });

  // Handle new feedback submissions
  socket.on('feedback-submitted', (data) => {
    // Notify branch coordinator
    if (data.branch) {
      io.to(`branch-${data.branch}`).emit('feedback-refresh');
    }
    
    // Notify admin
    io.to('admin').emit('feedback-refresh');
    
    // If BSH feedback, notify BSH users
    if (data.branch === 'BSH') {
      io.to('bsh').emit('feedback-refresh');
    }
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Client disconnected:', socket.id);
    }
  });
});

app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    res.status(403).json({
      error: 'CORS Error',
      message: err.message
    });
  } else {
    next(err);
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
