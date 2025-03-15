import { User, Role, UserStatus, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { db } from '../lib/db';
import { hashPassword } from '@/utils/hash-password.utils';
import { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN } from '../config';
import { 
  createUser, 
  findUserByEmail, 
  findUserById, 
  updateUserProfile } 
from '@/models/user.model';
import { hash } from 'crypto';

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  birthDate?: Date;
  gender?: Gender;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string
}



export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterUserData): Promise<AuthResponse> {
    const { email, password } = userData;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    const user = await createUser({
      ...userData,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = AuthService.generateToken(user.id);
    const refreshToken = AuthService.generateRefreshToken(user.id)
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }
  
  /**
   * Login user
   */
  static async login(loginData: LoginData, req: Request): Promise<AuthResponse> {
    const { email, password } = loginData;
    
    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if user is banned
    if (user.status === UserStatus.BANNED) {
      throw new Error('Your account has been banned');
    }
    
    // Check if user is locked
    if (user.status === UserStatus.LOCKED) {
      throw new Error('Your account has been locked');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last active
    await db.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });
    
    // Generate JWT token
    const token = AuthService.generateToken(user.id);

    // Delete all refresh tokens when user signs in
    await db.refreshToken.deleteMany({
      where: {
        userId: user.id
      }
    })

    // Generate new refresh token
    const refreshToken = AuthService.generateRefreshToken(user.id)
    
    const deviceInfo = req.headers['user-agent'] || 'unknown device';
    
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        deviceInfo: deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Generate JWT token
   */
  private static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, <jwt.SignOptions>{
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Generate Reset Token
   */
  private static generateRefreshToken(userId: number):string {
    return jwt.sign({ userId }, JWT_SECRET, <jwt.SignOptions>{
      expiresIn: REFRESH_EXPIRES_IN,
    });
  }
}