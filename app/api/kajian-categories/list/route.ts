import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const data = await sql('SELECT * FROM kajian_categories ORDER BY id ASC');
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching kajian categories:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
