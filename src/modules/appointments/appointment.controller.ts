import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import appointmentService from './appointment.service';

export class AppointmentController {
    async book(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await appointmentService.bookAppointment(req.user!.id, req.body.slot_id);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Appointment booked successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getMy(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await appointmentService.getMyAppointments(req.user!.id);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AppointmentController();
