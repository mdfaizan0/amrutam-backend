import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import userRepository, { User } from '../users/user.repository';

export class AuthService {
    async register(data: any) {
        const { email, password, role, fullName, phone, specialization, fee } = data;

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw { status: 400, message: 'User already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create user
            const user = await userRepository.create({
                email,
                password_hash: hashedPassword,
                role
            });

            // Create profile
            await userRepository.createProfile(user.id, fullName, phone, client);

            // If doctor, create doctor profile
            if (role === 'doctor') {
                await userRepository.createDoctorProfile(user.id, specialization, fee, client);
            }

            await client.query('COMMIT');
            return this.generateToken(user);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        return this.generateToken(user);
    }

    private generateToken(user: User) {
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
        );
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    }
}

export default new AuthService();
