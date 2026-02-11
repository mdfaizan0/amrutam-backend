import { query } from '../../config/database';

export interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    start_time: Date;
    end_time: Date;
    is_booked: boolean;
}

export class AvailabilityRepository {
    async createSlots(doctor_id: string, slots: { start_time: Date; end_time: Date }[]) {
        const values: any[] = [];
        const queryParts = slots.map((slot, i) => {
            values.push(doctor_id, slot.start_time, slot.end_time);
            return `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`;
        });

        const sql = `
      INSERT INTO availability_slots (doctor_id, start_time, end_time)
      VALUES ${queryParts.join(', ')}
      ON CONFLICT (doctor_id, start_time) DO NOTHING
      RETURNING *
    `;

        const result = await query(sql, values);
        return result.rows;
    }

    async getDoctorAvailability(doctor_id: string, start?: Date, end?: Date) {
        let sql = 'SELECT * FROM availability_slots WHERE doctor_id = $1 AND is_booked = FALSE';
        const params: any[] = [doctor_id];

        if (start) {
            sql += ' AND start_time >= $2';
            params.push(start);
        }
        if (end) {
            sql += ` AND end_time <= $${params.length + 1}`;
            params.push(end);
        }

        sql += ' ORDER BY start_time ASC';
        const result = await query(sql, params);
        return result.rows;
    }

    async findById(id: string): Promise<AvailabilitySlot | null> {
        const result = await query('SELECT * FROM availability_slots WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async markAsBooked(id: string, client?: any) {
        const executor = client || { query };
        await executor.query('UPDATE availability_slots SET is_booked = TRUE WHERE id = $1', [id]);
    }
}

export default new AvailabilityRepository();
