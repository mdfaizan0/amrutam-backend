import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import availabilityService from './availability.service';

export class AvailabilityController {
    async setAvailability(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await availabilityService.setAvailability(req.user!.id, req.body.slots);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Availability slots updated'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAvailability(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await availabilityService.getAvailability(req.params.doctorId as string);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AvailabilityController();
