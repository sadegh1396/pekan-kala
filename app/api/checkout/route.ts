import { NextRequest, NextResponse } from "next/server";
import { placeOrder } from "@/lib/checkout";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin =
    process.env.APP_ORIGIN ??
    (process.env.NODE_ENV !== "production" ? request.nextUrl.origin : null);
  if (!origin || request.headers.get("origin") !== origin)
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 415 });
  try {
    const body = await request.text();
    if (body.length > 16000)
      return NextResponse.json(
        { error: "درخواست بیش از حد بزرگ است" },
        { status: 413 },
      );
    const order = await placeOrder(JSON.parse(body));
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "ثبت درخواست انجام نشد؛ اطلاعات، تاریخ و موجودی سبد را بررسی کنید.",
      },
      { status: 400 },
    );
  }
}
