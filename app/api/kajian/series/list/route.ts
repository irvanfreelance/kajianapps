import { NextResponse } from 'next/server';
import { getSeriesList } from '@/lib/services/kajian';

export async function GET() {
  try {
    const series = await getSeriesList();
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
