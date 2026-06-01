import { AppShell } from "@/components/app-shell";
import { AttendanceDashboard } from "@/components/attendance-dashboard";
import { PageHeader } from "@/components/page-header";

export default function AttendancePage() {
  return (
    <AppShell>
      <PageHeader compact title="Attendance" />
      <AttendanceDashboard />
    </AppShell>
  );
}
