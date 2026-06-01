import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function CommunityPage() {
  return <AppShell><PageHeader compact title="Community" /><ServiceHub kind="community" /></AppShell>;
}
