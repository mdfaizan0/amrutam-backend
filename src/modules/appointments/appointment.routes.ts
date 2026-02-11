import { Router } from 'express';
import appointmentController from './appointment.controller';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post(
    '/book',
    authenticate,
    authorize(['patient']),
    appointmentController.book
);

router.get(
    '/me',
    authenticate,
    appointmentController.getMy
);

export default router;
