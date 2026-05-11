import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const methodId = searchParams.get("methodId");

  if (!methodId) {
    return NextResponse.json({ error: "Missing methodId" }, { status: 400 });
  }

  try {
    const instructions = await sql(`
      SELECT title, content 
      FROM payment_instructions 
      WHERE payment_method_id = $1 
      ORDER BY sort_order
    `, [methodId]);
    return NextResponse.json(instructions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
