import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const upcoming = searchParams.get("upcoming");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (type) where.type = type;

  const classes = await prisma.class.findMany({
    where,
    include: { _count: { select: { bookings: true, waitlists: true } } },
    orderBy: { dayOfWeek: "asc" },
    take: limit,
  });

  let result: any[] = classes;
  if (upcoming === "true") {
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id as string, status: "CONFIRMED" },
      include: { class: true },
      orderBy: { date: "asc" },
      take: limit,
    });
    result = bookings;
  }

  return NextResponse.json({ classes: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const cls = await prisma.class.create({ data });
    return NextResponse.json(cls, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
