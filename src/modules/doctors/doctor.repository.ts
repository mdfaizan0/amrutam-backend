import { query } from '../../config/database';

export interface DoctorListItem {
    user_id: string;
    full_name: string;
    specialization: string;
    consultation_fee: number;
    bio: string;
}

export class DoctorRepository {
    async findDoctors(filters: { specialization?: string; minFee?: number; maxFee?: number; search?: string }) {
        let sql = `
            SELECT 
                u.id as user_id, 
                p.full_name, 
                dp.specialization, 
                dp.consultation_fee, 
                dp.bio
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'doctor'
        `;

        const params: any[] = [];
        let paramCount = 1;

        if (filters.specialization) {
            sql += ` AND dp.specialization ILIKE $${paramCount++}`;
            params.push(`%${filters.specialization}%`);
        }

        if (filters.minFee !== undefined) {
            sql += ` AND dp.consultation_fee >= $${paramCount++}`;
            params.push(filters.minFee);
        }

        if (filters.maxFee !== undefined) {
            sql += ` AND dp.consultation_fee <= $${paramCount++}`;
            params.push(filters.maxFee);
        }

        if (filters.search) {
            sql += ` AND (p.full_name ILIKE $${paramCount} OR dp.specialization ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
            paramCount++;
        }

        sql += ' ORDER BY p.full_name ASC';

        const result = await query(sql, params);
        return result.rows;
    }

    async findById(doctorId: string) {
        const sql = `
            SELECT 
                u.id as user_id, 
                p.full_name, 
                p.phone,
                dp.specialization, 
                dp.consultation_fee, 
                dp.bio
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN doctor_profiles dp ON u.id = dp.user_id
            WHERE u.id = $1 AND u.role = 'doctor'
        `;
        const result = await query(sql, [doctorId]);
        return result.rows[0];
    }
}

export default new DoctorRepository();
