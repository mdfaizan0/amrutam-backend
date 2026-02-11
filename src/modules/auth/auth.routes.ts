import { Router } from 'express';
import authController from './auth.controller';
import { authLimiter } from '../../common/middlewares/rate-limit.middleware';

const router = Router();

router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
