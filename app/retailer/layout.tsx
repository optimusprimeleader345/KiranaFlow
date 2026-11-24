import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { RetailerNav } from "@/components/RetailerNav";

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "RETAILER") redirect("/admin/orders");

  return (
    <div className="min-h-screen bg-gray-50">
      <RetailerNav user={session.user} />
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
