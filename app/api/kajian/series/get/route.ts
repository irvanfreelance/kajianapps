import { NextResponse } from 'next/server';
import { getSeriesById, getSeriesBySlug } from '@/lib/services/kajian';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'id or slug required' }, { status: 400 });
  }

  try {
    const series = slug ? await getSeriesBySlug(slug) : await getSeriesById(id!);
    if (!series) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
