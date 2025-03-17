import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { ReportController } from '@/controllers/report.controller';

const router = Router()

router.post('/new', authenticate, ReportController.createReport);

export default router