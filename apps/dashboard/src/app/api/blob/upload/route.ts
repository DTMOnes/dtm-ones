import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Deprecated endpoint. Upload media through apps/api." },
    { status: 410 },
  );
}
