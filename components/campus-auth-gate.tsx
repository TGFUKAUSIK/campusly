"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVtopAuthStatus } from "@/lib/api/vtop-auth";

const PUBLIC_PATHS = ["/auth/sign-in"];

export function CampusAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  const { data, isLoading } = useQuery({
    queryKey: ["vtop", "session"],
    queryFn: getVtopAuthStatus,
    retry: false
  });

  useEffect(() => {
    if (isPublic || isLoading) return;
    if (!data?.authenticated) {
      router.replace("/auth/sign-in");
    }
  }, [data?.authenticated, isLoading, isPublic, router]);

  if (!isPublic && (isLoading || !data?.authenticated)) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5">
        <p className="text-sm font-bold text-[var(--muted)]">Checking your VTOP session…</p>
      </main>
    );
  }

  return children;
}
