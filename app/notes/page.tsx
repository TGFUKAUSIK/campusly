import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function NotesPage() {
  return <AppShell><PageHeader compact title="Notes" /><ServiceHub kind="notes" /></AppShell>;
}
