import { prisma } from "@/lib/db";
import { AdminOrderTable } from "@/components/AdminOrderTable/AdminOrderTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      retailer: { select: { name: true, email: true } },
      lines: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  const total = orders.reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} orders · {pending} pending · ₹{total.toFixed(2)} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orders.length, color: "text-gray-900" },
          { label: "Pending", value: pending, color: "text-yellow-700" },
          { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, color: "text-green-700" },
          { label: "Revenue", value: `₹${total.toFixed(0)}`, color: "text-blue-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <AdminOrderTable
        initialOrders={orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
