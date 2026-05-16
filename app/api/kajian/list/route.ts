import { NextResponse } from 'next/server';
import { getKajianList } from '@/lib/services/kajian';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const category = searchParams.get('category') || undefined;

    const data = await getKajianList(limit, offset, category);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching kajian:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
