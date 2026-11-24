import { NextResponse } from "next/server";
import { requireAuth, withAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => {
  const session = await requireAuth();
  const { role, id: userId } = session.user;

  const where = role === "ADMIN" ? {} : { retailerId: userId };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      retailer: { select: { id: true, name: true, email: true } },
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
});
