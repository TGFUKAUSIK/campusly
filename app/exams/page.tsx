import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ServiceHub } from "@/components/service-hub";

export default function ExamsPage() {
  return <AppShell><PageHeader compact title="Exams" /><ServiceHub kind="exams" /></AppShell>;
}
