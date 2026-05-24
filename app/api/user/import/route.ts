import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak valid atau kosong' }, { status: 400 });
    }

    const results = [];
    for (const row of data) {
      const { name, email, phone, gender, job, yearBorn, joinedDate } = row;
      
      // Auto-generate userCode (similar to how users might be generated, e.g. USR-XXXX)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let rand = '';
      for (let i = 0; i < 6; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
      const userCode = 'USR-' + rand;

      const finalName = name || "Jamaah";
      const finalEmail = email || `${userCode.toLowerCase()}@example.com`;
      const finalJoinedDate = joinedDate || new Date().toISOString().split('T')[0];

      try {
        const res = await sql(`
          INSERT INTO users (user_code, name, email, phone, gender, job, year_born, joined_date) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (email) DO NOTHING
          RETURNING id
        `, [
          userCode,
          finalName,
          finalEmail,
          phone || null,
          gender || null,
          job || null,
          yearBorn ? String(yearBorn) : null,
          finalJoinedDate
        ]);
        
        if (res.length > 0) {
          results.push(res[0]);
        }
      } catch (err: any) {
        console.error("Failed to insert user:", email, err.message);
      }
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
