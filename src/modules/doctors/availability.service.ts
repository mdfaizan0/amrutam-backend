import availabilityRepository from './availability.repository';
import auditService from '../../common/utils/audit.service';

export class AvailabilityService {
    async setAvailability(doctor_id: string, slots: { start_time: string; end_time: string }[]) {
        const formattedSlots = slots.map(s => ({
            start_time: new Date(s.start_time),
            end_time: new Date(s.end_time)
        }));

        const result = await availabilityRepository.createSlots(doctor_id, formattedSlots);

        // Audit Log (Compliance)
        await auditService.log(doctor_id, 'SET_AVAILABILITY', 'availability', doctor_id, { slot_count: result.length });

        return result;
    }

    async getAvailability(doctor_id: string) {
        return availabilityRepository.getDoctorAvailability(doctor_id, new Date());
    }
}

export default new AvailabilityService();
