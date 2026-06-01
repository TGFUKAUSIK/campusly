import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function HostelPage() {
  return <AppShell><PageHeader compact title="Hostel" /><ServiceHub kind="hostel" /></AppShell>;
}
