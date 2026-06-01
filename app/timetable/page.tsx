import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { TimetableView } from "@/components/timetable-view";

export default function TimetablePage() {
  return (
    <AppShell>
      <PageHeader compact title="Timetable" />
      <TimetableView />
    </AppShell>
  );
}
