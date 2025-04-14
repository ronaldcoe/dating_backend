import { Router } from 'express';
import { AdminReportController } from '@/controllers/admin/report.controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all reports with pagination
router.get('/', AdminReportController.getReports);
// Get report by ID
router.get('/:id', AdminReportController.getReportById);

export default router;