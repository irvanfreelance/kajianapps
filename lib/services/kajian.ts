/**
 * Kajian Service Layer
 * Called directly by Server Components (SSR) and API routes.
 * Avoids HTTP loopback fetches which fail on Vercel production.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getKajianList(limit?: number, offset?: number, category?: string, onlyParent: boolean = false) {
  const cacheKey = `api:kajian:list:${limit ?? 'all'}:${offset ?? 0}:${category ?? 'Semua'}:${onlyParent ? 'parent' : 'all'}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  let query = `
    SELECT k.id, 
           CASE WHEN k.series_type = 'series' THEN ks.title ELSE k.title END AS title, 
           k.ustadz, k.date, k.time_display as time,
           k.type, k.price, 
           CASE WHEN k.series_type = 'series' THEN ks.image ELSE k.image END AS image, 
           k.category, k.spot, k.filled, k.slug,
           k.url_zoom, k.url_youtube, k.kajian_mode,
           CASE WHEN k.series_type = 'series' THEN ks.description ELSE k.description END AS description, 
           k.location,
           k.is_terdekat as "isTerdekat",
           k.series_type, k.series_id, k.episode_number,
           ks.title AS series_title, ks.slug AS series_slug,
           COALESCE(att.attendance_count, 0) AS attendance_count,
           COALESCE(att.hadir_count, 0)      AS hadir_count
    FROM kajian k
    LEFT JOIN kajian_series ks ON ks.id = k.series_id
    LEFT JOIN (
      SELECT kajian_id,
             COUNT(*) FILTER (WHERE is_approved = TRUE)                   AS attendance_count,
             COUNT(*) FILTER (WHERE is_approved = TRUE AND is_hadir = TRUE) AS hadir_count
      FROM kajian_registrations
      GROUP BY kajian_id
    ) att ON att.kajian_id = k.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (category && category !== 'Semua') {
    conditions.push(`k.category = $${params.length + 1}`);
    params.push(category);
  }

  if (onlyParent) {
    conditions.push(`(k.series_type = 'single' OR k.series_type IS NULL OR (k.series_type = 'series' AND k.episode_number = 1))`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY k.date DESC, k.id DESC`;

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
  const cacheKey = `api:kajian:slug:${slug}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const rows = await sql(
    `SELECT k.*, 
            ks.title AS series_title, ks.slug AS series_slug,
            ks.description AS series_description, ks.ustadz AS series_ustadz
     FROM kajian k
     LEFT JOIN kajian_series ks ON ks.id = k.series_id
     WHERE k.slug = $1`,
    [slug]
  );
  const data = rows[0] ?? null;

  // If it's part of a series, fetch all episodes
  if (data && data.series_type === 'series' && data.series_id) {
    const episodes = await sql(
      `SELECT id, title, slug, episode_number, date, time_display, url_zoom, url_youtube, description, kajian_mode
       FROM kajian
       WHERE series_id = $1
       ORDER BY episode_number ASC`,
      [data.series_id]
    );
    data.series_episodes = episodes;
  }

  if (data) {
    try {
      await redis.set(cacheKey, data, { ex: 300 });
    } catch {}
  }
  return data;
}

export async function getKajianById(id: string | number) {
  const cacheKey = `api:kajian:id:${id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const rows = await sql(
    `SELECT k.*, 
            ks.title AS series_title, ks.slug AS series_slug
     FROM kajian k
     LEFT JOIN kajian_series ks ON ks.id = k.series_id
     WHERE k.id = $1`,
    [id]
  );
  const data = rows[0] ?? null;

  if (data) {
    try {
      await redis.set(cacheKey, data, { ex: 300 });
    } catch {}
  }
  return data;
}

// ─── Series ───────────────────────────────────────────────────────────────────

export async function getSeriesList() {
  const cacheKey = `api:kajian:series:list`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch {}

  const rows = await sql(`
    SELECT ks.*,
           COUNT(k.id) AS episode_count
    FROM kajian_series ks
    LEFT JOIN kajian k ON k.series_id = ks.id
    GROUP BY ks.id
    ORDER BY ks.id DESC
  `);

  try {
    await redis.set(cacheKey, rows, { ex: 300 });
  } catch {}
  return rows;
}

export async function getSeriesById(id: string | number) {
  const cacheKey = `api:kajian:series:id:${id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const rows = await sql(`SELECT * FROM kajian_series WHERE id = $1`, [id]);
  const data = rows[0] ?? null;

  if (data) {
    const episodes = await sql(
      `SELECT id, title, slug, episode_number, date, time_display, url_zoom, url_youtube, description, image, kajian_mode
       FROM kajian
       WHERE series_id = $1
       ORDER BY episode_number ASC`,
      [id]
    );
    data.episodes = episodes;
    try {
      await redis.set(cacheKey, data, { ex: 300 });
    } catch {}
  }
  return data;
}

export async function getSeriesBySlug(slug: string) {
  const cacheKey = `api:kajian:series:slug:${slug}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch {}

  const rows = await sql(`SELECT * FROM kajian_series WHERE slug = $1`, [slug]);
  const data = rows[0] ?? null;

  if (data) {
    const episodes = await sql(
      `SELECT id, title, slug, episode_number, date, time_display, url_zoom, url_youtube, description, image, kajian_mode
       FROM kajian
       WHERE series_id = $1
       ORDER BY episode_number ASC`,
      [data.id]
    );
    data.episodes = episodes;
    try {
      await redis.set(cacheKey, data, { ex: 300 });
    } catch {}
  }
  return data;
}

export async function getSeriesEpisodes(seriesId: string | number) {
  const rows = await sql(
    `SELECT id, title, slug, episode_number, date, time_display, url_zoom, url_youtube, description, image, spot, filled, kajian_mode
     FROM kajian
     WHERE series_id = $1
     ORDER BY episode_number ASC`,
    [seriesId]
  );
  return rows;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerKajian(
  userId: number, 
  kajianId: number, 
  paidAmount: number, 
  paymentMethodId?: number,
  vendorPaymentId?: string,
  paymentUrl?: string,
  status: string = 'PENDING',
  isApproved: boolean = false
) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const ticketCode = 'TKT-' + rand;

  const result = await sql(`
    INSERT INTO kajian_registrations (user_id, kajian_id, payment_method_id, vendor_payment_id, payment_url, paid_amount, status, is_approved, ticket_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `, [userId, kajianId, paymentMethodId ?? null, vendorPaymentId ?? null, paymentUrl ?? null, paidAmount, status, isApproved, ticketCode]);

  // Update filled spot
  await sql(`
    UPDATE kajian SET filled = filled + 1 WHERE id = $1
  `, [kajianId]);

  // Invalidate cache
  try {
    await redis.flushall();
  } catch { /* Redis optional */ }

  return result[0];
}

