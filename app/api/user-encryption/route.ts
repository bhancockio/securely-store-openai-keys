import { prismadb } from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { encryptedKey } = body;

  console.log("body", body);

  if (!encryptedKey) {
    return NextResponse.json(
      { error: "Missing encrypted key" },
      { status: 400 }
    );
  }

  try {
    const userEncryptions = await prismadb.userEncryption.findMany({
      where: { userId: user.id },
    });

    if (userEncryptions.length > 0) {
      await prismadb.userEncryption.update({
        where: { userId: user.id },
        data: { encryptedKey },
      });
    } else {
      await prismadb.userEncryption.create({
        data: { encryptedKey, userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}
