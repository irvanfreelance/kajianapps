import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'NEW_USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, gender, job, yearBorn } = await req.json();

    if (!name || !email || !phone || !gender || !job || !yearBorn) {
      return NextResponse.json({ error: 'Harap lengkapi semua field' }, { status: 400 });
    }

    // Generate userCode (e.g., USR-YYYYMMDD-RANDOM)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const userCode = `USR-${dateStr}-${randomStr}`;
    const joinedDate = new Date().toISOString();

    // Insert into DB using raw sql to comply with rule #1
    const result = await sql(
      `INSERT INTO users (user_code, name, email, phone, gender, job, year_born, joined_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [userCode, name, email, phone, gender, job, yearBorn, joinedDate]
    );

    if (!result || result.length === 0) {
      throw new Error('Gagal menyimpan user');
    }

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    console.error('Registration Error:', error);
    // Check for duplicate email in catch block
    if (error.code === '23505') {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
