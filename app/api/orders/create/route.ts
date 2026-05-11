import { createOrder } from "@/lib/services/orders";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, items } = await req.json();

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const result = await createOrder(userId, items);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
