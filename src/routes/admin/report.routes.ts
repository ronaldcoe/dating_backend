import { Router } from 'express';
import { AdminReportController } from '@/controllers/admin/report.controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all reports with pagination
router.get('/', AdminReportController.getReports);
// Get report by ID
router.get('/:id', AdminReportController.getReportById);
// Update report status
router.patch('/:id', AdminReportController.updateReportStatus);

// Get reports by source user ID
router.get('/target/:userId', AdminReportController.getReportsByTargetUserId);

// Get reports by source user ID
router.get('/source/:userId', AdminReportController.getReportsBySourceUserId);

export default router;