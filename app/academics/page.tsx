import { AcademicsDashboard } from "@/components/academics-dashboard";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function AcademicsPage() {
  return (
    <AppShell>
      <PageHeader compact title="Academics" />
      <AcademicsDashboard />
    </AppShell>
  );
}
