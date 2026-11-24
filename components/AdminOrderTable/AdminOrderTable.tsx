"use client";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

const ALL_STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  retailer: { name: string; email: string };
  lines: Array<{ rawText: string; quantity: number | null; unit: string | null; product: { name: string } | null }>;
}

interface Props {
  initialOrders: Order[];
}

export function AdminOrderTable({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } finally {
      setUpdating(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-3">📦</p>
        <p className="font-medium text-gray-600">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="p-4 flex items-start gap-4 flex-wrap cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            {/* Order id + retailer */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-gray-400">#{order.id.slice(-8)}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="font-semibold text-gray-900 mt-1">{order.retailer.name}</p>
              <p className="text-xs text-gray-500">{order.retailer.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>

            {/* Amount + status control */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="text-xl font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{order.lines.length} line{order.lines.length !== 1 ? "s" : ""}</p>
              <select
                value={order.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                disabled={updating === order.id}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updating === order.id && (
                <span className="text-xs text-blue-600 animate-pulse">Updating…</span>
              )}
            </div>
          </div>

          {/* Expanded order lines */}
          {expanded === order.id && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">Order Lines</p>
              <div className="space-y-1.5">
                {order.lines.map((line, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {line.product?.name ?? line.rawText}
                    </span>
                    <span className="text-gray-500">
                      {line.quantity} {line.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
