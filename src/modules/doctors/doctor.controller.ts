import { Request, Response, NextFunction } from 'express';
import doctorService from './doctor.service';

export class DoctorController {
    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const doctors = await doctorService.searchDoctors(req.query);
            res.status(200).json({
                success: true,
                data: doctors
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor = await doctorService.getDoctorDetails(req.params.id as string);
            res.status(200).json({
                success: true,
                data: doctor
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DoctorController();
