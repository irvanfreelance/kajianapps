import { registerKajian } from "@/lib/services/kajian";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, kajianId, paidAmount } = await req.json();

    if (!userId || !kajianId) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const result = await registerKajian(userId, kajianId, paidAmount || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Kajian Registration Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
