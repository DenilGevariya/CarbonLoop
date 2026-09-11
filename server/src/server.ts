import app from './app';
import { env } from './config/env';
import { checkDatabaseHealth } from './config/database';

const PORT = parseInt(env.PORT, 10) || 5000;

const server = app.listen(PORT, async () => {
  console.log(`
  🌐 ===================================================
  🚀 CarbonLoop API Server running on port ${PORT}
  📡 Environment: ${env.NODE_ENV}
  🔗 API URL: http://localhost:${PORT}/api/v1
  🏥 Health Check: http://localhost:${PORT}/api/v1/health
  ===================================================
  `);

  const dbStatus = await checkDatabaseHealth();
  if (dbStatus.status === 'healthy') {
    console.log(`✅ Database connection verified: ${dbStatus.details} (${dbStatus.latencyMs}ms)`);
  } else {
    console.error(`⚠️ Database connection warning: ${dbStatus.details}`);
  }
});

export default server;
