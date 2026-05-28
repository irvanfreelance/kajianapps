import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, ustadz, category, image, description } = body;

    if (!title || !ustadz || !category) {
      return NextResponse.json({ success: false, error: 'title, ustadz, category are required' }, { status: 400 });
    }

    const slug = slugify(title);

    const result = await sql(`
      INSERT INTO kajian_series (title, ustadz, category, image, description, slug)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, ustadz, category, image || null, description || null, slug]);

    await redis.flushall();
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
