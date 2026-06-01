import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function AssignmentsPage() {
  return <AppShell><PageHeader compact title="Assignments" /><ServiceHub kind="assignments" /></AppShell>;
}
