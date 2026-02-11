import doctorRepository from './doctor.repository';
import { CacheService } from '../../common/utils/cache.service';

export class DoctorService {
    async searchDoctors(query: any) {
        const filters = {
            specialization: query.specialization as string,
            minFee: query.minFee ? parseFloat(query.minFee as string) : undefined,
            maxFee: query.maxFee ? parseFloat(query.maxFee as string) : undefined,
            search: query.search as string
        };

        const cacheKey = `doctors:search:${JSON.stringify(filters)}`;
        const cachedResults = await CacheService.get<any[]>(cacheKey);

        if (cachedResults) {
            return cachedResults;
        }

        const results = await doctorRepository.findDoctors(filters);
        await CacheService.set(cacheKey, results, 300); // Cache for 5 mins

        return results;
    }

    async getDoctorDetails(doctorId: string) {
        const cacheKey = `doctor:details:${doctorId}`;
        const cachedDoctor = await CacheService.get<any>(cacheKey);

        if (cachedDoctor) {
            return cachedDoctor;
        }

        const doctor = await doctorRepository.findById(doctorId);
        if (!doctor) {
            throw { status: 404, message: 'Doctor not found' };
        }

        await CacheService.set(cacheKey, doctor, 3600); // Cache for 1 hour

        return doctor;
    }
}

export default new DoctorService();
