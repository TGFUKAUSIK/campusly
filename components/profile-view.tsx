"use client";

import {
  BedDouble,
  Bell,
  BookMarked,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  LogOut,
  Moon,
  Settings2,
  Sparkles,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { signOutFromVtop } from "@/lib/api/vtop-auth";
import { IconTile, Pill, SectionHeader } from "@/components/ui";
import { useCampusDataOrEmpty } from "@/lib/hooks/use-campus-data";
import { initials } from "@/lib/utils";

const campusServices = [
  { title: "Notes library", note: "Saved study files", href: "/notes", icon: BookMarked, tone: "bg-[#e6f3ed] text-[#337466]" },
  { title: "Community", note: "Study groups and resources", href: "/community", icon: UsersRound, tone: "bg-[#ebe8f8] text-[#776db7]" },
  { title: "Placements", note: "Career opportunities", href: "/placements", icon: BriefcaseBusiness, tone: "bg-[#fff0e9] text-[#d87960]" },
  { title: "Hostel", note: "Mess menu and leave requests", href: "/hostel", icon: BedDouble, tone: "bg-[#f4eedf] text-[#a78031]" }
];

export function ProfileView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: campus } = useCampusDataOrEmpty();
  const student = campus.student;

  async function handleSignOut() {
    try {
      await signOutFromVtop();
    } finally {
      await queryClient.clear();
      router.push("/auth/sign-in");
      router.refresh();
    }
  }

  return (
    <div className="space-y-7 px-5">
      <section className="glass-card rounded-[28px] p-5 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-[var(--brand)] text-2xl font-extrabold text-white shadow-float">
          {initials(student.name)}
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-[-0.06em]">{student.registrationNumber}</h2>
        <p className="mt-1 text-xs font-bold text-[var(--muted)]">{student.registrationNumber}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Pill tone="success">{student.program}</Pill>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Explore" title="Campus services" />
        <div className="grid grid-cols-2 gap-3">
          {campusServices.map((service) => (
            <Link className="glass-card rounded-[22px] p-3.5 text-left" href={service.href} key={service.title}>
              <IconTile className={service.tone} icon={service.icon} />
              <p className="mt-3 text-sm font-extrabold tracking-[-0.035em]">{service.title}</p>
              <p className="mt-1 text-[10px] font-bold leading-relaxed text-[var(--muted)]">{service.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-[#204e47] to-[#53736e] p-4 text-white shadow-float">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="section-kicker !text-white/55">Campusly AI</p>
            <h3 className="mt-1 text-base font-extrabold tracking-[-0.04em]">Your academic co-pilot</h3>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-white/65">
              Build a study plan, review attendance risks, and spot grade opportunities.
            </p>
          </div>
        </div>
        <button className="mt-4 w-full rounded-2xl bg-white px-3 py-2.5 text-xs font-extrabold text-[#204e47]">Ask Campusly AI</button>
      </section>

      <section>
        <SectionHeader title="Preferences" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {[
            { title: "Appearance", note: "System theme", icon: Moon },
            { title: "Notifications", note: "Classes, exams, updates", icon: Bell },
            { title: "App settings", note: "Sync and offline storage", icon: Settings2 },
            { title: "Help center", note: "Guides and support", icon: CircleHelp }
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

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-2 text-xs font-extrabold text-[var(--warm)]"
        onClick={() => void handleSignOut()}
        type="button"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
}
