import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ProfileView } from "@/components/profile-view";

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader compact title="Profile" />
      <ProfileView />
    </AppShell>
  );
}
