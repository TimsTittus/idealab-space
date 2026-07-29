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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-light bg-surface/80 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 active:scale-95 ${active
                ? "bg-text-primary text-white shadow-lg shadow-text-primary/20"
                : "text-text-tertiary hover:text-text-secondary"
                }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-white" : ""}`} />
              {active && (
                <span className="text-xs font-semibold">{tab.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}