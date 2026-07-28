import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeOpayPayment } from "@/lib/opay";
import { generateReference } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, type, description } = await req.json();
    const reference = generateReference();

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id as string,
        amount,
        type: type || "OTHER",
        description: description || "",
        reference,
      },
    });

    // Attempt OPay initialization (falls back gracefully)
    try {
      const opayResult = await initializeOpayPayment({
        amount,
        email: session.user.email || "",
        name: session.user.name || "User",
        description: description || "GymBuddy Payment",
        type,
      });

      if (opayResult.success) {
        return NextResponse.json({
          payment,
          paymentUrl: opayResult.data?.data?.cashierUrl || null,
        });
      }
    } catch (err) {
      console.error("OPay init failed:", err);
    }

    // If OPay fails, just return the payment record (for demo)
    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
