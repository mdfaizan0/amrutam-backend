import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);

        logger.info('API_METRICS', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${timeInMs}ms`,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
    });

    next();
};
