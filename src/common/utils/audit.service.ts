import { query } from '../../config/database';

export class AuditService {
    async log(actor_id: string | null, action: string, target_type: string, target_id: string, payload?: any) {
        try {
            await query(
                'INSERT INTO audit_logs (actor_id, action, target_type, target_id, payload) VALUES ($1, $2, $3, $4, $5)',
                [actor_id, action, target_type, target_id, payload ? JSON.stringify(payload) : null]
            );
        } catch (error) {
            console.error('Audit Log Error:', error);
            // We don't throw here to avoid failing the main operation if audit logging fails, 
            // but in a strict compliance environment, you might want to.
        }
    }
}

export default new AuditService();
