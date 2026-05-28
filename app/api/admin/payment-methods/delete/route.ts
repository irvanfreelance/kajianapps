import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // CASCADE will handle payment_instructions deletion automatically
    await sql(`DELETE FROM payment_methods WHERE id = $1`, [id]);

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
