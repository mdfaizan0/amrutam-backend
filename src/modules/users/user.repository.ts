import { query } from '../../config/database';

export interface User {
    id: string;
    email: string;
    password_hash: string;
    role: 'patient' | 'doctor' | 'admin';
    created_at?: Date;
}

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    async create(user: Partial<User>): Promise<User> {
        const result = await query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
            [user.email, user.password_hash, user.role]
        );
        return result.rows[0];
    }

    async createProfile(userId: string, fullName: string, phone: string, client?: any) {
        const executor = client || { query };
        await executor.query(
            'INSERT INTO profiles (user_id, full_name, phone) VALUES ($1, $2, $3)',
            [userId, fullName, phone]
        );
    }

    async createDoctorProfile(userId: string, specialization: string, fee: number, client?: any) {
        const executor = client || { query };
        await executor.query(
            'INSERT INTO doctor_profiles (user_id, specialization, consultation_fee) VALUES ($1, $2, $3)',
            [userId, specialization, fee]
        );
    }
}

export default new UserRepository();
