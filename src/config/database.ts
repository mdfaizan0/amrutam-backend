import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const runMigrations = async () => {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // Find migrations file in either src (dev) or dist (prod)
        const possiblePaths = [
            path.join(process.cwd(), 'src/config/migrations.sql'),
            path.join(process.cwd(), 'dist/config/migrations.sql'),
            path.join(process.cwd(), 'config/migrations.sql'),
            '/usr/src/app/dist/config/migrations.sql' // Hardcoded fallback for Docker
        ];

        const migrationPath = possiblePaths.find(p => fs.existsSync(p));

        if (!migrationPath) {
            throw new Error('Migrations file not found in any expected location');
        }

        const sql = fs.readFileSync(migrationPath, 'utf-8');
        await pool.query(sql);
        console.log('✅ Database migrations applied successfully');
    } catch (error) {
        console.error('❌ Migration Error:', error);
        throw error;
    }
};

export default pool;
