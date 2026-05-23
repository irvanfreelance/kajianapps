import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const cacheKey = 'api:orders:list';
    
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData, source: 'cache' });
    }

    // Join with users table to get customer name and aggregate order items
    const rows = await sql(`
      SELECT 
        o.id, o.order_code as "orderCode", u.name as "customer", o.order_date as "date", 
        o.total, o.status, o.payment_proof as "paymentProof",
        o.shipping_cost as "shippingCost", o.resi,
        pm.name as "paymentMethod",
        (SELECT json_agg(json_build_object('name', p.name, 'qty', oi.qty, 'price', oi.price))
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      ORDER BY o.id DESC
    `);

    // Cache forever
    await redis.set(cacheKey, rows);

    return NextResponse.json({ success: true, data: rows, source: 'db' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
