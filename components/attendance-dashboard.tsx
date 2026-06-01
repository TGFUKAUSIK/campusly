"use client";

import { CalendarCheck2, Calculator, ChevronRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { calculateMissableClasses, calculateRequiredClasses } from "@/lib/api/attendance";
import { IconTile, Pill, ProgressRing, SectionHeader } from "@/components/ui";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";

export function AttendanceDashboard() {
  const { data: campus, isError } = useCampusDataOrEmpty();

  if (isError) {
    return (
      <div className="px-5 py-8 text-center text-sm font-bold text-[var(--warm)]">
        Unable to load attendance. Sign in again and refresh.
      </div>
    );
  }

  const {
    overallAttendance,
    subjects,
    weeklyAttendance,
    attended,
    conducted,
    missed,
    marginTitle,
    marginHint,
    trendFooter
  } = campus;

  return (
    <div className="space-y-7 px-5">
      <section className="glass-card overflow-hidden rounded-[28px]">
        <div className="flex items-center gap-4 p-5">
          <ProgressRing size={94} strokeWidth={9} value={overallAttendance} />
          <div>
            <p className="section-kicker">Overall attendance</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.06em]">{marginTitle}</h2>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[var(--muted)]">{marginHint}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-[var(--line)]">
          {[
            [String(attended), "Attended"],
            [String(conducted), "Conducted"],
            [String(missed), "Missed"]
          ].map(([value, label]) => (
            <div className="border-r border-[var(--line)] px-2 py-3 text-center last:border-r-0" key={label}>
              <p className="text-lg font-extrabold tracking-[-0.06em]">{value}</p>
              <p className="text-[10px] font-bold text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Last 6 days" title="Weekly rhythm" />
        <div className="glass-card h-48 rounded-[26px] px-3 pb-2 pt-4">
          <ResponsiveContainer height="100%" initialDimension={{ width: 340, height: 168 }} minWidth={0} width="100%">
            <BarChart data={weeklyAttendance}>
              <XAxis axisLine={false} dataKey="day" fontSize={10} tickLine={false} />
              <Tooltip cursor={false} />
              <Bar dataKey="value" fill="var(--brand)" radius={[7, 7, 7, 7]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <SectionHeader action="History" href="#" title="By subject" />
        <div className="space-y-3">
          {subjects.map((subject) => {
            const percentage = subject.total ? Math.round((subject.attended / subject.total) * 100) : 0;
            const hint =
              percentage < 75
                ? `Attend next ${calculateRequiredClasses(subject.attended, subject.total)}`
                : `Can miss ${calculateMissableClasses(subject.attended, subject.total)}`;
            return (
              <article className="glass-card rounded-[24px] p-4" key={subject.code}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[var(--muted)]">{subject.code}</p>
                    <h3 className="mt-1 truncate text-sm font-extrabold tracking-[-0.03em]">{subject.shortName}</h3>
                  </div>
                  <Pill tone={percentage < 75 ? "warm" : "success"}>{percentage}%</Pill>
                </div>
                <div className="mt-4 h-2 rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-full rounded-full" style={{ background: subject.color, width: `${percentage}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
                  <span>
                    {subject.attended} of {subject.total} classes
                  </span>
                  <span>{hint}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="Smart tools" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {[
            { title: "Missable classes", note: "Plan a break without falling behind", icon: CalendarCheck2 },
            { title: "Required classes", note: "See your path back above 75%", icon: Calculator },
            { title: "Attendance advisor", note: "Get a personalized weekly strategy", icon: ShieldCheck }
          ].map((item) => (
            <button className="flex w-full items-center gap-3 py-4 text-left" key={item.title}>
              <IconTile icon={item.icon} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold tracking-[-0.025em]">{item.title}</span>
                <span className="mt-1 block text-[11px] font-semibold text-[var(--muted)]">{item.note}</span>
              </span>
              <ChevronRight className="text-[var(--muted)]" size={17} />
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-2xl bg-[var(--brand-soft)] px-3 py-2.5 text-[11px] font-bold text-[var(--brand)]">
        <TrendingUp size={15} />
        {trendFooter}
      </div>
    </div>
  );
}
