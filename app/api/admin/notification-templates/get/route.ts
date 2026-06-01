import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const templates = await sql(`
      SELECT 
        id, 
        event_trigger AS "eventTrigger", 
        channel, 
        message_content AS "messageContent", 
        is_active AS "isActive"
      FROM notification_templates
      ORDER BY id ASC
    `);
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
