"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CampusAuthGate } from "@/components/campus-auth-gate";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 24,
            retry: 2,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CampusAuthGate>{children}</CampusAuthGate>
    </QueryClientProvider>
  );
}
