import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const recent = searchParams.get("recent");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (recent === "true") {
    const logs = await prisma.workoutLog.findMany({
      where: { userId: session.user.id as string },
      include: { workout: true },
      orderBy: { date: "desc" },
      take: limit,
    });
    return NextResponse.json({ logs });
  }

  const where: any = {};
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;

  const workouts = await prisma.workout.findMany({
    where,
    include: { _count: { select: { exercises: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ workouts });
}
