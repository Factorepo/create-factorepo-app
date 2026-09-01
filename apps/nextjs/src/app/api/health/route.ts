import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json("ok", { status: 200 });
}
