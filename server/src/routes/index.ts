import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { query } from '../config/database';
import authRoutes from '../modules/auth/auth.routes';
import organizationRoutes from '../modules/organizations/organization.routes';
import userRoutes from '../modules/users/user.routes';
import listingRoutes from '../modules/listings/listing.routes';
import requirementRoutes from '../modules/requirements/requirements.routes';
import matchingRoutes from '../modules/matching/matching.routes';

import inquiryRoutes from '../modules/inquiries/inquiry.routes';
import offerRoutes from '../modules/offers/offer.routes';
import orderRoutes from '../modules/orders/order.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import logisticsRoutes from '../modules/logistics/logistics.routes';
import shipmentRoutes from '../modules/shipments/shipment.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

// Health Check Endpoint
router.get('/health', async (req, res, next) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const isHealthy = dbHealth.status === 'healthy';

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      service: 'carbonloop-api',
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    next(error);
  }
});

// Primary Feature Routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/requirements', requirementRoutes);
router.use('/matches', matchingRoutes);
router.use('/recommendations', matchingRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/offers', offerRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/analytics', analyticsRoutes);

// Placeholder Routes for remaining modules
const placeholderModules = [
  'facilities',
  'verification',
  'admin'
];

placeholderModules.forEach((mod) => {
  router.get(`/${mod}`, (req, res) => {
    res.json({
      success: true,
      module: mod,
      message: `CarbonLoop ${mod.toUpperCase()} API endpoint foundation ready.`
    });
  });
});

// Demo Data Endpoint for listings (queries real database)
router.get('/listings/public', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.purity_percentage as purity,
        l.price_per_ton as price,
        l.available_quantity_tons as quantity,
        l.state_form as state,
        o.name as organization,
        f.city || ', ' || f.state as location
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE l.status = 'ACTIVE'
      LIMIT 10;
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;
