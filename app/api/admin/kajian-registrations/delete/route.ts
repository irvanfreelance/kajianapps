import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
    }

    // Ambil kajianId dulu buat kurangin filled spot
    const reg = await sql(`SELECT kajian_id, is_approved FROM kajian_registrations WHERE id = $1`, [id]);
    
    if (reg.length > 0) {
      const kajianId = reg[0].kajian_id;
      // Kalo is_approved (berarti spot dihitung) atau pending (biasanya udah ditambahin pas daftar), kita kurangi filled
      // Logic awalnya registerKajian langsung +1 ke filled. Jadi kalau dihapus, filled harus -1.
      await sql(`UPDATE kajian SET filled = GREATEST(0, filled - 1) WHERE id = $1`, [kajianId]);
    }

    await sql(`DELETE FROM kajian_registrations WHERE id = $1`, [id]);

    try {
      await redis.flushall();
    } catch {}

    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
