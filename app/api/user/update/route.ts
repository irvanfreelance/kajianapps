import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || session.user.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, gender, job, yearBorn } = await req.json();
    
    // Fetch real user ID by email
    const usersRes = await sql(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (usersRes.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }
    const userId = usersRes[0].id;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 });
    }

    await sql(`
      UPDATE users 
      SET name = $1, phone = $2, gender = $3, job = $4, year_born = $5
      WHERE id = $6
    `, [name, phone || null, gender || null, job || null, yearBorn || null, userId]);

    try {
      await redis.flushall();
    } catch {}

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
