import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let membership = await prisma.membership.findUnique({
    where: { userId: session.user.id as string },
  });

  if (!membership) {
    // Create default membership
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    membership = await prisma.membership.create({
      data: {
        userId: session.user.id as string,
        plan: "BASIC",
        status: "ACTIVE",
        endDate,
      },
    });
  }

  return NextResponse.json(membership);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { plan } = await req.json();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const membership = await prisma.membership.upsert({
      where: { userId: session.user.id as string },
      update: { plan, status: "ACTIVE", endDate },
      create: {
        userId: session.user.id as string,
        plan,
        status: "ACTIVE",
        endDate,
      },
    });

    return NextResponse.json(membership);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
