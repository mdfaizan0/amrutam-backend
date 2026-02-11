import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import availabilityRoutes from './modules/doctors/availability.routes';
import doctorRoutes from './modules/doctors/doctor.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import consultationRoutes from './modules/consultations/consultation.routes';
import paymentRoutes from './modules/payments/payment.routes';
import adminRoutes from './modules/admin/admin.routes';
import { idempotency } from './common/middlewares/idempotency.middleware';
import { metricsMiddleware } from './common/middlewares/metrics.middleware';
import { apiLimiter } from './common/middlewares/rate-limit.middleware';

dotenv.config();

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Idempotency for all write operations (POST, PUT, PATCH)
app.use(idempotency);

// Observability & Metrics
app.use(metricsMiddleware);

// Rate Limiting
app.use('/api', apiLimiter);

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors/availability', availabilityRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
        },
    });
});

export default app;
