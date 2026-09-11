import { query } from '../../config/database';

export class OrganizationRepository {
  async findById(orgId: string) {
    const res = await query(
      `SELECT id, name, legal_name, slug, org_type, industry, registration_number, description, website, email, phone, tax_identifier, state, city, postal_code, address_line1, verification_status, created_at, updated_at
       FROM organizations WHERE id = $1`,
      [orgId]
    );
    return res.rows[0] || null;
  }

  async findMembers(orgId: string) {
    const res = await query(
      `SELECT om.id, om.role, om.job_title, om.is_primary_contact, om.created_at,
              u.id as "userId", u.first_name as "firstName", u.last_name as "lastName", u.email, u.phone, u.avatar_url as "avatarUrl"
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1
       ORDER BY om.is_primary_contact DESC, u.first_name ASC`,
      [orgId]
    );
    return res.rows;
  }

  async getFacilityCount(orgId: string): Promise<number> {
    const res = await query(
      `SELECT COUNT(*)::int as count FROM facilities WHERE organization_id = $1`,
      [orgId]
    );
    return res.rows[0]?.count || 0;
  }

  async findFacilities(orgId: string) {
    const res = await query(
      `SELECT id, name, facility_code as "facilityCode", city, state, country, status
       FROM facilities WHERE organization_id = $1
       ORDER BY name ASC`,
      [orgId]
    );
    return res.rows;
  }

  async updateOrg(orgId: string, data: {
    name?: string;
    legalName?: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    addressLine1?: string;
  }) {
    const res = await query(
      `UPDATE organizations
       SET name = COALESCE($2, name),
           legal_name = COALESCE($3, legal_name),
           industry = COALESCE($4, industry),
           website = COALESCE($5, website),
           phone = COALESCE($6, phone),
           email = COALESCE($7, email),
           state = COALESCE($8, state),
           city = COALESCE($9, city),
           postal_code = COALESCE($10, postal_code),
           address_line1 = COALESCE($11, address_line1),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        orgId,
        data.name || null,
        data.legalName || null,
        data.industry || null,
        data.website || null,
        data.phone || null,
        data.email || null,
        data.state || null,
        data.city || null,
        data.postalCode || null,
        data.addressLine1 || null,
      ]
    );
    return res.rows[0];
  }
}
