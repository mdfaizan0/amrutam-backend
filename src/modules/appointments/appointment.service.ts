import redis from '../../config/redis';
import pool from '../../config/database';
import appointmentRepository from './appointment.repository';
import availabilityRepository from '../doctors/availability.repository';
import auditService from '../../common/utils/audit.service';
import { emailQueue } from '../../config/queues';

export class AppointmentService {
    async bookAppointment(patient_id: string, slot_id: string) {
        const lockKey = `lock:slot:${slot_id}`;

        // 1. Acquire Distributed Lock (NX = Only if not exists, EX = Expire in 5s)
        const lock = await redis.set(lockKey, 'LOCKED', 'EX', 5, 'NX');

        if (!lock) {
            throw { status: 429, message: 'Slot is currently being processed by another user. Please retry.' };
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 2. Check if slot is still available
            const slot = await availabilityRepository.findById(slot_id);
            if (!slot) {
                throw { status: 404, message: 'Slot not found' };
            }
            if (slot.is_booked) {
                throw { status: 409, message: 'This slot has already been booked' };
            }

            // 3. Create Appointment
            const appointment = await appointmentRepository.createAppointment({
                patient_id,
                doctor_id: slot.doctor_id,
                slot_id: slot.id,
                scheduled_at: slot.start_time
            }, client);

            // 4. Mark Slot as Booked
            await availabilityRepository.markAsBooked(slot_id, client);

            // 5. Create Consultation Entry (Auto-link to appointment)
            const consultationResult = await client.query(
                'INSERT INTO consultations (patient_id, doctor_id, appointment_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
                [patient_id, slot.doctor_id, appointment.id, 'scheduled']
            );

            await client.query('COMMIT');

            // 6. Audit Log (Compliance)
            await auditService.log(patient_id, 'BOOK_APPOINTMENT', 'appointment', appointment.id, { slot_id });

            // 7. Async Job (Email notification)
            await emailQueue.add('appointment-confirmation', {
                to: 'patient@example.com', // In a real app, fetch from user repository
                subject: 'Booking Confirmed',
                body: `Your appointment with ID ${appointment.id} is confirmed.`
            });

            return { ...appointment, consultation_id: consultationResult.rows[0].id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
            // 5. Release Lock
            await redis.del(lockKey);
        }
    }

    async getMyAppointments(patient_id: string) {
        return appointmentRepository.getPatientAppointments(patient_id);
    }
}

export default new AppointmentService();
