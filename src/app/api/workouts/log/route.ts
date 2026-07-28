import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workoutId, duration, notes } = await req.json();
    const log = await prisma.workoutLog.create({
      data: {
        userId: session.user.id as string,
        workoutId,
        duration: duration || 0,
        notes: notes || null,
      },
      include: { workout: true },
    });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log workout" }, { status: 500 });
  }
}
