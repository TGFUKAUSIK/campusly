"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CloudSun,
  FileText,
  Flame,
  Sparkles,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { IconTile, Pill, ProgressRing, SectionHeader } from "@/components/ui";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";

const quickActions = [
  { label: "My notes", href: "/notes", icon: FileText, color: "bg-[#e6f3ed] text-[#337466]" },
  { label: "Upload", href: "/notes", icon: UploadCloud, color: "bg-[#fff0e9] text-[#d87960]" },
  { label: "Planner", href: "/assignments", icon: CalendarDays, color: "bg-[#f4eedf] text-[#a78031]" },
  { label: "AI guide", href: "/profile", icon: Sparkles, color: "bg-[#ebe8f8] text-[#776db7]" }
];

export function Dashboard() {
  const { data: campus } = useCampusDataOrEmpty();
  const {
    student,
    todayClasses,
    assignments,
    exams,
    overallAttendance,
    marginTitle,
    marginHint,
    attended,
    conducted
  } = campus;

  const heroDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
  const upcoming = todayClasses.slice(1, 4);
  const nextExam = exams[0];

  return (
    <>
      <section className="px-5">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[30px] bg-[#174d45] p-5 text-white shadow-float"
          initial={{ opacity: 0, y: 12 }}
        >
          <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full border-[24px] border-white/5" />
          <div className="absolute bottom-[-45px] right-12 h-28 w-28 rounded-full bg-[#f9b991]/20 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">{heroDate}</p>
              <h2 className="mt-2 text-[27px] font-extrabold leading-tight tracking-[-0.08em]">
                Keep your<br />momentum going.
              </h2>
            </div>
            <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur">
              <CloudSun size={24} />
              <p className="mt-1 text-xs font-bold">28°</p>
            </div>
          </div>
          <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Flame className="text-[#ffbb8c]" fill="currentColor" size={17} />
              {student.registrationNumber || "VTOP connected"}
            </div>
            <Pill className="bg-white/15 text-white">On track</Pill>
          </div>
        </motion.div>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader action="Details" href="/attendance" title="Attendance" />
        <Link className="glass-card flex items-center gap-4 rounded-[26px] p-4 transition active:scale-[.99]" href="/attendance">
          <ProgressRing label="overall" size={78} value={overallAttendance} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold tracking-[-0.03em]">{marginTitle}</p>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[var(--muted)]">{marginHint}</p>
              </div>
              <ChevronRight className="shrink-0 text-[var(--muted)]" size={17} />
            </div>
            <div className="mt-3 flex gap-2">
              <Pill tone="success">{attended} attended</Pill>
              <Pill>{conducted} total</Pill>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-7">
        <div className="px-5">
          <SectionHeader action="Full day" href="/timetable" title="Up next" />
        </div>
        <div className="flex snap-x gap-3 overflow-x-auto px-5 pb-3">
          {upcoming.map((item, index) => (
            <Link
              className="glass-card min-w-[238px] snap-start rounded-[24px] p-4 transition active:scale-[.99]"
              href="/timetable"
              key={`${item.code}-${item.time}`}
            >
              <div className="flex items-start justify-between gap-3">
                <Pill tone={index === 0 ? "warm" : "default"}>{index === 0 ? "Now" : item.time}</Pill>
                <span className="text-[10px] font-bold text-[var(--muted)]">{item.type}</span>
              </div>
              <h3 className="mt-4 text-base font-extrabold leading-tight tracking-[-0.045em]">{item.title}</h3>
              <p className="mt-3 text-[11px] font-bold text-[var(--muted)]">
                {item.room} · {item.faculty}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <SectionHeader title="Quick actions" />
        <div className="glass-card grid grid-cols-4 gap-1 rounded-[26px] p-3">
          {quickActions.map((action) => (
            <Link className="flex flex-col items-center gap-2 rounded-2xl py-2 text-center active:bg-black/5" href={action.href} key={action.label}>
              <IconTile className={action.color} icon={action.icon} />
              <span className="text-[10px] font-bold text-[var(--muted)]">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader action="View all" href="/academics" title="Academics" />
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-[24px] p-4">
            <p className="section-kicker">Current CGPA</p>
            <p className="mt-2 text-[33px] font-extrabold tracking-[-0.09em] text-[var(--brand)]">{student.cgpa}</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ArrowRight className="-rotate-45" size={14} />
              Live from VTOP
            </div>
          </div>
          <div className="glass-card rounded-[24px] p-4">
            <p className="section-kicker">Credits</p>
            <p className="mt-2 text-[33px] font-extrabold tracking-[-0.09em] text-[var(--brand)]">{student.credits}</p>
            <p className="mt-3 text-[11px] font-bold text-[var(--muted)]">earned credits</p>
          </div>
        </div>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader action="Open planner" href="/assignments" title="Due soon" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {assignments.slice(0, 2).map((item) => (
            <div className="flex items-center gap-3 py-4" key={item.title}>
              <IconTile className="bg-[#fff0e9] text-[#d87960]" icon={BookOpenCheck} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold tracking-[-0.025em]">{item.title}</p>
                <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
                  {item.subject} · {item.due}
                </p>
              </div>
              <Pill tone={item.priority === "High" ? "warm" : "default"}>{item.progress}%</Pill>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Exam radar" />
        <div className="glass-card overflow-hidden rounded-[26px]">
          {nextExam ? (
            <>
              <div className="bg-[var(--brand)] p-4 text-white">
                <div className="flex items-center gap-2">
                  <CalendarClock size={18} />
                  <p className="text-sm font-bold">
                    {nextExam.title} begins in {nextExam.days} days
                  </p>
                </div>
                <p className="mt-2 text-xs font-semibold text-white/60">
                  {nextExam.detail} · {nextExam.date}
                </p>
              </div>
              <Link className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold" href="/exams">
                Build an AI study plan
                <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="p-4 text-sm font-bold text-[var(--muted)]">No upcoming exams in the current semester.</div>
          )}
        </div>
      </section>
    </>
  );
}
