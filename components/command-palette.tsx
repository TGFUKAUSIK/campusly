"use client";

import { BookOpenText, CalendarDays, ChartNoAxesCombined, FileText, GraduationCap, House, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/use-app-store";

const destinations = [
  { label: "Home dashboard", href: "/", icon: House, keywords: "overview today" },
  { label: "Attendance analytics", href: "/attendance", icon: ChartNoAxesCombined, keywords: "missable required classes" },
  { label: "Timetable", href: "/timetable", icon: CalendarDays, keywords: "schedule faculty room" },
  { label: "Academics", href: "/academics", icon: GraduationCap, keywords: "cgpa grade marks" },
  { label: "Assignments", href: "/assignments", icon: BookOpenText, keywords: "planner due submission" },
  { label: "Exams", href: "/exams", icon: FileText, keywords: "schedule results countdown" },
  { label: "Notes library", href: "/notes", icon: FileText, keywords: "offline upload download" },
  { label: "Profile and services", href: "/profile", icon: UserRound, keywords: "settings hostel placement community" }
];

export function SearchButton() {
  const setOpen = useAppStore((state) => state.setCommandPaletteOpen);

  return (
    <button
      aria-label="Search"
      className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-[var(--foreground)] shadow-sm backdrop-blur-xl dark:bg-white/10"
      onClick={() => setOpen(true)}
    >
      <Search size={18} />
    </button>
  );
}

export function CommandPalette() {
  const isOpen = useAppStore((state) => state.isCommandPaletteOpen);
  const setOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = destinations.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(normalizedQuery));

  return (
    <div className="fixed inset-0 z-[70] bg-[#11201e]/45 px-4 pt-[max(5rem,env(safe-area-inset-top))] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <section className="mx-auto max-w-md overflow-hidden rounded-[26px] bg-[var(--card-solid)] shadow-float" onClick={(event) => event.stopPropagation()}>
        <label className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search className="text-[var(--muted)]" size={18} />
          <input
            autoFocus
            className="min-h-14 w-full bg-transparent text-sm font-bold outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Campusly"
            value={query}
          />
          <button aria-label="Close search" className="text-[var(--muted)]" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </label>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition active:bg-[var(--brand-soft)]"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}
          {filtered.length === 0 ? <p className="px-3 py-8 text-center text-xs font-bold text-[var(--muted)]">No matching campus tools.</p> : null}
        </div>
      </section>
    </div>
  );
}
