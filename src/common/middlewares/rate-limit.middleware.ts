import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../../config/redis';

const apiLimiterInstance = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-ignore
        sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    }),
});

export const apiLimiter = (req: any, res: any, next: any) => {
    if (process.env.NODE_ENV === 'test') return next();
    return apiLimiterInstance(req, res, next);
};

// Stricter limiter for sensitive auth endpoints
const authLimiterInstance = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    message: 'Too many authentication attempts, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-ignore
        sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    }),
});

export const authLimiter = (req: any, res: any, next: any) => {
    if (process.env.NODE_ENV === 'test') return next();
    return authLimiterInstance(req, res, next);
};
