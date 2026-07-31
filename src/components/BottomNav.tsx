"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Wrench, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/space", label: "Space", icon: Zap },
  { href: "/equipment", label: "Equipment", icon: Wrench },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-2 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around rounded-full border border-white/20 bg-slate-950/85 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 ${active
                ? "bg-white/20 text-white shadow-sm backdrop-blur-md"
                : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {active && <span className="whitespace-nowrap">{tab.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}