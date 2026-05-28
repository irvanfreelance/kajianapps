import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

// Public endpoint - no auth required
export async function POST(req: Request) {
  try {
    const { ticketCode, kajianId } = await req.json();

    if (!ticketCode || !kajianId) {
      return NextResponse.json(
        { success: false, error: 'Kode tiket dan kajian wajib diisi' },
        { status: 400 }
      );
    }

    // Normalize: accept with or without "TKT-" prefix
    const normalizedCode = ticketCode.trim().toUpperCase().startsWith('TKT-')
      ? ticketCode.trim().toUpperCase()
      : `TKT-${ticketCode.trim().toUpperCase()}`;

    const rows = await sql(`
      SELECT 
        kr.id, kr.is_hadir, kr.is_approved, kr.checked_in_at,
        u.name, u.phone
      FROM kajian_registrations kr
      JOIN users u ON kr.user_id = u.id
      WHERE kr.ticket_code = $1 AND kr.kajian_id = $2
    `, [normalizedCode, kajianId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kode tiket tidak ditemukan untuk kajian ini. Pastikan kode sudah benar.' },
        { status: 404 }
      );
    }

    const reg = rows[0];

    if (!reg.is_approved) {
      return NextResponse.json(
        { success: false, error: 'Pendaftaran Anda belum dikonfirmasi oleh panitia.' },
        { status: 400 }
      );
    }

    if (reg.is_hadir) {
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        error: `Kode ini sudah digunakan untuk check-in pada ${new Date(reg.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.`,
        name: reg.name,
      });
    }

    // Mark as hadir
    await sql(`
      UPDATE kajian_registrations
      SET is_hadir = TRUE, checked_in_at = NOW()
      WHERE id = $1
    `, [reg.id]);

    try {
      await redis.flushall();
    } catch {}

    return NextResponse.json({
      success: true,
      name: reg.name,
      phone: reg.phone,
      checked_in_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Self-Checkin Error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
