import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    let decoded: { userId: string; username: string };
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    } catch (jwtError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      res.status(503).json({ 
        error: 'Database connection unavailable',
        message: 'Please wait for the database to connect or check your connection settings'
      });
      return;
    }

    try {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (dbError: any) {
      console.error('Database error during authentication:', dbError);
      // Check if it's a connection error
      if (dbError.name === 'MongoServerError' || dbError.name === 'MongooseError' || dbError.message?.includes('connection')) {
        res.status(503).json({ 
          error: 'Database connection error',
          message: 'Unable to verify authentication. Please try again in a moment.'
        });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

