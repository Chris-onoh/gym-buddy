import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { name: true, email: true, phone: true, weight: true, height: true, bodyFat: true, goals: true },
  });

  return NextResponse.json(user || {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const user = await prisma.user.update({
      where: { id: session.user.id as string },
      data: {
        name: data.name,
        phone: data.phone,
        weight: data.weight,
        height: data.height,
        bodyFat: data.bodyFat,
        goals: data.goals,
      },
      select: { name: true, email: true, phone: true, weight: true, height: true, bodyFat: true, goals: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
