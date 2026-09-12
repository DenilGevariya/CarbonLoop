import { query } from '../../config/database';
import { GlobalSearchResultItem } from './admin.types';

export async function searchGlobalAdmin(searchQuery: string): Promise<GlobalSearchResultItem[]> {
  if (!searchQuery || searchQuery.trim().length === 0) return [];
  const term = `%${searchQuery.trim()}%`;
  const results: GlobalSearchResultItem[] = [];

  // 1. Search Organizations
  const orgsRes = await query(
    `SELECT id, name, slug, org_type as "orgType", verification_status as status, city, state
     FROM organizations
     WHERE name ILIKE $1 OR slug ILIKE $1 OR city ILIKE $1 OR state ILIKE $1
     LIMIT 5`,
    [term]
  );
  orgsRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'ORGANIZATION',
      title: r.name,
      subtitle: `${r.orgType} • ${r.city || 'Gujarat'}, ${r.state || 'India'}`,
      status: r.status,
      url: `/admin/organizations/${r.id}`,
    });
  });

  // 2. Search Facilities
  const facsRes = await query(
    `SELECT f.id, f.name, f.city, f.state, o.name as org_name
     FROM facilities f
     JOIN organizations o ON f.organization_id = o.id
     WHERE f.name ILIKE $1 OR f.city ILIKE $1 OR f.state ILIKE $1
     LIMIT 5`,
    [term]
  );
  facsRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'FACILITY',
      title: r.name,
      subtitle: `${r.org_name} • ${r.city}, ${r.state}`,
      url: `/admin/facilities/${r.id}`,
    });
  });

  // 3. Search CO2 Supply Listings
  const listingsRes = await query(
    `SELECT l.id, l.title, l.listing_code as "listingCode", l.status, l.purity_percentage as purity, o.name as org_name
     FROM co2_listings l
     JOIN organizations o ON l.organization_id = o.id
     WHERE l.title ILIKE $1 OR l.listing_code ILIKE $1
     LIMIT 5`,
    [term]
  );
  listingsRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'LISTING',
      title: `${r.listingCode} - ${r.title}`,
      subtitle: `${r.org_name} • Purity ${r.purity}%`,
      status: r.status,
      publicCode: r.listingCode,
      url: `/admin/supply/${r.listingCode || r.id}`,
    });
  });

  // 4. Search Demand Requirements
  const reqsRes = await query(
    `SELECT r.id, r.title, r.requirement_code as "requirementCode", r.status, o.name as org_name
     FROM buyer_requirements r
     JOIN organizations o ON r.organization_id = o.id
     WHERE r.title ILIKE $1 OR r.requirement_code ILIKE $1
     LIMIT 5`,
    [term]
  );
  reqsRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'REQUIREMENT',
      title: `${r.requirementCode || 'REQ'} - ${r.title}`,
      subtitle: `${r.org_name}`,
      status: r.status,
      publicCode: r.requirementCode,
      url: `/admin/demand`,
    });
  });

  // 5. Search Orders
  const ordersRes = await query(
    `SELECT o.id, o.order_number as "orderNumber", o.status, buyer.name as buyer_name, seller.name as seller_name
     FROM orders o
     JOIN organizations buyer ON o.buyer_organization_id = buyer.id
     JOIN organizations seller ON o.seller_organization_id = seller.id
     WHERE o.order_number ILIKE $1 OR o.id::text ILIKE $1
     LIMIT 5`,
    [term]
  );
  ordersRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'ORDER',
      title: `Order ${r.orderNumber}`,
      subtitle: `${r.buyer_name} ➔ ${r.seller_name}`,
      status: r.status,
      publicCode: r.orderNumber,
      url: `/admin/orders/${r.orderNumber}`,
    });
  });

  // 6. Search Shipments
  const shipmentsRes = await query(
    `SELECT s.id, s.shipment_number as "shipmentNumber", s.status, s.transport_mode as mode
     FROM shipments s
     WHERE s.shipment_number ILIKE $1 OR s.id::text ILIKE $1
     LIMIT 5`,
    [term]
  );
  shipmentsRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'SHIPMENT',
      title: `Shipment ${r.shipmentNumber}`,
      subtitle: `Mode: ${r.mode || 'ISO Tanker'}`,
      status: r.status,
      publicCode: r.shipmentNumber,
      url: `/admin/shipments/${r.shipmentNumber}`,
    });
  });

  // 7. Search Verification Requests
  const verifRes = await query(
    `SELECT vr.id, vr.verification_type as type, vr.status, o.name as org_name
     FROM verification_requests vr
     JOIN organizations o ON vr.organization_id = o.id
     WHERE vr.id::text ILIKE $1 OR vr.verification_type ILIKE $1
     LIMIT 5`,
    [term]
  );
  verifRes.rows.forEach((r) => {
    results.push({
      id: r.id,
      category: 'VERIFICATION',
      title: `Verification Request (${r.type})`,
      subtitle: `${r.org_name}`,
      status: r.status,
      url: `/admin/verification/${r.id}`,
    });
  });

  return results;
}
