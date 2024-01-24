import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }
}
