import { Router } from 'express';
import consultationController from './consultation.controller';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

router.get('/:id', authenticate, consultationController.getOne);

router.post(
    '/:id/prescribe',
    authenticate,
    authorize(['doctor']),
    consultationController.prescribe
);

export default router;
