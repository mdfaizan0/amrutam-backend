import { Request, Response, NextFunction } from 'express';
import adminService from './admin.service';

export class AdminController {
    async getAuditLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const logs = await adminService.getLogs(req.query);
            res.status(200).json({
                success: true,
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await adminService.getStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
