import { NextResponse } from 'next/server';
import { registerKajian } from '@/lib/services/kajian';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, kajianId, paidAmount, status, isApproved } = await req.json();

    if (!userId || !kajianId) {
      return NextResponse.json({ success: false, error: 'User ID dan Kajian ID wajib diisi' }, { status: 400 });
    }

    // Call the service function to register and update filled spots
    const result = await registerKajian(
      Number(userId),
      Number(kajianId),
      Number(paidAmount || 0),
      undefined, // paymentMethodId
      undefined, // vendorPaymentId
      undefined, // paymentUrl
      status || 'PAID',
      isApproved !== undefined ? isApproved : true
    );

    // Fetch the inserted record with joined user and kajian details for frontend to append locally
    const insertedRow = await sql(`
      SELECT 
        kr.id, kr.registered_at as date, kr.paid_amount as amount, kr.status, kr.is_approved, kr.payment_proof, kr.ticket_code,
        u.name as user_name, u.phone as user_phone,
        k.title as kajian_title, k.ustadz, k.date as kajian_date,
        'Manual' as payment_method
      FROM kajian_registrations kr
      JOIN users u ON kr.user_id = u.id
      JOIN kajian k ON kr.kajian_id = k.id
      WHERE kr.id = $1
    `, [result.id]);

    return NextResponse.json({ success: true, data: insertedRow[0] });
  } catch (error: any) {
    console.error('Error manual entry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
