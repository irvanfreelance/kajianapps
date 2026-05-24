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

    // Find the registration matching the ticket code and kajian
    const rows = await sql(`
      SELECT 
        kr.id, kr.is_hadir, kr.checked_in_at, kr.is_approved,
        u.name, u.phone, u.email
      FROM kajian_registrations kr
      JOIN users u ON kr.user_id = u.id
      WHERE kr.ticket_code = $1 AND kr.kajian_id = $2
    `, [ticketCode, kajianId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan atau tidak terdaftar di kajian ini' },
        { status: 404 }
      );
    }

    const reg = rows[0];

    if (!reg.is_approved) {
      return NextResponse.json(
        { success: false, error: 'Pendaftaran belum disetujui (belum APPROVED)' },
        { status: 400 }
      );
    }

    if (reg.is_hadir) {
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        message: 'Jamaah ini sudah melakukan check-in',
        data: {
          name: reg.name,
          phone: reg.phone,
          email: reg.email,
          checked_in_at: reg.checked_in_at,
        }
      });
    }

    // Mark as attended
    await sql(`
      UPDATE kajian_registrations
      SET is_hadir = TRUE, checked_in_at = NOW()
      WHERE id = $1
    `, [reg.id]);

    return NextResponse.json({
      success: true,
      message: 'Check-in berhasil!',
      data: {
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        checked_in_at: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Attendance Scan Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
