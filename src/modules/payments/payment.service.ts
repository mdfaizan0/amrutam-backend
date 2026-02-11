import { query } from '../../config/database';
import auditService from '../../common/utils/audit.service';

export class PaymentService {
    async capturePayment(consultation_id: string, patient_id: string, amount: number) {
        // 1. Verify consultation exists and belongs to the patient
        const consultResult = await query(
            'SELECT * FROM consultations WHERE id = $1 AND patient_id = $2',
            [consultation_id, patient_id]
        );
        const consultation = consultResult.rows[0];

        if (!consultation) {
            throw { status: 404, message: 'Consultation not found or access denied' };
        }

        // 2. Simulate Payment Provider Interaction (e.g., Razorpay/Stripe)
        const providerTransactionId = `txn_${Math.random().toString(36).substring(7)}`;

        // 3. Record Payment
        const paymentResult = await query(
            `INSERT INTO payments (consultation_id, amount, status, provider_transaction_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [consultation_id, amount, 'captured', providerTransactionId]
        );

        // 4. Update Consultation Status (optional, e.g., to 'paid' if we had that status)
        // For now, we'll just log it

        // 5. Audit Trail
        await auditService.log(patient_id, 'CAPTURE_PAYMENT', 'payment', paymentResult.rows[0].id, {
            consultation_id,
            amount,
            providerTransactionId
        });

        return paymentResult.rows[0];
    }

    async getConsultationPayment(consultation_id: string, user_id: string) {
        const result = await query(
            `SELECT p.* FROM payments p 
             JOIN consultations c ON p.consultation_id = c.id
             WHERE p.consultation_id = $1 AND (c.patient_id = $2 OR c.doctor_id = $2)`,
            [consultation_id, user_id]
        );
        return result.rows[0];
    }
}

export default new PaymentService();
