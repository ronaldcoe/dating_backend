import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRegistration, validateLogin } from '../utils/validators';

export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate registration data
      const { error, value } = validateRegistration(req.body);
      if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
      }
      
      // Register user
      const result = await AuthService.register(value);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to register user',
      });
    }
  }
  
  /**
   * Login user
   * @route POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate login data
      const { error, value } = validateLogin(req.body);
      if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
      }
      
      // Login user
      const result = await AuthService.login(value, req);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to login',
      });
    }
  }

  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const newToken = res.getHeader('x-new-access-token');
      
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        ...(newToken ? { token: newToken } : {})
      });
    } catch (error) {
      console.error('Error in verifyToken controller:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while verifying token'
      });
    }
  }
}