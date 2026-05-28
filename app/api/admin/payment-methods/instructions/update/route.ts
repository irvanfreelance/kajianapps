import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { id, title, content } = await req.json();

    if (!id || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql(`
      UPDATE payment_instructions
      SET title = $1, content = $2
      WHERE id = $3
    `, [title, content, id]);

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
