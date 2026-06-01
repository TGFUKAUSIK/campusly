import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  action,
  href = "#"
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="section-kicker mb-1">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
      </div>
      {action ? (
        <Link className="flex items-center gap-1 text-xs font-bold text-[var(--brand)]" href={href}>
          {action}
          <ArrowUpRight size={13} strokeWidth={2.5} />
        </Link>
      ) : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
  className
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warm" | "violet";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
        tone === "default" && "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70",
        tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
        tone === "warm" && "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200",
        tone === "violet" && "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200",
        className
      )}
    >
      {children}
    </span>
  );
}

export function IconTile({
  icon: Icon,
  className
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span className={cn("grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]", className)}>
      <Icon size={18} strokeWidth={2.25} />
    </span>
  );
}

export function ProgressRing({
  value,
  size = 76,
  strokeWidth = 8,
  label
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="rgba(108, 132, 127, .15)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--brand)"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute text-center text-lg font-extrabold tracking-[-0.08em]">
        {value}
        <small className="text-[10px]">%</small>
        {label ? <span className="block text-[8px] font-bold tracking-normal text-[var(--muted)]">{label}</span> : null}
      </span>
    </div>
  );
}
