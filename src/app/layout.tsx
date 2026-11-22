import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppServices } from "@/components/AppServices";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rumbo",
  description: "Tu plan de 90 días: racha sin consumir, finanzas, ventas y un coach.",
  applicationName: "Rumbo",
  appleWebApp: {
    capable: true,
    title: "Rumbo",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f4ef",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh">
        <Providers>
          <AppServices />
          <main
            className="mx-auto w-full max-w-[430px] px-4"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
            }}
          >
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
