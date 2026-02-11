import { Router } from 'express';
import doctorController from './doctor.controller';

const router = Router();

router.get('/search', doctorController.search);
router.get('/:id', doctorController.getOne);

export default router;
