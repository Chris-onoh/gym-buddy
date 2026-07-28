import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: { _count: { select: { bookings: true, waitlists: true } } },
  });

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const userBooking = await prisma.booking.findFirst({
    where: { userId: session.user.id as string, classId: params.id, status: "CONFIRMED" },
  });

  return NextResponse.json({ ...cls, userBooking: !!userBooking });
}
