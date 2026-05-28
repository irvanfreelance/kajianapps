import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const cacheKey = `api:products:reviews:${productId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }
  } catch {}

  try {
    const reviews = await sql(
      `SELECT o.rating, o.testimonial, o.testimonial_images, o.testimonial_video, o.created_at, u.name as user_name
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN users u ON u.id = o.user_id
       WHERE oi.product_id = CAST($1 AS bigint) AND o.rating IS NOT NULL
       ORDER BY o.created_at DESC`,
      [productId]
    );

    try {
      await redis.set(cacheKey, reviews);
    } catch {}

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
