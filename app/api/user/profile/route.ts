import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Email not found in session' }, { status: 400 });
    }

    const cacheKey = `api:user:profile:${userEmail}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached });
      }
    } catch {}
    
    const users: any[] = await sql('SELECT * FROM users WHERE email = $1', [userEmail]);
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    
    // Convert snake_case to camelCase
    const userProfile = {
      id: user.id,
      userCode: user.user_code,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      job: user.job,
      yearBorn: user.year_born,
      joinedDate: user.joined_date
    };

    try {
      await redis.set(cacheKey, userProfile);
    } catch {}

    return NextResponse.json({ success: true, data: userProfile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
