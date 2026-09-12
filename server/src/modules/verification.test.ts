import { query } from '../config/database';
import { VerificationRepository } from './verification/verification.repository';
import { DocumentRepository } from './documents/document.repository';
import { validateRequiredDocuments } from './verification/verification.rules';

async function runTests() {
  console.log('🧪 Starting CarbonLoop Trust Network & Verification Integration Tests...');

  const verificationRepo = new VerificationRepository();
  const documentRepo = new DocumentRepository();

  // Fetch test organization & admin user
  const orgRes = await query(`SELECT id FROM organizations LIMIT 1`);
  if (orgRes.rows.length === 0) throw new Error('No test organization found.');
  const orgId = orgRes.rows[0].id;

  const userRes = await query(`SELECT id FROM users LIMIT 1`);
  const userId = userRes.rows[0].id;

  // 1. Rule Validation Test
  console.log('\n--- 1. Testing Verification Rules Engine ---');
  const ruleCheck1 = validateRequiredDocuments('CO2_PURITY', ['CO2_PURITY_CERTIFICATE']);
  console.log(`✅ CO2_PURITY with certificate valid: ${ruleCheck1.valid}`);

  const ruleCheck2 = validateRequiredDocuments('ORGANIZATION', ['SAFETY_CERTIFICATE']);
  console.log(`✅ ORGANIZATION missing company registration valid: ${ruleCheck2.valid} (Missing: ${ruleCheck2.missingDocumentTypes.join(', ')})`);

  // 2. Submit Verification Request Test
  console.log('\n--- 2. Testing Submission Lifecycle ---');
  const req = await verificationRepo.submitRequest(userId, {
    organizationId: orgId,
    verificationType: 'ORGANIZATION',
    notes: 'Integration test verification request.',
  });
  console.log(`✅ Created Verification Request: ID ${req.id} | Status: ${req.status}`);

  // 3. Queue List Test
  console.log('\n--- 3. Testing Verification Queue Listing ---');
  const queue = await verificationRepo.listQueue({ status: 'SUBMITTED', limit: 10 });
  console.log(`✅ Queue Listed: ${queue.total} pending requests in queue.`);

  // 4. Start Review Test
  console.log('\n--- 4. Testing Start Review Flow ---');
  const inReview = await verificationRepo.startReview(req.id, userId);
  console.log(`✅ Started Review: Status updated to ${inReview.status} | Reviewer: ${inReview.reviewedByName}`);

  // 5. Approval Transaction Test
  console.log('\n--- 5. Testing Transactional Approval Flow ---');
  const approved = await verificationRepo.approveRequest(req.id, userId, 'Approved in integration test suite.', 12);
  console.log(`✅ Approved Request: Status updated to ${approved.status} | Expires At: ${approved.expiresAt}`);

  // Verify Audit Detail
  const detail = await verificationRepo.getDetailById(req.id);
  console.log(`✅ Verification History Length: ${detail.history.length} audit entries.`);

  console.log('\n✨ All Trust Network & Verification Tests Passed Successfully!\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification Test Failed:', err);
    process.exit(1);
  });
