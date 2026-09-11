import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

const poolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT, 10),
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
      console.log(`⏱️ SQL Query executed in ${duration}ms: ${text.substring(0, 80).replace(/\s+/g, ' ')}...`);
    }
    return res;
  } catch (error) {
    console.error('❌ Database Query Error:', { text, error });
    throw error;
  }
}

export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; databaseName?: string; version?: string; details?: string }> {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version();');
    const latencyMs = Date.now() - start;
    const dbName = res.rows[0]?.db_name;
    const fullVersion = res.rows[0]?.version || '';
    const versionMatch = fullVersion.match(/PostgreSQL\s+([\d\.]+)/i);
    const version = versionMatch ? versionMatch[1] : fullVersion.substring(0, 30);
    
    return {
      status: 'healthy',
      latencyMs,
      databaseName: dbName,
      version,
      details: `Connected to PostgreSQL ${version} (${dbName}) in ${latencyMs}ms`
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: error?.message || 'Connection failed'
    };
  }
}

export async function closePool(): Promise<void> {
  console.log('🔌 Closing PostgreSQL connection pool...');
  await pool.end();
  console.log('✅ Connection pool closed.');
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