export async function getUserRegistrations(userId: number) {
  const rows = await sql(`
    SELECT 
      kr.id, kr.registered_at as date, kr.paid_amount as price, kr.status, kr.is_approved, kr.ticket_code,
      k.title, k.ustadz, k.date, k.time_display, k.image, k.location, k.slug, k.url_zoom, k.url_youtube, k.kajian_mode,
      k.series_type, k.episode_number, k.series_id,
      ks.title AS series_title, ks.slug AS series_slug
    FROM kajian_registrations kr
    JOIN kajian k ON kr.kajian_id = k.id
    LEFT JOIN kajian_series ks ON ks.id = k.series_id
    WHERE kr.user_id = $1
    ORDER BY kr.id DESC
  `, [userId]);
  return rows;
}

export async function getRegistrationDetail(registrationId: number | string, userId: number) {
  const rows = await sql(`
    SELECT 
      kr.id, kr.registered_at as date, kr.paid_amount as price, kr.status, kr.is_approved, kr.ticket_code,
      k.id as kajian_id, k.title, k.ustadz, k.date as kajian_date, k.time_display, k.image, k.location, k.slug, k.url_zoom, k.url_youtube, k.kajian_mode,
      k.series_type, k.episode_number, k.series_id,
      ks.title AS series_title, ks.slug AS series_slug, ks.image AS series_image, ks.description AS series_description
    FROM kajian_registrations kr
    JOIN kajian k ON kr.kajian_id = k.id
    LEFT JOIN kajian_series ks ON ks.id = k.series_id
    WHERE kr.id = $1 AND kr.user_id = $2
  `, [registrationId, userId]);
  return rows[0] ?? null;
}

export async function getAllRegistrations() {
  const rows = await sql(`
    SELECT 
      kr.id, kr.registered_at as date, kr.paid_amount as amount, kr.status, kr.is_approved, kr.payment_proof, kr.ticket_code,
      u.name as user_name, u.phone as user_phone,
      k.title as kajian_title, k.ustadz, k.date as kajian_date,
      pm.name as payment_method
    FROM kajian_registrations kr
    JOIN users u ON kr.user_id = u.id
    JOIN kajian k ON kr.kajian_id = k.id
    LEFT JOIN payment_methods pm ON kr.payment_method_id = pm.id
    ORDER BY kr.id DESC
  `);
  return rows;
}

export async function getKajianParticipants(kajianId: string | number) {
  const rows = await sql(`
    SELECT 
      u.name, u.phone, u.email,
      kr.registered_at as date, kr.status, kr.paid_amount,
      kr.ticket_code, kr.is_hadir, kr.checked_in_at
    FROM kajian_registrations kr
    JOIN users u ON kr.user_id = u.id
    WHERE kr.kajian_id = $1 AND kr.is_approved = TRUE
    ORDER BY kr.registered_at DESC
  `, [kajianId]);
  return rows;
}
