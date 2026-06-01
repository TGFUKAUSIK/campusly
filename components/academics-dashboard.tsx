"use client";

import { Award, BookOpenText, ChevronRight, Download, Sparkles, Target } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { IconTile, Pill, SectionHeader } from "@/components/ui";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";

export function AcademicsDashboard() {
  const { data: campus } = useCampusDataOrEmpty();
  const { student, gradeTrend, academicSubjects, assignments } = campus;
  const gpaDomain = gradeTrend.length
    ? [Math.max(0, Math.min(...gradeTrend.map((point) => point.gpa)) - 0.4), Math.max(...gradeTrend.map((point) => point.gpa)) + 0.2)]
    : [0, 10];

  return (
    <div className="space-y-7 px-5">
      <section className="relative overflow-hidden rounded-[28px] bg-[#174d45] p-5 text-white shadow-float">
        <div className="absolute -right-9 -top-10 h-40 w-40 rounded-full border-[28px] border-white/5" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Academic standing</p>
        <div className="relative mt-2 flex items-end justify-between">
          <div>
            <p className="text-[48px] font-extrabold leading-none tracking-[-0.12em]">{student.cgpa}</p>
            <p className="mt-2 text-xs font-bold text-white/65">CGPA · {student.credits} credits earned</p>
          </div>
          <Pill className="bg-white/10 text-white">Live</Pill>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Recent semesters" title="GPA trajectory" />
        <div className="glass-card h-52 rounded-[26px] p-3">
          <ResponsiveContainer height="100%" initialDimension={{ width: 340, height: 184 }} minWidth={0} width="100%">
            <LineChart data={gradeTrend} margin={{ left: -22, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(110,135,130,.12)" strokeDasharray="4 6" vertical={false} />
              <XAxis axisLine={false} dataKey="semester" fontSize={10} tickLine={false} />
              <YAxis axisLine={false} domain={gpaDomain} fontSize={10} tickLine={false} />
              <Tooltip />
              <Line dataKey="gpa" dot={{ fill: "var(--brand)", r: 4 }} stroke="var(--brand)" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <SectionHeader action="Export" href="#" title="Current semester" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {academicSubjects.map((subject) => (
            <div className="flex items-center gap-3 py-4" key={subject.code}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-base font-extrabold text-[var(--brand)]">
                {subject.grade}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold tracking-[-0.025em]">{subject.subject}</p>
                <p className="mt-1 text-[11px] font-bold text-[var(--muted)]">
                  {subject.code} · {subject.credits} credits
                </p>
              </div>
              <p className="text-sm font-extrabold">{subject.score}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Academic tools" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "GPA predictor", note: "Plan target grades", icon: Target, tone: "bg-[#e6f3ed] text-[#337466]" },
            { title: "AI insights", note: "Spot opportunities", icon: Sparkles, tone: "bg-[#ebe8f8] text-[#776db7]" },
            { title: "Grade report", note: "Export as PDF", icon: Download, tone: "bg-[#fff0e9] text-[#d87960]" },
            { title: "Milestones", note: "View progress", icon: Award, tone: "bg-[#f4eedf] text-[#a78031]" }
          ].map((item) => (
            <button className="glass-card rounded-[22px] p-3.5 text-left" key={item.title}>
              <IconTile className={item.tone} icon={item.icon} />
              <p className="mt-3 text-sm font-extrabold tracking-[-0.035em]">{item.title}</p>
              <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">{item.note}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Planner" title="Assignments" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {assignments.map((item) => (
            <button className="flex w-full items-center gap-3 py-4 text-left" key={item.title}>
              <IconTile className="bg-[#fff0e9] text-[#d87960]" icon={BookOpenText} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold tracking-[-0.025em]">{item.title}</span>
                <span className="mt-1 block text-[11px] font-semibold text-[var(--muted)]">
                  {item.subject} · {item.due}
                </span>
              </span>
              <ChevronRight className="text-[var(--muted)]" size={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
