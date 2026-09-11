import fs from 'fs';
import path from 'path';
import { pool, closePool } from '../config/database';

async function checkStatus() {
  console.log('📋 Checking PostgreSQL Database Migration Status...');

  const client = await pool.connect();
  try {
    // 1. Ensure tracking table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Tracking table "schema_migrations" does not exist yet. No migrations applied.');
      return;
    }

    // 2. Query applied migrations
    const { rows: applied } = await client.query<{ filename: string; applied_at: Date }>(
      'SELECT filename, applied_at FROM schema_migrations ORDER BY filename;'
    );
    const appliedMap = new Map(applied.map((r) => [r.filename, r.applied_at]));

    // 3. Find files on disk
    const migrationsDir = path.join(__dirname, 'migrations');
    const filesOnDisk = fs.existsSync(migrationsDir)
      ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
      : [];

    console.log('\n=============================================================');
    console.log(' MIGRATION STATUS REPORT');
    console.log('=============================================================');

    if (filesOnDisk.length === 0) {
      console.log('No migration files found on disk.');
    } else {
      for (const file of filesOnDisk) {
        const isApplied = appliedMap.has(file);
        const appliedAt = isApplied ? appliedMap.get(file)?.toISOString() : 'PENDING';
        const badge = isApplied ? '✅ [APPLIED]' : '⏳ [PENDING]';
        console.log(`${badge} ${file.padEnd(35)} (Applied: ${appliedAt})`);
      }
    }

    console.log('=============================================================\n');
    console.log(`Total Migration Files: ${filesOnDisk.length}`);
    console.log(`Applied: ${applied.length} | Pending: ${filesOnDisk.length - applied.length}`);

  } finally {
    client.release();
    await closePool();
  }
}

checkStatus().catch((err) => {
  console.error('❌ Migration status check failed:', err);
  process.exit(1);
});
