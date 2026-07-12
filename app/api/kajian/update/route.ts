import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, ustadz, category, date, time, type, price, image, spot,
            url_zoom, url_youtube, description, location,
            series_type = 'single', series_id, episode_number, kajian_mode = 'offline', isTerdekat = false } = body;

    const requiredFields = { id, title, ustadz, category, date, time, type, image, spot };
    const missingFields = Object.entries(requiredFields).filter(([_, v]) => v === undefined || v === null || v === '');
    
    if (missingFields.length > 0) {
      return NextResponse.json({ success: false, error: `Missing fields: ${missingFields.map(([k]) => k).join(', ')}` }, { status: 400 });
    }

    const slug = slugify(title);

    const result = await sql(`
      UPDATE kajian 
      SET title = $1, ustadz = $2, date = $3, time_display = $4, 
          type = $5, price = $6, spot = $7, image = $8, category = $9,
          url_zoom = $10, url_youtube = $11, description = $12, location = $13, slug = $14,
          series_type = $15, series_id = $16, episode_number = $17, kajian_mode = $18, is_terdekat = $19
      WHERE id = $20
      RETURNING *
    `, [title, ustadz, date, time, type, price || 0, spot, image, category,
        url_zoom || null, url_youtube || null, description || null, location || null, slug,
        series_type, series_id || null, episode_number || null, kajian_mode, isTerdekat, id]);

    await redis.flushall();
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
