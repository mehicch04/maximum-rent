import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNav } from "@/components/admin/AdminNav";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Maximum Rent a Car",
  robots: { index: false, follow: false },
};

// /admin is intentionally outside [locale]: single-language (HR, for staff),
// not indexed, with its own minimal chrome.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <AdminHeader />
            <AdminNav />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
