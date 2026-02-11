import { query } from '../../config/database';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    slot_id: string;
    scheduled_at: Date;
    status: 'confirmed' | 'cancelled';
}

export class AppointmentRepository {
    async createAppointment(data: Partial<Appointment>, client?: any) {
        const executor = client || { query };
        const result = await executor.query(
            `INSERT INTO appointments (patient_id, doctor_id, slot_id, scheduled_at) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [data.patient_id, data.doctor_id, data.slot_id, data.scheduled_at]
        );
        return result.rows[0];
    }

    async getPatientAppointments(patient_id: string) {
        const result = await query(
            `SELECT a.*, p.full_name as doctor_name, c.id as consultation_id
       FROM appointments a 
       JOIN profiles p ON a.doctor_id = p.user_id 
       LEFT JOIN consultations c ON a.id = c.appointment_id
       WHERE a.patient_id = $1 ORDER BY a.scheduled_at DESC`,
            [patient_id]
        );
        return result.rows;
    }
}

export default new AppointmentRepository();
