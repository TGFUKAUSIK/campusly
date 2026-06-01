"use client";

import { BookOpenText, CalendarDays, ChartNoAxesCombined, House, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/command-palette";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/attendance", label: "Attendance", icon: ChartNoAxesCombined },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/academics", label: "Academics", icon: BookOpenText },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md pb-28">
      {children}
      <CommandPalette />
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-white/50 bg-[var(--tab)] px-3 pt-2 shadow-[0_-8px_30px_rgba(40,70,65,.07)] backdrop-blur-2xl dark:border-white/5">
        <div className="grid grid-cols-5">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition",
                  active ? "text-[var(--brand)]" : "text-[var(--muted)]"
                )}
                href={tab.href}
                key={tab.href}
              >
                <span className={cn("grid h-7 w-10 place-items-center rounded-full transition", active && "bg-[var(--brand-soft)]")}>
                  <Icon fill={active ? "currentColor" : "none"} size={17} strokeWidth={active ? 2.4 : 2} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
