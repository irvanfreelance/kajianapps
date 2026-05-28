import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    // Nullify series_id on all episodes first
    await sql(`UPDATE kajian SET series_id = NULL, series_type = 'single', episode_number = NULL WHERE series_id = $1`, [id]);
    await sql(`DELETE FROM kajian_series WHERE id = $1`, [id]);
    await redis.flushall();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
