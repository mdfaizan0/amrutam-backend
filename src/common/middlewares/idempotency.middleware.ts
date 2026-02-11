import { Request, Response, NextFunction } from 'express';
import redis from '../../config/redis';

/**
 * Idempotency middleware to prevent duplicate processing of the same request.
 * Expects an 'X-Idempotency-Key' header.
 */
export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
    }

    const key = req.headers['x-idempotency-key'];
    if (!key) {
        return next(); // Or return 400 if you want to enforce it
    }

    const redisKey = `idempotency:${key}`;

    // Try to set the key. If it exists, it means the request is a duplicate or currently processing.
    const result = await redis.set(redisKey, 'PROCESSING', 'EX', 3600, 'NX');

    if (!result) {
        // Key already exists. Check if it has a stored response.
        const savedResponse = await redis.get(`${redisKey}:response`);
        if (savedResponse) {
            const { status, body } = JSON.parse(savedResponse);
            return res.status(status).json(body);
        }
        return res.status(429).json({
            success: false,
            error: { message: 'Request is already being processed', code: 'IDEMPOTENCY_CONFLICT' }
        });
    }

    // Intercept res.json to save the response
    const originalJson = res.json;
    res.json = function (body) {
        redis.set(`${redisKey}:response`, JSON.stringify({ status: res.statusCode, body }), 'EX', 3600);
        return originalJson.call(this, body);
    };

    next();
};
