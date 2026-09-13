import { pool } from '../config/database';

async function main() {
  const tables = ['orders', 'shipments', 'logistics_quotes', 'verification_requests', 'co2_listings', 'buyer_requirements', 'users', 'organizations'];
  for (const t of tables) {
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [t]
    );
    console.log(`=== ${t} (${res.rows.length} columns) ===`);
    console.log(res.rows.map((r: any) => r.column_name).join(', '));
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
