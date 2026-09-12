import { checkDatabaseHealth, closePool } from '../config/database';

async function runHealthCheck() {
  console.log('🩺 Performing CarbonLoop Database Health Check...');
  const health = await checkDatabaseHealth();
  
  if (health.status === 'healthy') {
    console.log('✅ Database Health: HEALTHY');
    console.log(`📊 Database Name : ${health.databaseName}`);
    console.log(`🏷️  Server Version: ${health.version}`);
    console.log(`⏱️  Query Latency : ${health.latencyMs}ms`);
    console.log(`📝 Details       : ${health.details}`);
  } else {
    console.error('❌ Database Health: UNHEALTHY');
    console.error('🚨 Error Details :', health.details);
    process.exitCode = 1;
  }

  await closePool();
}

runHealthCheck().catch((err) => {
  console.error('❌ Health check runner failed:', err);
  process.exit(1);
});
