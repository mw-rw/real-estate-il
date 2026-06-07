"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  Bell,
  FileBarChart,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/properties", label: "נכסים", icon: Building2 },
  { href: "/leads", label: "לידים", icon: Users },
  { href: "/alerts", label: "התראות", icon: Bell },
  { href: "/reports", label: "דוחות", icon: FileBarChart },
  { href: "/documents", label: "מסמכים", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col h-full min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-lg tracking-tight">נדל&quot;ן IL</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">מערכת ניהול נכסים</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-slate-700 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronLeft className="w-4 h-4 mr-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>יציאה</span>
        </button>
      </div>
    </aside>
  );
}
