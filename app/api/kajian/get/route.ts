import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'ID or Slug required' }, { status: 400 });
  }

  try {
    let data;
    if (slug) {
      data = await sql('SELECT * FROM kajian WHERE slug = $1', [slug]);
    } else {
      data = await sql('SELECT * FROM kajian WHERE id = $1', [id]);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
