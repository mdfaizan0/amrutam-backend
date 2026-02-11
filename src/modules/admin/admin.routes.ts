import { Router } from 'express';
import adminController from './admin.controller';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

// Secure these routes for Admin only
router.use(authenticate, authorize(['admin']));

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getStats);

export default router;
