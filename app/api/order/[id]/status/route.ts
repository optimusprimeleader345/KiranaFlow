import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, withAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

const StatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const PATCH = withAuth(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireRole("ADMIN");

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  }
);
