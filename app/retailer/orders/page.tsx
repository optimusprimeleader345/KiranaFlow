import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function RetailerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const params = await searchParams;

  const orders = await prisma.order.findMany({
    where: { retailerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <Link
          href="/retailer/order/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          + New Order
        </Link>
      </div>

      {params.placed && (
        <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 text-green-800 text-sm font-medium flex items-center gap-2">
          ✅ Order placed successfully! (#{params.placed.slice(-8)})
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="font-medium text-gray-600">No orders yet</p>
          <p className="text-sm mt-1">Place your first order using the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400 font-mono">#{order.id.slice(-8)}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {order.lines.length} item{order.lines.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.lines
                      .slice(0, 3)
                      .map((l) => l.product?.name ?? l.rawText)
                      .join(", ")}
                    {order.lines.length > 3 && ` +${order.lines.length - 3} more`}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
