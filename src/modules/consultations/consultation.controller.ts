import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import consultationService from './consultation.service';

export class ConsultationController {
    async getOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await consultationService.getConsultation(req.params.id as string, req.user!);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async prescribe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await consultationService.addPrescription(req.params.id as string, req.user!.id, req.body.medication_details);
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    }
}

export default new ConsultationController();
