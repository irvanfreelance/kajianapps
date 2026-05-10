import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');

    const cacheKey = `api:kajian:list:${category || 'all'}:${limit}:${offset}`;
    
    // Check cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData, source: 'cache' });
    }

    // Fetch from database using RAW SQL as requested
    let rows;
    if (category && category !== 'Semua') {
      rows = await sql(`
        SELECT 
          id, title, ustadz, date_display as "date", time_display as "time", type, 
          price, spot, filled, image, category, description, location,
          url_zoom, url_youtube, slug
        FROM kajian 
        WHERE category = $1
        ORDER BY id ASC
        LIMIT $2 OFFSET $3
      `, [category, limit, offset]);
    } else {
      rows = await sql(`
        SELECT 
          id, title, ustadz, date_display as "date", time_display as "time", type, 
          price, spot, filled, image, category, description, location,
          url_zoom, url_youtube, slug
        FROM kajian 
        ORDER BY id ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
    }

    // Save to cache (expire in 5 minutes)
    await redis.set(cacheKey, rows, { ex: 300 });

    return NextResponse.json({ success: true, data: rows, source: 'db' });
  } catch (error) {
    console.error('Error fetching kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
