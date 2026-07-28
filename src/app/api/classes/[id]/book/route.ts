import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { date } = await req.json();
    const userId = session.user.id as string;

    // Check existing booking
    const existing = await prisma.booking.findFirst({
      where: { userId, classId: params.id, status: "CONFIRMED" },
    });
    if (existing) return NextResponse.json({ error: "Already booked" }, { status: 409 });

    // Check capacity
    const cls = await prisma.class.findUnique({ where: { id: params.id }, include: { _count: { select: { bookings: true } } } });
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const count = cls._count?.bookings || 0;
    if (count >= cls.capacity) {
      // Join waitlist
      const waitlistCount = await prisma.waitlist.count({ where: { classId: params.id, date: new Date(date) } });
      const wl = await prisma.waitlist.create({
        data: {
          userId, classId: params.id,
          date: new Date(date),
          position: waitlistCount + 1,
        },
      });
      return NextResponse.json({ waitlisted: true, ...wl }, { status: 201 });
    }

    const booking = await prisma.booking.create({
      data: { userId, classId: params.id, date: new Date(date) },
      include: { class: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.user.id as string;
    const booking = await prisma.booking.findFirst({
      where: { userId, classId: params.id, status: "CONFIRMED" },
    });

    if (!booking) return NextResponse.json({ error: "No active booking" }, { status: 404 });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // Promote first waitlist entry
    const nextWaitlist = await prisma.waitlist.findFirst({
      where: { classId: params.id },
      orderBy: { position: "asc" },
    });

    if (nextWaitlist) {
      await prisma.booking.create({
        data: { userId: nextWaitlist.userId, classId: params.id, date: nextWaitlist.date },
      });
      await prisma.waitlist.delete({ where: { id: nextWaitlist.id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
