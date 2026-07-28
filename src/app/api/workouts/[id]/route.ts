import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workout = await prisma.workout.findUnique({
    where: { id: params.id },
    include: { exercises: { orderBy: { order: "asc" } }, _count: { select: { exercises: true } } },
  });

  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workout);
}
