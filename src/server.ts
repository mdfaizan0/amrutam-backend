import app from './app';
import pool from './config/database';
import redis from './config/redis';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Verify DB Connection
        await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL Database connected');

        // Run Migrations
        const { runMigrations } = await import('./config/database.js');
        await runMigrations();

        // Redis is handled by its own listeners in config/redis

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing connections...');
    await pool.end();
    redis.quit();
    process.exit(0);
});
