import { AdminService } from '../admin.service';
import { validateOrganizationStatusChange, validateAlertResolution } from '../admin.validation';

async function runAdminTestSuite() {
  console.log('🧪 Running CarbonLoop Admin Command Center Unit & Validation Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, failureDetail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${failureDetail}`);
      failed++;
    }
  }

  // 1. Validation logic tests
  const validActive = validateOrganizationStatusChange({ status: 'ACTIVE' });
  assert(validActive.valid === true && validActive.status === 'ACTIVE', 'Validates ACTIVE organization status change');

  const invalidSuspended = validateOrganizationStatusChange({ status: 'SUSPENDED' });
  assert(
    invalidSuspended.valid === false && (invalidSuspended.error || '').includes('suspension reason is required'),
    'Rejects SUSPENDED status without suspension reason'
  );

  const validSuspended = validateOrganizationStatusChange({
    status: 'SUSPENDED',
    reason: 'Compliance audit pending',
  });
  assert(
    validSuspended.valid === true && validSuspended.reason === 'Compliance audit pending',
    'Accepts SUSPENDED status with non-empty reason'
  );

  const validAlertRes = validateAlertResolution({ notes: 'Verified pressure telemetry sensor.' });
  assert(validAlertRes.valid === true && validAlertRes.notes === 'Verified pressure telemetry sensor.', 'Validates alert resolution payload');

  // 2. Service & Aggregations
  const service = new AdminService();

  try {
    const health = await service.getNetworkHealth();
    assert(health.databaseStatus === 'HEALTHY', 'Network health database status is HEALTHY');
    assert(health.uptimeSeconds >= 0, 'Network health uptime is positive integer');

    const kpis = await service.getOverviewKPIs();
    assert(kpis.activeOrganizationsCount >= 0, 'Overview KPI activeOrganizationsCount is non-negative');
    assert(typeof kpis.availableSupplyTonnes === 'number', 'Overview KPI availableSupplyTonnes is numeric');

    const searchRes = await service.searchGlobal('TerraCem');
    assert(Array.isArray(searchRes), 'Global search returns results array');
  } catch (err: any) {
    assert(false, 'Admin service operations completed without throwing errors', err.message);
  }

  console.log(`\n===================================================`);
  console.log(`📊 Admin Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminTestSuite();
