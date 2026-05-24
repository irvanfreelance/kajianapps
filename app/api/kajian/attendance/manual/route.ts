import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketCode, kajianId } = await req.json();

    if (!ticketCode || !kajianId) {
      return NextResponse.json(
        { success: false, error: 'ticketCode dan kajianId wajib diisi' },
        { status: 400 }
      );
    }

    const rows = await sql(`
      SELECT id, is_hadir, is_approved
      FROM kajian_registrations
      WHERE ticket_code = $1 AND kajian_id = $2
    `, [ticketCode, kajianId]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
    }

    const reg = rows[0];

    if (!reg.is_approved) {
      return NextResponse.json({ success: false, error: 'Pendaftaran belum disetujui' }, { status: 400 });
    }

    // Toggle: jika sudah hadir → batalkan, jika belum → tandai hadir
    const newIsHadir = !reg.is_hadir;
    const newCheckedInAt = newIsHadir ? 'NOW()' : 'NULL';

    await sql(`
      UPDATE kajian_registrations
      SET is_hadir = $1, checked_in_at = ${newCheckedInAt}
      WHERE id = $2
    `, [newIsHadir, reg.id]);

    return NextResponse.json({
      success: true,
      is_hadir: newIsHadir,
      checked_in_at: newIsHadir ? new Date().toISOString() : null,
    });

  } catch (error: any) {
    console.error('Manual Attendance Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
