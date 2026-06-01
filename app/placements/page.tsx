import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function PlacementsPage() {
  return <AppShell><PageHeader compact title="Placements" /><ServiceHub kind="placements" /></AppShell>;
}
