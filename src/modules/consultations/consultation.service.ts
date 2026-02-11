import { query } from '../../config/database';
import auditService from '../../common/utils/audit.service';

export class ConsultationService {
    async getConsultation(id: string, user: { id: string, role: string }) {
        const result = await query(
            `SELECT c.*, p.full_name as patient_name, d.full_name as doctor_name 
       FROM consultations c 
       JOIN profiles p ON c.patient_id = p.user_id 
       JOIN profiles d ON c.doctor_id = d.user_id 
       WHERE c.id = $1`,
            [id]
        );

        const consultation = result.rows[0];
        if (!consultation) throw { status: 404, message: 'Consultation not found' };

        // Security: Only involved parties or Admin can view
        if (user.role !== 'admin' && consultation.patient_id !== user.id && consultation.doctor_id !== user.id) {
            throw { status: 403, message: 'Forbidden' };
        }

        // Append to audit log (Compliance)
        await auditService.log(user.id, 'VIEW_CONSULTATION', 'consultation', id);

        return consultation;
    }

    async addPrescription(consultation_id: string, doctor_id: string, medication_details: string) {
        const result = await query('SELECT * FROM consultations WHERE id = $1', [consultation_id]);
        const consultation = result.rows[0];

        if (!consultation) throw { status: 404, message: 'Consultation not found' };
        if (consultation.doctor_id !== doctor_id) throw { status: 403, message: 'Only the assigned doctor can prescribe' };

        await query(
            'INSERT INTO prescriptions (consultation_id, medication_details) VALUES ($1, $2)',
            [consultation_id, medication_details]
        );

        await query('UPDATE consultations SET status = $1 WHERE id = $2', ['completed', consultation_id]);

        await auditService.log(doctor_id, 'ISSUE_PRESCRIPTION', 'consultation', consultation_id, { medication_details });

        return { message: 'Prescription issued successfully' };
    }
}

export default new ConsultationService();
