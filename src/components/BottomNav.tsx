"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Wrench, User } from "lucide-react";

const tabs = [
  { href: "/portal", label: "Portal", icon: Home },
  { href: "/space", label: "Space", icon: Zap },
  { href: "/equipment", label: "Equipment", icon: Wrench },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-2 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around rounded-full border border-amber-400/20 bg-slate-950/90 p-2 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all duration-300 active:scale-95 ${active
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
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