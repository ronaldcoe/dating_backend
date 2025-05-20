// src/middlewares/pagination.ts
import { Request, Response, NextFunction } from 'express';

interface PaginationOptions {
  maxLimit?: number;
  defaultLimit?: number;
  defaultPage?: number;
  validateSortBy?: string[];
}

export interface PaginatedRequest extends Request {
  pagination: {
    page: number;
    limit: number;
    sortOrder: string;
    sortBy: string;
  };
}

export const paginationMiddleware = (options: PaginationOptions = {}) => {
  const {
    maxLimit = 100,
    defaultLimit = 20,
    defaultPage = 1,
    validateSortBy = ['createdAt', 'updatedAt'],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(parseInt(req.query.page as string) || defaultPage, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || defaultLimit, 1),
      maxLimit
    );
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const validSortOrders = ['asc', 'desc'];

    // Validate sortBy field
    if (!validateSortBy.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sortBy field. Valid values are: ${validateSortBy.join(', ')}`
      });
    }

    // Validate sort order
    if (!validSortOrders.includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort order. Valid values are: ${validSortOrders.join(', ')}`
      });
    }

    // Add pagination info to the request object
    (req as PaginatedRequest).pagination = { page, limit, sortBy, sortOrder };

    next();
  };
};