import { registerKajian } from "@/lib/services/kajian";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { createXenditPaymentRequest, XenditPaymentType } from "@/lib/xendit";
import { enqueueWhatsApp } from "@/lib/fonnte";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const { kajianId, paidAmount, paymentMethodId } = await req.json();

    if (!kajianId) {
      return NextResponse.json({ error: "Kajian ID harus diisi" }, { status: 400 });
    }

    if (paidAmount > 0 && !paymentMethodId) {
      return NextResponse.json({ error: "Metode pembayaran harus dipilih untuk kajian berbayar" }, { status: 400 });
    }

    // 1. Initial registration (Pending/Paid if free)
    const status = paidAmount === 0 ? 'PAID' : 'PENDING';
    const result = await registerKajian(userId, kajianId, paidAmount || 0, paymentMethodId ?? undefined, undefined, undefined, status);
    
    const finalRegCode = `REG-${result.id}`;
    let grandTotal = paidAmount || 0;
    let paymentMethod: any = null;

    // 2. Handle Payment if needed
    if (paidAmount > 0 && paymentMethodId) {
      const pmResult = await sql(`SELECT * FROM payment_methods WHERE id = $1`, [paymentMethodId]);
      if (pmResult.length > 0) {
        paymentMethod = pmResult[0];
        const adminFeeFlat = Number(paymentMethod.admin_fee_flat) || 0;
        const adminFeePct = Number(paymentMethod.admin_fee_pct) || 0;
        const adminFee = adminFeeFlat + (paidAmount * (adminFeePct / 100));
        grandTotal = Math.round(paidAmount + adminFee);

        const isManual = paymentMethod.provider === 'manual';

        if (!isManual && paymentMethod.provider?.toLowerCase() === 'xendit') {
          const type = paymentMethod.type?.toLowerCase() || '';
          let xenditType: XenditPaymentType = 'VIRTUAL_ACCOUNT';
          
          if (type.includes('e_wallet') || type.includes('e-wallet') || type.includes('ewallet')) {
            xenditType = 'EWALLET';
          } else if (type.includes('retail') || type.includes('outlet') || type.includes('over_the_counter')) {
            xenditType = 'OVER_THE_COUNTER';
          } else if (type.includes('qr') || type === 'qr_code') {
            xenditType = 'QR_CODE';
          }

          // Use the actual REG-{id} as externalId for consistency
          const xenditRes = await createXenditPaymentRequest({
            externalId: finalRegCode,
            amount: grandTotal,
            type: xenditType,
            channelCode: paymentMethod.code,
            customerName: session.user.name || 'User',
            customerEmail: session.user.email || undefined,
          });

          let vendorPaymentId = xenditRes.id;
          let paymentUrl = null;

          if (xenditType === 'VIRTUAL_ACCOUNT') {
            paymentUrl = xenditRes.payment_method?.virtual_account?.channel_properties?.virtual_account_number;
          } else if (xenditType === 'EWALLET') {
            const action = xenditRes.actions?.find((a: any) => a.url_type === 'DEEPLINK' || a.action === 'AUTH');
            paymentUrl = action?.url || null;
          } else if (xenditType === 'OVER_THE_COUNTER') {
            paymentUrl = xenditRes.payment_method?.over_the_counter?.channel_properties?.payment_code;
          } else if (xenditType === 'QR_CODE') {
            paymentUrl = JSON.stringify({
              qr_string: xenditRes.payment_method?.qr_code?.channel_properties?.qr_string,
              type: 'qr_code'
            });
          }

          // Update the record with Xendit details
          await sql(`
            UPDATE kajian_registrations 
            SET vendor_payment_id = $1, payment_url = $2 
            WHERE id = $3
          `, [vendorPaymentId, paymentUrl, result.id]);
        }
      }
    }
    
    // 3. Send Notifications
    try {
      const userRes = await sql(`SELECT phone, name FROM users WHERE id = $1`, [userId]);
      const phone = userRes[0]?.phone;
      if (phone) {
        if (paidAmount > 0) {
          await enqueueWhatsApp({
            eventTrigger: 'KAJIAN_CHECKOUT_PENDING',
            target: phone,
            variables: {
              nama: userRes[0].name,
              kode_pesanan: finalRegCode,
              nominal: grandTotal.toLocaleString('id-ID'),
              metode: paymentMethod?.name || '-',
              link_status: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kajianapps.vercel.app'}/status/${finalRegCode}`
            }
          });
        } else {
          await enqueueWhatsApp({
            eventTrigger: 'KAJIAN_FREE_SUCCESS',
            target: phone,
            variables: {
              nama: userRes[0].name,
              kode_pesanan: finalRegCode
            }
          });
        }
        await sql(`UPDATE kajian_registrations SET is_checkout_sent = true WHERE id = $1`, [result.id]);
      }
    } catch (waErr) {
      console.error("WA Send Error:", waErr);
    }

    result.id_code = finalRegCode;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Kajian Registration Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
