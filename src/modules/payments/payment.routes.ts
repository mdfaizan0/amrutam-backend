import { Router } from 'express';
import paymentController from './payment.controller';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { idempotency } from '../../common/middlewares/idempotency.middleware';

const router = Router();

router.post(
    '/capture',
    authenticate,
    authorize(['patient']),
    idempotency,
    paymentController.capture
);

router.get(
    '/:id',
    authenticate,
    paymentController.getStatus
);

export default router;
