import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <AppShell>
      <PageHeader />
      <Dashboard />
    </AppShell>
  );
}
