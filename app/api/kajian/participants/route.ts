import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kajianId = searchParams.get('kajianId');

    if (!kajianId) {
      return NextResponse.json({ success: false, error: 'Kajian ID is required' }, { status: 400 });
    }

    // Only get PAID participants (free kajian are also marked PAID by default now)
    const rows = await sql(`
      SELECT 
        u.name, u.phone, u.email,
        kr.registered_at as date, kr.status, kr.paid_amount
      FROM kajian_registrations kr
      JOIN users u ON kr.user_id = u.id
      WHERE kr.kajian_id = $1 AND kr.status = 'PAID'
      ORDER BY kr.registered_at DESC
    `, [kajianId]);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Participants Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
