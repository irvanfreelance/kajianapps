import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, ustadz, category, date, time, type, price, image, spot,
            url_zoom, url_youtube, description, location,
            series_type = 'single', series_id, episode_number, kajian_mode = 'offline' } = body;

    const requiredFields = { title, ustadz, category, date, time, type, image, spot };
    const missingFields = Object.entries(requiredFields).filter(([_, v]) => v === undefined || v === null || v === '');
    
    if (missingFields.length > 0) {
      return NextResponse.json({ success: false, error: `Missing fields: ${missingFields.map(([k]) => k).join(', ')}` }, { status: 400 });
    }

    const slug = slugify(title);

    const result = await sql(`
      INSERT INTO kajian (title, ustadz, date, time_display, type, price, spot, filled, image, category,
                          url_zoom, url_youtube, description, location, slug,
                          series_type, series_id, episode_number, kajian_mode) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `, [title, ustadz, date, time, type, price || 0, spot, image, category,
        url_zoom || null, url_youtube || null, description || null, location || null, slug,
        series_type, series_id || null, episode_number || null, kajian_mode]);

    await redis.flushall();
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
