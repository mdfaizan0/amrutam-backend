import { Request, Response, NextFunction } from 'express';
import paymentService from './payment.service';

export class PaymentController {
    capture = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { consultation_id, amount } = req.body;
            const patient_id = (req as any).user.id;

            const payment = await paymentService.capturePayment(consultation_id, patient_id, amount);

            res.status(201).json({
                success: true,
                message: 'Payment captured successfully',
                data: payment
            });
        } catch (error) {
            next(error);
        }
    };

    getStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user_id = (req as any).user.id;

            const payment = await paymentService.getConsultationPayment(id as string, user_id);

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new PaymentController();
