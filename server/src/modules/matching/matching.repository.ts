import { query, pool } from '../../config/database';
import { EngineMatchOutput, CandidateListing, CandidateRequirement, StoredMatch } from './matching.types';

function parseNum(val: any, fallback = 0): number {
  if (val == null) return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function mapCandidateListing(row: any): CandidateListing {
  if (!row) return row;
  return {
    ...row,
    purity_percentage: parseNum(row.purity_percentage),
    available_quantity_tons: parseNum(row.available_quantity_tons),
    remaining_quantity: parseNum(row.remaining_quantity),
    minimum_order_tons: parseNum(row.minimum_order_tons, 1),
    price_per_ton: parseNum(row.price_per_ton),
    latitude: row.latitude != null ? parseNum(row.latitude) : null,
    longitude: row.longitude != null ? parseNum(row.longitude) : null,
  };
}

function mapCandidateRequirement(row: any): CandidateRequirement {
  if (!row) return row;
  return {
    ...row,
    required_purity_percentage: parseNum(row.required_purity_percentage, 99.0),
    maximum_purity_percentage: row.maximum_purity_percentage != null ? parseNum(row.maximum_purity_percentage) : null,
    required_quantity_tons: parseNum(row.required_quantity_tons, 100),
    target_price_per_ton: row.target_price_per_ton != null ? parseNum(row.target_price_per_ton) : null,
    max_distance_km: row.max_distance_km != null ? parseNum(row.max_distance_km) : null,
    latitude: row.latitude != null ? parseNum(row.latitude) : null,
    longitude: row.longitude != null ? parseNum(row.longitude) : null,
  };
}

function mapStoredMatch(row: any): StoredMatch {
  if (!row) return row;
  return {
    ...row,
    overall_score: parseNum(row.overall_score),
    quantity_score: parseNum(row.quantity_score),
    purity_score: parseNum(row.purity_score),
    physical_form_score: parseNum(row.physical_form_score, 100),
    availability_score: parseNum(row.availability_score, 90),
    price_score: parseNum(row.price_score),
    distance_score: parseNum(row.distance_score),
    logistics_score: parseNum(row.logistics_score, 90),
    utilization_score: parseNum(row.utilization_score, 90),
    estimated_distance_km: parseNum(row.estimated_distance_km, 100),
    estimated_transport_cost: parseNum(row.estimated_transport_cost),
    estimated_delivered_cost: parseNum(row.estimated_delivered_cost),
  };
}

export class MatchingRepository {
  /**
   * Fetch a single buyer requirement with location metadata
   */
  async getRequirementById(requirementId: string): Promise<CandidateRequirement | null> {
    const sql = `
      SELECT 
        r.id,
        r.organization_id,
        o.name as organization_name,
        r.facility_id,
        r.title,
        COALESCE(r.intended_use, 'Industrial Off-take') as intended_use,
        COALESCE(r.required_purity_percentage, r.minimum_purity, 99.0) as required_purity_percentage,
        r.maximum_purity as maximum_purity_percentage,
        COALESCE(r.preferred_state_form, r.acceptable_physical_form, 'ANY') as preferred_state_form,
        COALESCE(r.required_quantity_tons, r.required_quantity, 100) as required_quantity_tons,
        COALESCE(r.target_price_per_ton, r.maximum_price_per_unit) as target_price_per_ton,
        r.max_distance_km,
        COALESCE(r.required_by_date, r.required_from) as required_by_date,
        COALESCE(r.required_until) as required_until_date,
        COALESCE(f.latitude, o.latitude) as latitude,
        COALESCE(f.longitude, o.longitude) as longitude,
        COALESCE(r.location_city, f.city, o.city, 'Vadodara') as location_city,
        COALESCE(r.location_state, f.state, o.state, 'Gujarat') as location_state,
        r.status
      FROM buyer_requirements r
      JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN facilities f ON r.facility_id = f.id
      WHERE r.id = $1;
    `;

    const { rows } = await query<any>(sql, [requirementId]);
    return rows[0] ? mapCandidateRequirement(rows[0]) : null;
  }

  /**
   * Fetch a single supply listing with facility coordinates
   */
  async getListingById(listingId: string): Promise<CandidateListing | null> {
    const sql = `
      SELECT 
        l.id,
        l.organization_id,
        o.name as organization_name,
        l.facility_id,
        f.name as facility_name,
        l.title,
        l.purity_percentage,
        COALESCE(l.available_quantity_tons, l.available_quantity, 0) as available_quantity_tons,
        COALESCE(l.remaining_quantity, l.available_quantity_tons, l.available_quantity, 0) as remaining_quantity,
        COALESCE(l.minimum_order_tons, l.minimum_order_quantity, 1) as minimum_order_tons,
        COALESCE(l.price_per_ton, l.price_per_unit, 0) as price_per_ton,
        COALESCE(l.currency, 'INR') as currency,
        COALESCE(l.state_form, l.co2_physical_form, 'LIQUID') as state_form,
        COALESCE(l.availability_start_date, l.available_from) as availability_start_date,
        COALESCE(l.availability_end_date, l.available_until) as availability_end_date,
        COALESCE(f.latitude, o.latitude) as latitude,
        COALESCE(f.longitude, o.longitude) as longitude,
        COALESCE(f.city, o.city, 'Ahmedabad') as city,
        COALESCE(f.state, o.state, 'Gujarat') as state,
        l.status,
        COALESCE(f.capture_technology, 'Post-Combustion Solvent') as capture_technology,
        COALESCE(f.facility_type, 'Industrial Flue Gas') as capture_source
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE l.id = $1;
    `;

    const { rows } = await query<any>(sql, [listingId]);
    return rows[0] ? mapCandidateListing(rows[0]) : null;
  }

  /**
   * Fetch all active candidate listings for matching
   */
  async getActiveCandidateListings(limit = 100): Promise<CandidateListing[]> {
    const sql = `
      SELECT 
        l.id,
        l.organization_id,
        o.name as organization_name,
        l.facility_id,
        f.name as facility_name,
        l.title,
        l.purity_percentage,
        COALESCE(l.available_quantity_tons, l.available_quantity, 0) as available_quantity_tons,
        COALESCE(l.remaining_quantity, l.available_quantity_tons, l.available_quantity, 0) as remaining_quantity,
        COALESCE(l.minimum_order_tons, l.minimum_order_quantity, 1) as minimum_order_tons,
        COALESCE(l.price_per_ton, l.price_per_unit, 0) as price_per_ton,
        COALESCE(l.currency, 'INR') as currency,
        COALESCE(l.state_form, l.co2_physical_form, 'LIQUID') as state_form,
        COALESCE(l.availability_start_date, l.available_from) as availability_start_date,
        COALESCE(l.availability_end_date, l.available_until) as availability_end_date,
        COALESCE(f.latitude, o.latitude) as latitude,
        COALESCE(f.longitude, o.longitude) as longitude,
        COALESCE(f.city, o.city, 'Ahmedabad') as city,
        COALESCE(f.state, o.state, 'Gujarat') as state,
        l.status,
        COALESCE(f.capture_technology, 'Post-Combustion Solvent') as capture_technology,
        COALESCE(f.facility_type, 'Industrial Flue Gas') as capture_source
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE UPPER(l.status) IN ('ACTIVE', 'PUBLISHED')
        AND COALESCE(l.remaining_quantity, l.available_quantity_tons, l.available_quantity, 0) > 0
      LIMIT $1;
    `;

    const { rows } = await query<any>(sql, [limit]);
    return rows.map(mapCandidateListing);
  }

  /**
   * Fetch all active candidate requirements for matching
   */
  async getActiveCandidateRequirements(limit = 100): Promise<CandidateRequirement[]> {
    const sql = `
      SELECT 
        r.id,
        r.organization_id,
        o.name as organization_name,
        r.facility_id,
        r.title,
        COALESCE(r.intended_use, 'Industrial Off-take') as intended_use,
        COALESCE(r.required_purity_percentage, r.minimum_purity, 99.0) as required_purity_percentage,
        r.maximum_purity as maximum_purity_percentage,
        COALESCE(r.preferred_state_form, r.acceptable_physical_form, 'ANY') as preferred_state_form,
        COALESCE(r.required_quantity_tons, r.required_quantity, 100) as required_quantity_tons,
        COALESCE(r.target_price_per_ton, r.maximum_price_per_unit) as target_price_per_ton,
        r.max_distance_km,
        COALESCE(r.required_by_date, r.required_from) as required_by_date,
        COALESCE(r.required_until) as required_until_date,
        COALESCE(f.latitude, o.latitude) as latitude,
        COALESCE(f.longitude, o.longitude) as longitude,
        COALESCE(r.location_city, f.city, o.city, 'Vadodara') as location_city,
        COALESCE(r.location_state, f.state, o.state, 'Gujarat') as location_state,
        r.status
      FROM buyer_requirements r
      JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN facilities f ON r.facility_id = f.id
      WHERE UPPER(r.status) IN ('ACTIVE', 'PUBLISHED')
      LIMIT $1;
    `;

    const { rows } = await query<any>(sql, [limit]);
    return rows.map(mapCandidateRequirement);
  }

  /**
   * Upsert match result into database and populate match_scores audit rows
   */
  async upsertMatch(engineMatch: EngineMatchOutput): Promise<string> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const matchStatus = engineMatch.eligible ? 'SUGGESTED' : 'INELIGIBLE';

      // 1. Upsert Match Row
      const upsertSql = `
        INSERT INTO matches (
          requirement_id, listing_id, status, overall_score, overall_match_score,
          quantity_score, purity_score, physical_form_score, availability_score,
          price_score, distance_score, logistics_score, utilization_score,
          estimated_distance_km, estimated_transport_cost, estimated_delivered_cost,
          matching_reason, explanations, warnings, grade, generated_at, expires_at
        ) VALUES (
          $1, $2, $3, $4, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15,
          $16, $17::jsonb, $18::jsonb, $19, NOW(), NOW() + INTERVAL '24 hours'
        )
        ON CONFLICT (requirement_id, listing_id) DO UPDATE SET
          status = EXCLUDED.status,
          overall_score = EXCLUDED.overall_score,
          overall_match_score = EXCLUDED.overall_match_score,
          quantity_score = EXCLUDED.quantity_score,
          purity_score = EXCLUDED.purity_score,
          physical_form_score = EXCLUDED.physical_form_score,
          availability_score = EXCLUDED.availability_score,
          price_score = EXCLUDED.price_score,
          distance_score = EXCLUDED.distance_score,
          logistics_score = EXCLUDED.logistics_score,
          utilization_score = EXCLUDED.utilization_score,
          estimated_distance_km = EXCLUDED.estimated_distance_km,
          estimated_transport_cost = EXCLUDED.estimated_transport_cost,
          estimated_delivered_cost = EXCLUDED.estimated_delivered_cost,
          matching_reason = EXCLUDED.matching_reason,
          explanations = EXCLUDED.explanations,
          warnings = EXCLUDED.warnings,
          grade = EXCLUDED.grade,
          generated_at = NOW(),
          updated_at = NOW()
        RETURNING id;
      `;

      const explanationsList = Object.values(engineMatch.factorScores);

      const res = await client.query<{ id: string }>(upsertSql, [
        engineMatch.requirementId,
        engineMatch.listingId,
        matchStatus,
        engineMatch.overallScore,
        engineMatch.factorScores.quantity.score,
        engineMatch.factorScores.purity.score,
        engineMatch.factorScores.physicalForm.score,
        engineMatch.factorScores.availability.score,
        engineMatch.factorScores.price.score,
        engineMatch.factorScores.distance.score,
        engineMatch.factorScores.logistics.score,
        engineMatch.factorScores.utilization.score,
        engineMatch.logistics.distanceKm,
        engineMatch.logistics.estimatedTransportCost,
        engineMatch.logistics.indicativeDeliveredCostPerTonne,
        engineMatch.summaryReason,
        JSON.stringify(explanationsList),
        JSON.stringify(engineMatch.warnings),
        engineMatch.grade,
      ]);

      const matchId = res.rows[0].id;

      // 2. Refresh Match Scores Audit Rows
      await client.query('DELETE FROM match_scores WHERE match_id = $1;', [matchId]);

      for (const factorRes of explanationsList) {
        await client.query(
          `INSERT INTO match_scores (match_id, factor, score, weight, explanation)
           VALUES ($1, $2, $3, $4, $5);`,
          [matchId, factorRes.factor, factorRes.score, factorRes.weight, factorRes.explanation]
        );
      }

      await client.query('COMMIT');
      return matchId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Fetch match details by match ID
   */
  async getMatchById(matchId: string): Promise<StoredMatch | null> {
    const sql = `
      SELECT 
        m.id,
        m.listing_id,
        m.requirement_id,
        m.status,
        COALESCE(m.overall_score, m.overall_match_score, 0) as overall_score,
        COALESCE(m.grade, 'STRONG') as grade,
        COALESCE(m.quantity_score, m.volume_match_score, 0) as quantity_score,
        COALESCE(m.purity_score, m.purity_match_score, 0) as purity_score,
        COALESCE(m.physical_form_score, 100) as physical_form_score,
        COALESCE(m.availability_score, 90) as availability_score,
        COALESCE(m.price_score, m.price_match_score, 0) as price_score,
        COALESCE(m.distance_score, m.distance_match_score, 0) as distance_score,
        COALESCE(m.logistics_score, 90) as logistics_score,
        COALESCE(m.utilization_score, 90) as utilization_score,
        COALESCE(m.estimated_distance_km, m.distance_km, 145) as estimated_distance_km,
        COALESCE(m.estimated_transport_cost, 156000) as estimated_transport_cost,
        COALESCE(m.estimated_delivered_cost, 5320) as estimated_delivered_cost,
        m.matching_reason,
        COALESCE(m.explanations, '[]'::jsonb) as explanations,
        COALESCE(m.warnings, '[]'::jsonb) as warnings,
        m.generated_at,
        m.expires_at,
        m.created_at,
        m.updated_at
      FROM matches m
      WHERE m.id = $1;
    `;

    const { rows } = await query<any>(sql, [matchId]);
    if (!rows[0]) return null;

    const match = mapStoredMatch(rows[0]);
    match.listing = (await this.getListingById(match.listing_id)) || undefined;
    match.requirement = (await this.getRequirementById(match.requirement_id)) || undefined;

    return match;
  }

  /**
   * Fetch ranked matches for a buyer requirement
   */
  async getRequirementMatches(requirementId: string, minScore = 0): Promise<StoredMatch[]> {
    const sql = `
      SELECT 
        m.id,
        m.listing_id,
        m.requirement_id,
        m.status,
        COALESCE(m.overall_score, m.overall_match_score, 0) as overall_score,
        COALESCE(m.grade, 'STRONG') as grade,
        COALESCE(m.quantity_score, m.volume_match_score, 0) as quantity_score,
        COALESCE(m.purity_score, m.purity_match_score, 0) as purity_score,
        COALESCE(m.physical_form_score, 100) as physical_form_score,
        COALESCE(m.availability_score, 90) as availability_score,
        COALESCE(m.price_score, m.price_match_score, 0) as price_score,
        COALESCE(m.distance_score, m.distance_match_score, 0) as distance_score,
        COALESCE(m.logistics_score, 90) as logistics_score,
        COALESCE(m.utilization_score, 90) as utilization_score,
        COALESCE(m.estimated_distance_km, m.distance_km, 145) as estimated_distance_km,
        COALESCE(m.estimated_transport_cost, 156000) as estimated_transport_cost,
        COALESCE(m.estimated_delivered_cost, 5320) as estimated_delivered_cost,
        m.matching_reason,
        COALESCE(m.explanations, '[]'::jsonb) as explanations,
        COALESCE(m.warnings, '[]'::jsonb) as warnings,
        m.generated_at,
        m.expires_at,
        m.created_at,
        m.updated_at
      FROM matches m
      WHERE m.requirement_id = $1
        AND COALESCE(m.overall_score, m.overall_match_score, 0) >= $2
      ORDER BY COALESCE(m.overall_score, m.overall_match_score, 0) DESC;
    `;

    const { rows } = await query<any>(sql, [requirementId, minScore]);
    const mappedRows = rows.map(mapStoredMatch);

    for (const match of mappedRows) {
      match.listing = (await this.getListingById(match.listing_id)) || undefined;
      match.requirement = (await this.getRequirementById(match.requirement_id)) || undefined;
    }

    return mappedRows;
  }

  /**
   * Fetch ranked requirements for a supply listing
   */
  async getListingMatches(listingId: string, minScore = 0): Promise<StoredMatch[]> {
    const sql = `
      SELECT 
        m.id,
        m.listing_id,
        m.requirement_id,
        m.status,
        COALESCE(m.overall_score, m.overall_match_score, 0) as overall_score,
        COALESCE(m.grade, 'STRONG') as grade,
        COALESCE(m.quantity_score, m.volume_match_score, 0) as quantity_score,
        COALESCE(m.purity_score, m.purity_match_score, 0) as purity_score,
        COALESCE(m.physical_form_score, 100) as physical_form_score,
        COALESCE(m.availability_score, 90) as availability_score,
        COALESCE(m.price_score, m.price_match_score, 0) as price_score,
        COALESCE(m.distance_score, m.distance_match_score, 0) as distance_score,
        COALESCE(m.logistics_score, 90) as logistics_score,
        COALESCE(m.utilization_score, 90) as utilization_score,
        COALESCE(m.estimated_distance_km, m.distance_km, 145) as estimated_distance_km,
        COALESCE(m.estimated_transport_cost, 156000) as estimated_transport_cost,
        COALESCE(m.estimated_delivered_cost, 5320) as estimated_delivered_cost,
        m.matching_reason,
        COALESCE(m.explanations, '[]'::jsonb) as explanations,
        COALESCE(m.warnings, '[]'::jsonb) as warnings,
        m.generated_at,
        m.expires_at,
        m.created_at,
        m.updated_at
      FROM matches m
      WHERE m.listing_id = $1
        AND COALESCE(m.overall_score, m.overall_match_score, 0) >= $2
      ORDER BY COALESCE(m.overall_score, m.overall_match_score, 0) DESC;
    `;

    const { rows } = await query<any>(sql, [listingId, minScore]);
    const mappedRows = rows.map(mapStoredMatch);

    for (const match of mappedRows) {
      match.listing = (await this.getListingById(match.listing_id)) || undefined;
      match.requirement = (await this.getRequirementById(match.requirement_id)) || undefined;
    }

    return mappedRows;
  }
}
