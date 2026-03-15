import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (status === "success" || status === "Success") {
      return NextResponse.redirect(
        `${baseUrl}/payment/success?status=${status}&txnid=${txnid}&amount=${amount}`,
        { status: 303 }
      );
    } else {
      return NextResponse.redirect(`${baseUrl}/payment/cancel`, { status: 303 });
    }
  } catch (error) {
    console.error("PayU callback error:", error);
    return NextResponse.redirect("http://localhost:3000/payment/cancel", { status: 303 });
  }
}
