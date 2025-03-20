import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { db } from '../lib/db'; // Import your singleton db instance
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

interface JwtPayload {
  userId: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: Role;
      };
      refreshToken?: string
    }
  }
}

/**
 * Authenticate user
 */
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Check if user exists
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }
      
      // Check user status
      if (user.status === 'BANNED' || user.status === 'LOCKED') {
        res.status(403).json({ 
          success: false, 
          message: user.status === 'BANNED' ? 'Your account has been banned' : 'Your account has been locked' 
        });
        return;
      }
      
      // Attach user to request
      req.user = {
        userId: user.id,
        role: user.role
      };
      
      // Update last active timestamp
      await db.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });
      
      next();
    } catch (tokenError) {
      // Check if token is expired
      if (tokenError instanceof jwt.TokenExpiredError) {
        // Try to use refresh token
        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
        
        if (!refreshToken) {
          res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
          return;
        }
        
        // Store refresh token for the token refresh endpoint
        req.refreshToken = refreshToken;
        
        // Redirect to token refresh logic
        return refreshAccessToken(req, res, next);
      }
      
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Authorize based on user role
 */
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    
    next();
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required' });
      return;
    }
    
    // Find the refresh token in database
    const tokenRecord = await (db as any).refreshToken.findFirst({
      where: { 
        token: refreshToken,
        revoked: false 
      }
    });
    
    if (!tokenRecord) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }
    
    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Remove expired token
      await (db as any).refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true }
      });
      
      res.status(401).json({ success: false, message: 'Refresh token expired' });
      return;
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;
      
      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        JWT_SECRET,
        <jwt.SignOptions>{ expiresIn: JWT_EXPIRES_IN }
      );
      
      // Send new access token
      res.setHeader('x-new-access-token', newAccessToken);
      
      // Get user for the middleware
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }
      
      // Attach user to request
      req.user = {
        userId: user.id,
        role: user.role
      };
      
      next();
    } catch (error) {
      // Invalid refresh token
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh error' });
  }
};


// Separate endpoint for explicitly refreshing token
export const handleTokenRefresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }
    
    // Find token in database
    const tokenRecord = await (db as any).refreshToken.findFirst({
      where: { 
        token: refreshToken,
        revoked: false 
      }
    });
    
    if (!tokenRecord) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }
    
    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Remove expired token
      await (db as any).refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true }
      });
      
      res.status(401).json({ success: false, message: 'Refresh token expired' });
      return;
    }
    
    // Verify and generate new tokens
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      <jwt.SignOptions>{ expiresIn: JWT_EXPIRES_IN }
    );
  
    // Send new access token
    res.setHeader('x-new-access-token', newAccessToken);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh error' });
  }
};