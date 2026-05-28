import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { paymentMethodId, title, content } = await req.json();

    if (!paymentMethodId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const maxRow = await sql(`
      SELECT COALESCE(MAX(sort_order), 0) AS max FROM payment_instructions WHERE payment_method_id = $1
    `, [paymentMethodId]);
    const nextSort = (maxRow[0]?.max ?? 0) + 1;

    const rows = await sql(`
      INSERT INTO payment_instructions (payment_method_id, title, content, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING id, payment_method_id AS "paymentMethodId", title, content, sort_order AS "sortOrder"
    `, [paymentMethodId, title, content, nextSort]);

    invalidateCache();

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
