import { getUserOrders } from "@/lib/services/orders";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // For now use hardcoded userId: 1 (Jamaah Majelis)
    const data = await getUserOrders(1);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
