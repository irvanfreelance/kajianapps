/**
 * Products Service Layer
 * Called directly by Server Components (SSR) and API routes.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getProductsList(category?: string, limit?: number) {
  const cacheKey = `api:products:list:${category || 'all'}:${limit || 'all'}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  let query = `
    SELECT id, name, price, old_price, stock, image,
           category, rating, sold, description, slug
    FROM products
  `;
  const params: any[] = [];
  if (category) {
    query += ` WHERE category = $1`;
    params.push(category);
  }
  query += ` ORDER BY id DESC`;
  if (limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }

  const rows = await sql(query, params.length > 0 ? params : undefined);

  try {
    await redis.set(cacheKey, rows, { ex: 300 });
  } catch { /* Redis optional */ }

  return rows;
}

export async function getProductBySlug(slug: string) {
  const rows = await sql(
    `SELECT * FROM products WHERE slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getProductById(id: string | number) {
  const rows = await sql(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}
