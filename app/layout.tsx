import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: {
    default: "Campusly",
    template: "%s | Campusly"
  },
  description: "A premium, offline-ready student companion.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Campusly"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#164d45",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
