"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  UserCircle,
  CreditCard,
  Receipt,
  TrendingUp,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/classes",
    label: "Classes",
    icon: CalendarDays,
  },
  {
    href: "/workouts",
    label: "Workouts",
    icon: Dumbbell,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircle,
  },
  {
    href: "/membership",
    label: "Membership",
    icon: CreditCard,
  },
  {
    href: "/payments",
    label: "Payments",
    icon: Receipt,
  },
  {
    href: "/progress",
    label: "Progress",
    icon: TrendingUp,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Shield,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  onSignOut,
  userName,
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span
            className={cn(
              "font-bold text-lg text-gray-900 whitespace-nowrap transition-opacity",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            GymBuddy
          </span>
        </Link>
        <button
          onClick={onToggle}
          className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div
            className={cn(
              "overflow-hidden transition-opacity",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userEmail || ""}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span
            className={cn(
              collapsed ? "hidden" : "block"
            )}
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 animate-slide-up">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
