import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';
import redis from '../src/config/redis';
import { emailQueue, emailWorker } from '../src/config/queues';

describe('Amrutam API Integration Tests', () => {
    let token: string;
    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Test User',
        phone: '1234567890',
        role: 'patient'
    };

    afterAll(async () => {
        try {
            // Cleanup: Delete the test user
            if (testUser.email) {
                await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]).catch(() => { });
            }
        } finally {
            // Explicitly close all connections to avoid "Open Handles"
            await pool.end().catch(() => { });
            await redis.quit().catch(() => { });
            await emailQueue.close().catch(() => { });
            await emailWorker.close().catch(() => { });
        }
    });

    describe('System Health', () => {
        it('should return 200 OK from health check', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    describe('Authentication Flow', () => {
        it('should successfully register a new patient', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            if (res.status !== 201) {
                console.error('Registration failed:', res.body);
            }
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            token = res.body.data.token;
        });

        it('should successfully login the registered patient', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            if (res.status !== 200) {
                console.error('Login failed:', res.body);
            }
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });
    });
});
