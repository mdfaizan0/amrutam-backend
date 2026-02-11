import { Queue, Worker } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailQueue = new Queue('email-queue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    }
});

// Worker Setup
export const emailWorker = new Worker('email-queue', async job => {
    console.log(`[Job ${job.id}] Processing email to: ${job.data.to}`);

    // Simulate potential failure
    if (Math.random() < 0.1) {
        throw new Error('Random connection failure to email provider');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[Job ${job.id}] Email sent successfully!`);
}, {
    connection,
    limiter: {
        max: 10,
        duration: 1000,
    }
});

emailWorker.on('completed', job => {
    console.log(`[Job ${job.id}] Completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[Job ${job?.id}] Failed: ${err.message}`);
});

export default emailQueue;
