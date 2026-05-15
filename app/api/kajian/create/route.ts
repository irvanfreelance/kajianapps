import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, ustadz, category, date, time, type, price, image, spot, url_zoom, url_youtube } = body;

    const requiredFields = { title, ustadz, category, date, time, type, image, spot };
    const missingFields = Object.entries(requiredFields).filter(([_, v]) => v === undefined || v === null || v === "");
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields.map(([k]) => k));
      return NextResponse.json({ success: false, error: `Missing fields: ${missingFields.map(([k]) => k).join(', ')}` }, { status: 400 });
    }

    const slug = slugify(title);

    const result = await sql(`
      INSERT INTO kajian (title, ustadz, date, time_display, type, price, spot, filled, image, category, url_zoom, url_youtube, slug) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, $11, $12)
      RETURNING *
    `, [title, ustadz, date, time, type, price || 0, spot, image, category, url_zoom || null, url_youtube || null, slug]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
