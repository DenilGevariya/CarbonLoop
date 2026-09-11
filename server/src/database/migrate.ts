import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  console.log('🚀 Running PostgreSQL database migrations...');
  const client = await pool.connect();

  try {
    // 1. Ensure tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Fetch already applied migrations
    const { rows: applied } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations;'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    // 3. Find migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('ℹ️ No migrations directory found.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏩ Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`⚡ Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1);',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Applied migration successfully: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed migration ${file}:`, err);
        throw err;
      }
    }

    console.log(`🎉 Migrations complete! Total applied in this run: ${appliedCount}`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('❌ Migration process failed:', err);
  process.exit(1);
});
