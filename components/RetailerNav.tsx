"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface NavProps {
  user: { name?: string | null; email?: string | null };
}

export function RetailerNav({ user }: NavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/retailer/order/new" className="flex items-center gap-2 font-bold text-blue-600">
          🛒 <span className="hidden sm:inline">FMCG Orders</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/retailer/orders" className="text-sm text-gray-600 hover:text-gray-900">
            My Orders
          </Link>
          <Link href="/retailer/order/new" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
            + New Order
          </Link>
          <div className="hidden sm:block text-sm text-gray-500">{user.name}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
