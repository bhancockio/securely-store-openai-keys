import { prismadb } from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { salt, passphrase } = await request.json();

  console.log("salt, passphrase", salt, passphrase);

  if (!salt || !passphrase) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const userEncryptions = await prismadb.userEncryption.findMany({
      where: { userId: user.id },
    });

    if (userEncryptions.length > 0) {
      await prismadb.userEncryption.update({
        where: { userId: user.id },
        data: { salt, passphrase },
      });
    } else {
      await prismadb.userEncryption.create({
        data: { salt, passphrase, userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const userEncryption = await prismadb.userEncryption.findFirst({
      where: { userId: user.id },
    });

    if (!userEncryption) {
      return NextResponse.json({ salt: null, passphrase: null });
    }

    return NextResponse.json({
      salt: userEncryption.salt,
      passphrase: userEncryption.passphrase,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}
