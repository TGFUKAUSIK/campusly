"use client";

import { Clock3, MapPin, Radio, UserRound } from "lucide-react";
import { Pill } from "@/components/ui";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";

export function TimetableView() {
  const { data: campus } = useCampusDataOrEmpty();
  const { todayClasses, weekDays, timetableDateLabel, nextFreeSlot } = campus;

  return (
    <div className="px-5">
      <section className="glass-card flex justify-between rounded-[24px] p-2">
        {weekDays.map((item) => (
          <button
            className={`grid min-h-[60px] w-11 place-items-center rounded-[18px] px-1 py-2 transition ${
              item.active ? "bg-[var(--brand)] text-white shadow-float" : "text-[var(--muted)]"
            }`}
            key={item.day}
          >
            <span className="text-[10px] font-bold">{item.day}</span>
            <span className="text-sm font-extrabold">{item.date}</span>
          </button>
        ))}
      </section>

      <div className="mb-3 mt-7 flex items-center justify-between">
        <div>
          <p className="section-kicker">{timetableDateLabel}</p>
          <h2 className="section-title mt-1">Today&apos;s classes</h2>
        </div>
        <Pill tone="success">{todayClasses.length} classes</Pill>
      </div>

      <section className="relative space-y-3 before:absolute before:bottom-8 before:left-[27px] before:top-8 before:w-px before:bg-[var(--line)]">
        {todayClasses.map((item) => (
          <article
            className={`glass-card relative overflow-hidden rounded-[24px] p-4 pl-[74px] ${item.active ? "ring-2 ring-[var(--brand)]/70" : ""}`}
            key={`${item.time}-${item.code}`}
          >
            <div className="absolute bottom-0 left-0 top-0 w-[58px] p-3 text-center" style={{ background: item.color }}>
              <p className="text-xs font-extrabold text-[#25433e]">{item.time}</p>
              <p className="mt-1 text-[9px] font-bold text-[#5f7d77]">{item.endTime}</p>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-[var(--muted)]">{item.code}</p>
                  {item.active ? (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-[var(--warm)]">
                      <Radio size={11} /> Live
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1 text-sm font-extrabold leading-tight tracking-[-0.035em]">{item.title}</h3>
              </div>
              <Pill>{item.type}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {item.room}
              </span>
              <span className="flex items-center gap-1">
                <UserRound size={12} />
                {item.faculty}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 flex items-center gap-3 rounded-[22px] bg-[#174d45] p-4 text-white shadow-float">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
          <Clock3 size={18} />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">Next free slot</p>
          <p className="mt-1 text-sm font-extrabold">{nextFreeSlot}</p>
        </div>
      </section>
    </div>
  );
}
