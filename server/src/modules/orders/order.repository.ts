import { query, pool } from '../../config/database';
import { Order, OrderDetail, OrderStatus } from './order.types';

export class OrderRepository {
  async generateOrderNumber(): Promise<string> {
    const res = await query<{ count: string }>('SELECT COUNT(*) as count FROM orders');
    const seq = parseInt(res.rows[0]?.count || '0', 10) + 1;
    return `CL-ORD-${seq.toString().padStart(6, '0')}`;
  }

  async getOrderById(id: string): Promise<OrderDetail | null> {
    const res = await query<OrderDetail>(
      `SELECT 
        o.*,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title,
        l.purity_percentage as listing_purity,
        r.title as requirement_title
       FROM orders o
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN buyer_requirements r ON o.requirement_id = r.id
       WHERE o.id = $1 OR o.order_number = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const order = res.rows[0];

    // Fetch status history
    const histRes = await query(
      `SELECT osh.*, COALESCE(u.first_name || ' ' || u.last_name, u.email) as changed_by_name 
       FROM order_status_history osh
       LEFT JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = $1
       ORDER BY osh.created_at ASC`,
      [order.id]
    );

    return {
      ...order,
      status: order.status.toUpperCase() as OrderStatus,
      quantity: parseFloat(((order as any).quantity || (order as any).quantity_tons || '0').toString()),
      unit_price: parseFloat(((order as any).unit_price || (order as any).price_per_ton || '0').toString()),
      subtotal_amount: parseFloat(((order as any).subtotal_amount || '0').toString()),
      delivery_cost: parseFloat(((order as any).delivery_cost || (order as any).logistics_fee || '0').toString()),
      total_amount: parseFloat(((order as any).total_amount || '0').toString()),
      status_history: histRes.rows,
    };
  }

  async listOrders(
    orgId: string,
    role: 'received' | 'sent' | 'all' = 'all',
    status?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (role === 'sent') {
      whereConditions.push(`o.buyer_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else if (role === 'received') {
      whereConditions.push(`o.seller_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else {
      whereConditions.push(`(o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`LOWER(o.status) = LOWER($${paramIndex++})`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM orders o ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const itemsRes = await query(
      `SELECT 
        o.*,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title,
        l.purity_percentage as listing_purity
       FROM orders o
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      items: itemsRes.rows.map((row: any) => ({
        ...row,
        quantity: parseFloat((row.quantity || row.quantity_tons || '0').toString()),
        unit_price: parseFloat((row.unit_price || row.price_per_ton || '0').toString()),
        subtotal_amount: parseFloat((row.subtotal_amount || '0').toString()),
        delivery_cost: parseFloat((row.delivery_cost || row.logistics_fee || '0').toString()),
        total_amount: parseFloat((row.total_amount || '0').toString()),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
