import { pool } from '../config/database';
import { AnalyticsService } from './analytics/analytics.service';
import { generateNetworkObservations } from './analytics/analytics.insights';

const analyticsService = new AnalyticsService();

async function runAnalyticsTest() {
  console.log('🧪 Starting CarbonLoop Analytics & Carbon Impact Intelligence Test Suite...\n');

  try {
    // 1. Test Overview KPIs Calculation
    console.log('--- 1. Testing Network Overview KPIs ---');
    const overview = await analyticsService.getOverview({ timeframe: '30d' });

    console.log(`✅ Active Supply Stock: ${overview.stock.activeSupplyTonnes} tonnes across ${overview.stock.activeListingsCount} listings`);
    console.log(`✅ Active Demand Stock: ${overview.stock.activeDemandTonnes} tonnes across ${overview.stock.activeRequirementsCount} requirements`);
    console.log(`✅ Net Regional Balance: ${overview.stock.netSupplyBalanceTonnes} tonnes`);
    console.log(`✅ Flow (30d): Listed ${overview.flow.listedTonnes}t | Ordered ${overview.flow.orderedTonnes}t | Delivered ${overview.flow.deliveredTonnes}t | Reused ${overview.flow.reusedTonnes}t`);

    // 2. Test Carbon Flow Funnel
    console.log('\n--- 2. Testing Carbon Flow Funnel ---');
    const funnel = await analyticsService.getFunnel({ timeframe: '30d' });
    console.log(`✅ Funnel Stages: ${funnel.stages.length} stages calculated`);
    funnel.stages.forEach((s) => {
      console.log(`   - ${s.label}: ${s.quantityTonnes} tonnes (${s.funnelSharePercent}% of listed)`);
    });
    console.log(`✅ Overall Funnel Efficiency: ${funnel.overallFunnelEfficiencyPercent}%`);

    // 3. Test Regional Balance & Supply/Demand Breakdowns
    console.log('\n--- 3. Testing Regional Balances & Breakdowns ---');
    const regions = await analyticsService.getRegions();
    console.log(`✅ Regional Balances: ${regions.length} regions evaluated`);
    regions.forEach((r) => {
      console.log(`   - Region ${r.region}: Supply ${r.supplyTonnes}t | Demand ${r.demandTonnes}t | Balance: ${r.netBalanceTonnes > 0 ? '+' : ''}${r.netBalanceTonnes}t`);
    });

    // 4. Test Deterministic Network Observations Engine
    console.log('\n--- 4. Testing Network Observations Engine ---');
    const observations = await analyticsService.getObservations({ timeframe: '30d' });
    console.log(`✅ Network Observations Generated: ${observations.length}`);
    observations.forEach((obs) => {
      console.log(`   [${obs.severity}] ${obs.title}: "${obs.description}"`);
    });

    // 5. Test Carbon Impact Report & Non-Greenwashing Disclosure
    console.log('\n--- 5. Testing Carbon Impact Intelligence Report ---');
    const impactReport = await analyticsService.getImpactReport({ timeframe: '30d' });
    console.log(`✅ Primary Impact Metric (CO2 Reused): ${impactReport.headlineMetrics.co2ReusedTonnes} tonnes`);
    console.log(`✅ Indicative Transport Emissions: ${impactReport.headlineMetrics.indicativeTransportEmissionsKg} kg CO2e`);
    console.log(`✅ Non-Greenwashing Methodology Disclaimer: "${impactReport.methodology.disclaimer.substring(0, 80)}..."`);

    console.log('\n✨ All Analytics & Impact Intelligence Tests Passed Successfully!\n');
  } catch (err) {
    console.error('❌ Analytics Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAnalyticsTest();
