import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ registered: false });
    }

    const { searchParams } = new URL(req.url);
    const kajianId = searchParams.get("kajianId");
    if (!kajianId) {
      return NextResponse.json({ error: "Missing kajianId parameter" }, { status: 400 });
    }

    const usersRes = await sql(`SELECT id FROM users WHERE email = $1`, [session.user.email]);
    if (usersRes.length === 0) {
      return NextResponse.json({ registered: false });
    }
    const userId = usersRes[0].id;

    const existingReg = await sql(`
      SELECT id_code, id FROM kajian_registrations 
      WHERE user_id = $1 AND kajian_id = $2 AND status != 'FAILED'
      LIMIT 1
    `, [userId, kajianId]);

    if (existingReg.length > 0) {
      return NextResponse.json({ 
        registered: true, 
        registrationCode: existingReg[0].id_code || `REG-${existingReg[0].id}` 
      });
    }

    return NextResponse.json({ registered: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
