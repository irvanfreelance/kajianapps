/**
 * Kajian Service Layer
 * Called directly by Server Components (SSR) and API routes.
 * Avoids HTTP loopback fetches which fail on Vercel production.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getKajianList(limit?: number, offset?: number, category?: string) {
  const cacheKey = `api:kajian:list:${limit ?? 'all'}:${offset ?? 0}:${category ?? 'Semua'}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  let query = `
    SELECT id, title, ustadz, date_display as date, time_display as time,
           type, price, image, category, spot, filled, slug, url_zoom, url_youtube, description, location
    FROM kajian
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (category && category !== 'Semua') {
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY id DESC`;

  if (limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }
  if (offset) {
    query += ` OFFSET $${params.length + 1}`;
    params.push(offset);
  }

  const rows = await sql(query, params.length > 0 ? params : undefined);

  try {
    await redis.set(cacheKey, rows, { ex: 300 });
  } catch { /* Redis optional */ }

  return rows;
}

export async function getKajianBySlug(slug: string) {
  const rows = await sql(
    `SELECT * FROM kajian WHERE slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getKajianById(id: string | number) {
  const rows = await sql(
    `SELECT * FROM kajian WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function registerKajian(
  userId: number, 
  kajianId: number, 
  paidAmount: number, 
  paymentMethodId?: number,
  vendorPaymentId?: string,
  paymentUrl?: string,
  status: string = 'PENDING'
) {
  const result = await sql(`
    INSERT INTO kajian_registrations (user_id, kajian_id, payment_method_id, vendor_payment_id, payment_url, paid_amount, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [userId, kajianId, paymentMethodId ?? null, vendorPaymentId ?? null, paymentUrl ?? null, paidAmount, status]);

  // Update filled spot
  await sql(`
    UPDATE kajian SET filled = filled + 1 WHERE id = $1
  `, [kajianId]);

  // Invalidate cache
  try {
    const keys = await redis.keys('api:kajian:list:*');
    if (keys.length > 0) await redis.del(...keys);
  } catch { /* Redis optional */ }

  return result[0];
}

export async function getUserRegistrations(userId: number) {
  const rows = await sql(`
    SELECT 
      kr.id, kr.registered_at as date, kr.paid_amount as price, kr.status,
      k.title, k.ustadz, k.date_display, k.time_display, k.image, k.location, k.slug
    FROM kajian_registrations kr
    JOIN kajian k ON kr.kajian_id = k.id
    WHERE kr.user_id = $1
    ORDER BY kr.id DESC
  `, [userId]);
  return rows;
}
