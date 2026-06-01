import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { eventTrigger, channel, messageContent, isActive } = await req.json();

    if (!eventTrigger || !channel || !messageContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rows = await sql(`
      INSERT INTO notification_templates (event_trigger, channel, message_content, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        event_trigger AS "eventTrigger", 
        channel, 
        message_content AS "messageContent", 
        is_active AS "isActive"
    `, [
      eventTrigger,
      channel,
      messageContent,
      isActive !== false
    ]);

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
