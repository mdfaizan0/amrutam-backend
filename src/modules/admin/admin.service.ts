import adminRepository from './admin.repository';

export class AdminService {
    async getLogs(query: any) {
        const filters = {
            action: query.action as string,
            userId: query.userId as string,
            targetType: query.targetType as string
        };
        return adminRepository.getAuditLogs(filters);
    }

    async getStats() {
        return adminRepository.getSystemStats();
    }
}

export default new AdminService();
