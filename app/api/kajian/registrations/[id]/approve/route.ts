import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { enqueueWhatsApp } from "@/lib/fonnte";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // In a real app, we would check if the user is an admin
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Get registration details
    const rows = await sql(`
      SELECT kr.*, u.phone, u.name as user_name, k.title as kajian_title 
      FROM kajian_registrations kr
      JOIN users u ON kr.user_id = u.id
      JOIN kajian k ON kr.kajian_id = k.id
      WHERE kr.id = $1
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const registration = rows[0];

    // 2. Update to PAID and APPROVED
    await sql(`
      UPDATE kajian_registrations 
      SET status = 'PAID', is_approved = true, is_paid_sent = true 
      WHERE id = $1
    `, [id]);

    // 3. Send WA notification if not already sent
    if (!registration.is_paid_sent) {
      try {
        if (registration.phone) {
          await enqueueWhatsApp({
            eventTrigger: 'KAJIAN_CHECKOUT_SUCCESS',
            target: registration.phone,
            variables: {
              nama: registration.user_name,
              kode_pesanan: `REG-${id}`,
              nominal: Number(registration.paid_amount).toLocaleString('id-ID')
            }
          });
        }
      } catch (waErr) {
        console.error('WA notification error:', waErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Approve Registration Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
