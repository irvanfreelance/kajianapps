import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, isActive } = await req.json();

    if (id === undefined || isActive === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql(`
      UPDATE notification_templates
      SET is_active = $2
      WHERE id = $1
    `, [id, isActive]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
