import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, ustadz, category, date, time, type, price, image, spot, url_zoom, url_youtube } = body;

    const requiredFields = { id, title, ustadz, category, date, time, type, image, spot };
    const missingFields = Object.entries(requiredFields).filter(([_, v]) => v === undefined || v === null || v === "");
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields.map(([k]) => k));
      return NextResponse.json({ success: false, error: `Missing fields: ${missingFields.map(([k]) => k).join(', ')}` }, { status: 400 });
    }

    const slug = slugify(title);

    const result = await sql(`
      UPDATE kajian 
      SET title = $1, ustadz = $2, date = $3, time_display = $4, 
          type = $5, price = $6, spot = $7, image = $8, category = $9,
          url_zoom = $10, url_youtube = $11, slug = $12
      WHERE id = $13
      RETURNING *
    `, [title, ustadz, date, time, type, price || 0, spot, image, category, url_zoom || null, url_youtube || null, slug, id]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
