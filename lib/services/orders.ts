/**
 * Orders Service Layer
 * Called directly by Server Components (SSR) and API routes.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getOrdersList() {
  const cacheKey = 'api:orders:list';

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  const rows = await sql(`
    SELECT 
      o.id, o.order_code as "orderCode", u.name as "customer", o.order_date as "date", 
      o.total, o.status,
      (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) as items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.id DESC
  `);

  try {
    await redis.set(cacheKey, rows, { ex: 60 });
  } catch { /* Redis optional */ }

  return rows;
}
