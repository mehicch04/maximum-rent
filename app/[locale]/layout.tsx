import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import "../globals.css";
import { routing, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/lib/site-config";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { CompanyProvider } from "@/components/company/CompanyProvider";
import { getCompany } from "@/lib/company";
import { getGooglePlace } from "@/lib/google-reviews";
import { getActiveLocations } from "@/lib/fleet-data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBackground } from "@/components/layout/PageBackground";
import { BackToTop } from "@/components/layout/BackToTop";
import { JsonLd } from "@/components/seo/JsonLd";

// latin-ext is REQUIRED for Croatian/Bosnian glyphs (č ć đ š ž).
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const CLIENT_NAMESPACES = [
  "BusinessTeaser",
  "Common",
  "Extras",
  "Faq",
  "FinalCta",
  "Fleet",
  "Form",
  "Hero",
  "HowItWorks",
  "Inquiry",
  "Locations",
  "Nav",
  "Reviews",
  "Search",
  "WeddingCars",
  "WhyChoose",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`,
  ),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Premium najam vozila u Hercegovini — preuzimanje na 6 lokacija, od gradskih automobila do luksuznih limuzina.",
  applicationName: SITE.name,
  authors: [{ name: "mehiccdev", url: "https://mehiccdev.com" }],
  creator: "mehiccdev",
  formatDetection: { telephone: true, address: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Rent a Car Hercegovina`,
    description:
      "Premium najam vozila u Hercegovini — preuzimanje na 6 lokacija.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — Rent a Car Hercegovina`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Rent a Car Hercegovina`,
    description:
      "Premium najam vozila u Hercegovini — preuzimanje na 6 lokacija.",
    images: ["/og-image.jpg"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const all = await getMessages();

  const [baseCompany, google] = await Promise.all([
    getCompany(),
    getGooglePlace(locale),
  ]);
  const company =
    google?.rating != null
      ? {
          ...baseCompany,
          rating: {
            score: google.rating,
            count: google.count ?? baseCompany.rating.count,
          },
        }
      : baseCompany;
  const footerLocations = await getActiveLocations();

  const messages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in all).map((ns) => [ns, all[ns]]),
  );

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <JsonLd locale={locale} />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <CompanyProvider value={company}>
            <CurrencyProvider defaultCurrency="BAM">
              <PageBackground />
              <div className="flex min-h-dvh flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer company={company} locations={footerLocations} />
              </div>
              <BackToTop />
            </CurrencyProvider>
            </CompanyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
