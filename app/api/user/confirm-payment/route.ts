import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const formData = await request.formData();
    const code = formData.get('code') as string;
    const file = formData.get('file') as File;

    if (!code || !file) {
      return NextResponse.json({ error: 'Kode transaksi dan bukti transfer wajib diisi' }, { status: 400 });
    }

    // 1. Check user ownership and update DB
    if (code.startsWith('REG-')) {
      const regId = code.replace('REG-', '');
      if (!/^\d+$/.test(regId)) {
        return NextResponse.json({ error: 'Format kode pendaftaran tidak valid' }, { status: 400 });
      }

      // Check if registration belongs to this user (we find user by email from session)
      const userRows = await sql(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
      if (userRows.length === 0) {
        return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
      }
      const userId = userRows[0].id;

      const regRows = await sql(`SELECT user_id FROM kajian_registrations WHERE id = $1`, [regId]);
      if (regRows.length === 0) {
        return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
      }

      if (Number(regRows[0].user_id) !== Number(userId)) {
        return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
      }

      // Upload to Vercel Blob
      const blob = await put(`proofs/${code}-${Date.now()}-${file.name}`, file, {
        access: 'public',
      });

      // Update payment proof URL
      await sql(`
        UPDATE kajian_registrations 
        SET payment_proof = $1
        WHERE id = $2
      `, [blob.url, regId]);

    } else if (code.startsWith('ORD-')) {
      // Check if order belongs to this user
      const userRows = await sql(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
      if (userRows.length === 0) {
        return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
      }
      const userId = userRows[0].id;

      const orderRows = await sql(`SELECT user_id FROM orders WHERE order_code = $1`, [code]);
      if (orderRows.length === 0) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }

      if (Number(orderRows[0].user_id) !== Number(userId)) {
        return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
      }

      // Upload to Vercel Blob
      const blob = await put(`proofs/${code}-${Date.now()}-${file.name}`, file, {
        access: 'public',
      });

      // Update payment proof URL
      await sql(`
        UPDATE orders 
        SET payment_proof = $1
        WHERE order_code = $2
      `, [blob.url, code]);
    } else {
      return NextResponse.json({ error: 'Tipe transaksi tidak didukung' }, { status: 400 });
    }

    // 2. Clear Redis cache
    try {
      await redis.del(`api:status:get:${code}`);
      await redis.del('api:orders:list');
    } catch (cacheErr) {
      console.error('Failed to clear cache:', cacheErr);
    }

    return NextResponse.json({ success: true, message: 'Bukti transfer berhasil diunggah' });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}
