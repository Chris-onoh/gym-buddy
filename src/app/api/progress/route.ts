import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.progress.findMany({
    where: { userId: session.user.id as string },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { weight, bodyFat, muscleMass, notes } = await req.json();
    const entry = await prisma.progress.create({
      data: {
        userId: session.user.id as string,
        weight: weight || null,
        bodyFat: bodyFat || null,
        muscleMass: muscleMass || null,
        notes: notes || null,
      },
    });

    // Also update user profile with latest metrics
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: {
        ...(weight ? { weight } : {}),
        ...(bodyFat ? { bodyFat } : {}),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.progress.deleteMany({
    where: { id, userId: session.user.id as string },
  });

  return NextResponse.json({ success: true });
}
