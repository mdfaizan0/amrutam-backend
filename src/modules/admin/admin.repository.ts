import { query } from '../../config/database';

export class AdminRepository {
    async getAuditLogs(filters: { action?: string; userId?: string; targetType?: string }) {
        let sql = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: any[] = [];
        let paramCount = 1;

        if (filters.action) {
            sql += ` AND action = $${paramCount++}`;
            params.push(filters.action);
        }
        if (filters.userId) {
            sql += ` AND actor_id = $${paramCount++}`;
            params.push(filters.userId);
        }
        if (filters.targetType) {
            sql += ` AND target_type = $${paramCount++}`;
            params.push(filters.targetType);
        }

        sql += ' ORDER BY timestamp DESC LIMIT 100';
        const result = await query(sql, params);
        return result.rows;
    }

    async getSystemStats() {
        // High level stats for Admin dashboard
        const queries = [
            query('SELECT COUNT(*) FROM users WHERE role = $1', ['patient']),
            query('SELECT COUNT(*) FROM users WHERE role = $1', ['doctor']),
            query('SELECT COUNT(*) FROM consultations'),
            query('SELECT status, COUNT(*) FROM consultations GROUP BY status'),
            query('SELECT dp.specialization, COUNT(*) as count FROM consultations c JOIN doctor_profiles dp ON c.doctor_id = dp.user_id GROUP BY dp.specialization ORDER BY count DESC LIMIT 5'),
            query('SELECT DATE(created_at) as date, COUNT(*) FROM consultations GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7')
        ];

        const [patients, doctors, totalConsultations, statusBreakdown, topSpecializations, bookingTrends] = await Promise.all(queries);

        return {
            patients: parseInt(patients.rows[0].count),
            doctors: parseInt(doctors.rows[0].count),
            totalConsultations: parseInt(totalConsultations.rows[0].count),
            statusBreakdown: statusBreakdown.rows,
            topSpecializations: topSpecializations.rows,
            bookingTrends: bookingTrends.rows
        };
    }
}

export default new AdminRepository();
