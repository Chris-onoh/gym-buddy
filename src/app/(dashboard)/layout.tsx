"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
        userName={session?.user?.name || undefined}
        userEmail={session?.user?.email || undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
