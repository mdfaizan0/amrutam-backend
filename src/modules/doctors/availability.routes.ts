import { Router } from 'express';
import availabilityController from './availability.controller';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(['doctor']),
    availabilityController.setAvailability
);

router.get('/:doctorId', availabilityController.getAvailability);

export default router;
