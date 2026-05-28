import { NextResponse } from 'next/server';
import { getKajianById, getKajianBySlug } from '@/lib/services/kajian';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'ID or Slug required' }, { status: 400 });
  }

  try {
    let kajian;
    if (slug) {
      kajian = await getKajianBySlug(slug);
    } else {
      kajian = await getKajianById(id!);
    }

    if (!kajian) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: kajian });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
