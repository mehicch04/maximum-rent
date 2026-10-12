import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";

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

export const dynamic = "force-dynamic";

async function pendingCounts() {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    return { inquiries: 0, messages: 0 };
  }
  try {
    const [inquiries, messages] = await Promise.all([
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.contactRequest.count({ where: { status: "NEW" } }),
    ]);
    return { inquiries, messages };
  } catch {
    return { inquiries: 0, messages: 0 };
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const counts = await pendingCounts();

  return (
    <html lang="hr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <AdminHeader />
            <AdminNav counts={counts} />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
