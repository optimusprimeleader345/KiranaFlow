"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface NavProps {
  user: { name?: string | null; email?: string | null };
}

export function AdminNav({ user }: NavProps) {
  return (
    <nav className="bg-blue-700 text-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          📦 <span>Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-sm hover:text-blue-200">
            All Orders
          </Link>
          <div className="hidden sm:block text-sm text-blue-200">{user.name}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-blue-200 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
