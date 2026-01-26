import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import blogRoutes from './routes/blog.routes';
import analyticsRoutes from './routes/analytics.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import contactRoutes from './routes/contact.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://blog-admin.anikdas.me",
      "https://myblog.anikdas.me",
      "https://anikdas.me",
      "https://www.anikdas.me",
      "http://localhost:3000",
      "http://localhost:3002",
    ];

    // allow server-to-server / curl / health checks
    if (!origin) return callback(null, true);

    // Check if origin matches any allowed origin (with or without trailing slash)
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin === `${allowed}/` || origin.startsWith(`${allowed}/`)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
// For local MongoDB without authentication, just use the URI directly
const connectionString = MONGODB_URI;

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

mongoose
  .connect(connectionString, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.db?.databaseName || 'blog'}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Tip: If using local MongoDB without auth, remove MONGODB_USERNAME and MONGODB_PASSWORD from .env');
    console.error('💡 Tip: If using MongoDB with auth, ensure credentials are correct');
    console.error('💡 Tip: Check if MongoDB is running and the connection string is correct');
    // Don't exit in production - let the server start and handle errors gracefully
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Server will continue but database operations will fail');
    }
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

