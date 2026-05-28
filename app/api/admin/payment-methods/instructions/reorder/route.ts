import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

// Expects: { orderedIds: number[] }
export async function POST(req: Request) {
  try {
    const { orderedIds } = await req.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds must be a non-empty array" }, { status: 400 });
    }

    const values = orderedIds.map((id, idx) => `(${Number(id)}, ${idx + 1})`).join(",");
    await sql(`
      UPDATE payment_instructions AS pi
      SET sort_order = v.sort_order
      FROM (VALUES ${values}) AS v(id, sort_order)
      WHERE pi.id = v.id
    `);

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
