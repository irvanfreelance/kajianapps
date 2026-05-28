import { getRegistrationDetail, getSeriesEpisodes } from "@/lib/services/kajian";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || session.user.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch real user ID by email
    const usersRes = await sql(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (usersRes.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }
    const userId = usersRes[0].id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing registration ID' }, { status: 400 });
    }

    const registration = await getRegistrationDetail(id, userId);
    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    let episodes: any[] = [];
    if (registration.series_type === 'series' && registration.series_id) {
      episodes = await getSeriesEpisodes(registration.series_id);
    }

    return NextResponse.json({
      success: true,
      data: {
        registration,
        episodes
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
