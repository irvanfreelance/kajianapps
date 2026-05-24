import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak valid atau kosong' }, { status: 400 });
    }

    // Insert each row
    const results = [];
    for (const row of data) {
      const { title, ustadz, category, date, time, type, price, spot, url_zoom, url_youtube, image } = row;
      
      // Default empty image space if not provided
      const finalImage = image || " ";
      const finalPrice = price || 0;
      const finalType = type || "free";
      const finalSpot = spot || 0;
      
      const slug = slugify(title || "Kajian");

      try {
        const res = await sql(`
          INSERT INTO kajian (title, ustadz, date, time_display, type, price, spot, filled, image, category, url_zoom, url_youtube, slug) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, $11, $12)
          RETURNING id
        `, [
          title || "Tanpa Judul", 
          ustadz || "Hamba Allah", 
          date || new Date().toISOString().split('T')[0], 
          time || "00:00", 
          finalType, 
          finalPrice, 
          finalSpot, 
          finalImage, 
          category || "Umum", 
          url_zoom || null, 
          url_youtube || null, 
          slug + '-' + Math.floor(Math.random() * 1000) // prevent slug duplicate
        ]);
        results.push(res[0]);
      } catch (err: any) {
        console.error("Failed to insert row:", title, err.message);
      }
    }

    // Flush cache
    try {
      await redis.flushall();
    } catch {}

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error importing kajian:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
