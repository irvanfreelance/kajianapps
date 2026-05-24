import { getUserRegistrations } from "@/lib/services/kajian";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
    const data = await getUserRegistrations(userId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
