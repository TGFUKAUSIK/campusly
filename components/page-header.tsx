"use client";

import { Bell, ChevronDown } from "lucide-react";
import { SearchButton } from "@/components/command-palette";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";
import { initials } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  compact = false
}: {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const { data: campus } = useCampusDataOrEmpty();
  const student = campus.student;

  return (
    <header className="safe-top px-5 pb-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-[var(--brand)] text-sm font-extrabold text-white shadow-float">
            {initials(student.name)}
          </span>
          <div className="min-w-0">
            {compact ? <p className="section-kicker">Campusly</p> : <p className="text-xs font-bold text-[var(--muted)]">{subtitle ?? "Good morning"}</p>}
            <h1 className="truncate text-[21px] font-extrabold tracking-[-0.06em]">{title ?? student.firstName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchButton />
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-[var(--foreground)] shadow-sm backdrop-blur-xl dark:bg-white/10">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[var(--warm)]" />
          </button>
        </div>
      </div>
      {!compact ? (
        <button className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
          {student.semester}
          <ChevronDown size={13} />
        </button>
      ) : null}
    </header>
  );
}
