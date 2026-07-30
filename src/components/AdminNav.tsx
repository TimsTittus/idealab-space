"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, Calendar, Home } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/admin", label: "Analytics", icon: LayoutDashboard },
    { href: "/admin/equipment", label: "Equipment", icon: Wrench },
    { href: "/admin/events", label: "Events", icon: Calendar },
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-20 hidden sm:block">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${active
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "text-amber-600" : "text-slate-400"
                    }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${active
                  ? "bg-amber-500 text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all"
            title="App Home"
          >
            <Home className="h-5 w-5" />
            <span className="text-[11px] font-semibold">App</span>
          </Link>
        </div>
      </div>
    </>
  );
}