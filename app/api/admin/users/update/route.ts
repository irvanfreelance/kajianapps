import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id, name, email, phone, gender, job, yearBorn, joinedDate } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json({ success: false, error: 'ID, Nama, dan Email wajib diisi' }, { status: 400 });
    }

    await sql(`
      UPDATE users 
      SET name = $1, email = $2, phone = $3, gender = $4, job = $5, year_born = $6
      WHERE id = $7
    `, [name, email, phone || null, gender || null, job || null, yearBorn || null, id]);

    return NextResponse.json({ success: true, message: 'Data jamaah berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
