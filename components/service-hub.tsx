import {
  BedDouble,
  BellRing,
  BookMarked,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  MessageCircle,
  Plus,
  Send,
  UploadCloud,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconTile, Pill, SectionHeader } from "@/components/ui";

type HubConfig = {
  eyebrow: string;
  intro: string;
  metric: string;
  metricLabel: string;
  primaryAction: string;
  icon: LucideIcon;
  items: Array<{ title: string; note: string; meta: string; icon: LucideIcon; tone?: "default" | "success" | "warm" | "violet" }>;
};

const hubs: Record<string, HubConfig> = {
  assignments: {
    eyebrow: "Productivity",
    intro: "Keep submissions moving without losing sight of your week.",
    metric: "3",
    metricLabel: "active tasks",
    primaryAction: "Add assignment",
    icon: CheckCircle2,
    items: [
      { title: "React performance audit", note: "Web Programming · due tomorrow", meta: "72%", icon: FileText, tone: "warm" },
      { title: "Search algorithms worksheet", note: "Artificial Intelligence · Sep 18", meta: "35%", icon: FileText, tone: "violet" },
      { title: "UML case study", note: "Software Engineering · Sep 22", meta: "10%", icon: FileText }
    ]
  },
  exams: {
    eyebrow: "Exam radar",
    intro: "See the next assessment, room, and preparation window at a glance.",
    metric: "8",
    metricLabel: "days to CAT 2",
    primaryAction: "Build study plan",
    icon: CalendarClock,
    items: [
      { title: "CAT 2 · Web Programming", note: "Sep 24 · 09:00 · SJT 403", meta: "8 days", icon: CalendarClock, tone: "warm" },
      { title: "CAT 2 · Artificial Intelligence", note: "Sep 26 · 14:00 · TT 504", meta: "10 days", icon: CalendarClock, tone: "violet" },
      { title: "Lab FAT · Software Engineering", note: "Oct 08 · PRP 118", meta: "22 days", icon: CalendarClock }
    ]
  },
  notes: {
    eyebrow: "Offline library",
    intro: "Keep the files you need close, even between Wi-Fi zones.",
    metric: "18",
    metricLabel: "files offline",
    primaryAction: "Upload notes",
    icon: BookMarked,
    items: [
      { title: "React rendering patterns.pdf", note: "Web Programming · 2.4 MB", meta: "Offline", icon: Download, tone: "success" },
      { title: "Search strategies.pdf", note: "Artificial Intelligence · 1.8 MB", meta: "Offline", icon: Download, tone: "success" },
      { title: "UML reference guide.pdf", note: "Software Engineering · 4.1 MB", meta: "Cloud", icon: UploadCloud }
    ]
  },
  community: {
    eyebrow: "Student network",
    intro: "Share resources, find study circles, and keep discussions useful.",
    metric: "12",
    metricLabel: "new posts",
    primaryAction: "Start a discussion",
    icon: UsersRound,
    items: [
      { title: "CAT 2 revision circle", note: "AI study group · 24 members", meta: "Join", icon: UsersRound, tone: "violet" },
      { title: "Best linear algebra resources", note: "Shared by Meera · 18 replies", meta: "Popular", icon: MessageCircle, tone: "warm" },
      { title: "Web programming cheatsheet", note: "Shared by Aditya · 36 saves", meta: "Save", icon: BookMarked }
    ]
  },
  placements: {
    eyebrow: "Career center",
    intro: "Track opportunities that match your profile and keep applications tidy.",
    metric: "3",
    metricLabel: "eligible roles",
    primaryAction: "Review profile",
    icon: BriefcaseBusiness,
    items: [
      { title: "Product Engineering Intern", note: "Microsoft · apply by Sep 21", meta: "Eligible", icon: BriefcaseBusiness, tone: "success" },
      { title: "Software Developer Intern", note: "Atlassian · apply by Sep 24", meta: "Eligible", icon: BriefcaseBusiness, tone: "success" },
      { title: "Data Analyst Intern", note: "Deloitte · application sent", meta: "Applied", icon: Send, tone: "violet" }
    ]
  },
  hostel: {
    eyebrow: "Hostel desk",
    intro: "Handle food, room requests, and leave without another portal visit.",
    metric: "SJT",
    metricLabel: "Block B · 312",
    primaryAction: "New leave request",
    icon: BedDouble,
    items: [
      { title: "Dinner tonight", note: "Paneer tikka · dal · rice · roti", meta: "Menu", icon: BedDouble, tone: "warm" },
      { title: "Weekend leave request", note: "Sep 19 - Sep 20 · approved", meta: "Approved", icon: CheckCircle2, tone: "success" },
      { title: "Room maintenance", note: "Electrical issue · in progress", meta: "Open", icon: BellRing, tone: "violet" }
    ]
  }
};

export function ServiceHub({ kind }: { kind: keyof typeof hubs }) {
  const hub = hubs[kind];
  const HubIcon = hub.icon;

  return (
    <div className="space-y-7 px-5">
      <section className="relative overflow-hidden rounded-[28px] bg-[#174d45] p-5 text-white shadow-float">
        <HubIcon className="absolute -right-2 -top-3 text-white/10" size={116} strokeWidth={1.5} />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{hub.eyebrow}</p>
        <p className="relative mt-3 max-w-[240px] text-sm font-semibold leading-relaxed text-white/75">{hub.intro}</p>
        <div className="relative mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[36px] font-extrabold leading-none tracking-[-0.1em]">{hub.metric}</p>
            <p className="mt-1 text-[11px] font-bold text-white/60">{hub.metricLabel}</p>
          </div>
          <button className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-[11px] font-extrabold text-[#174d45]">
            <Plus size={14} />
            {hub.primaryAction}
          </button>
        </div>
      </section>

      <section>
        <SectionHeader title="Your updates" />
        <div className="glass-card divide-y divide-[var(--line)] rounded-[26px] px-4">
          {hub.items.map((item) => (
            <button className="flex w-full items-center gap-3 py-4 text-left" key={item.title}>
              <IconTile icon={item.icon} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold tracking-[-0.025em]">{item.title}</span>
                <span className="mt-1 block truncate text-[11px] font-semibold text-[var(--muted)]">{item.note}</span>
              </span>
              <Pill tone={item.tone}>{item.meta}</Pill>
            </button>
          ))}
        </div>
      </section>

      <button className="glass-card flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left text-xs font-extrabold">
        View complete history
        <ChevronRight className="text-[var(--muted)]" size={16} />
      </button>
    </div>
  );
}
