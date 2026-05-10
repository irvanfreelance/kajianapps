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
        o.total, o.status,
        (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);

    // Cache less time for orders since they change more often
    await redis.set(cacheKey, rows, { ex: 60 });

    return NextResponse.json({ success: true, data: rows, source: 'db' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
