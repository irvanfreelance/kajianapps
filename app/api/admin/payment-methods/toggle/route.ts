import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { id, isActive } = await req.json();

    if (id === undefined || isActive === undefined) {
      return NextResponse.json({ error: "Missing id or isActive" }, { status: 400 });
    }

    await sql(`UPDATE payment_methods SET is_active = $1 WHERE id = $2`, [isActive, id]);

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
