import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, withAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { calculateLineTotal, calculateOrderTotal } from "@/lib/pricing/calculate";

const ConfirmedLineSchema = z.object({
  rawText: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  matchStatus: z.enum(["matched", "needs_review", "not_found"]),
  matchScore: z.number().min(0).max(1).optional(),
});

const ConfirmOrderSchema = z.object({
  lines: z.array(ConfirmedLineSchema).min(1),
  notes: z.string().max(500).optional(),
});

export const POST = withAuth(async (req: Request) => {
  const session = await requireRole("RETAILER");
  const retailerId = session.user.id;

  const body = await req.json();
  const parsed = ConfirmOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { lines, notes } = parsed.data;

  // Load products for pricing
  const productIds = Array.from(new Set(lines.map((l) => l.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calculate prices
  const pricedLines = lines.map((line) => {
    const product = productMap.get(line.productId);
    if (!product) {
      throw new Error(`Product ${line.productId} not found`);
    }
    const priced = calculateLineTotal(product, line.quantity, line.unit);
    return {
      rawText: line.rawText,
      productId: line.productId,
      quantity: line.quantity,
      unit: line.unit,
      matchStatus: line.matchStatus.toUpperCase() as "MATCHED" | "NEEDS_REVIEW" | "NOT_FOUND",
      matchScore: line.matchScore ?? null,
      unitPrice: priced?.unitPrice ?? product.pricePerUnit,
      totalPrice: priced?.totalPrice ?? 0,
    };
  });

  const totalAmount = calculateOrderTotal(
    pricedLines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unit: l.unit,
      unitPrice: l.unitPrice,
      totalPrice: l.totalPrice,
    }))
  );

  const order = await prisma.order.create({
    data: {
      retailerId,
      status: "PENDING",
      totalAmount,
      notes: notes ?? null,
      lines: {
        create: pricedLines,
      },
    },
    include: { lines: true },
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
});
