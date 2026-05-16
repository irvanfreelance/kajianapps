import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, gender, job, yearBorn } = await req.json();
    const userId = Number(session.user.id);

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 });
    }

    await sql(`
      UPDATE users 
      SET name = $1, phone = $2, gender = $3, job = $4, year_born = $5
      WHERE id = $6
    `, [name, phone || null, gender || null, job || null, yearBorn || null, userId]);

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
