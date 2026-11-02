import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import "../globals.css";
import { routing, type AppLocale } from "@/i18n/routing";
import { SITE } from "@/lib/site-config";
import { OG_DESCRIPTION, OG_LOCALE, PUBLIC_URL, ogImage, ogTitle } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";
import { Spotlight } from "@/components/motion/Spotlight";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { CompanyProvider } from "@/components/company/CompanyProvider";
import { getCompany } from "@/lib/company";
import { getGooglePlace } from "@/lib/google-reviews";
import { getActiveLocations } from "@/lib/fleet-data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBackground } from "@/components/layout/PageBackground";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntroLoader } from "@/components/layout/IntroLoader";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const CLIENT_NAMESPACES = [
  "Booking",
  "Common",
  "Consent",
  "Cta",
  "Extras",
  "Faq",
  "Fleet",
  "Form",
  "Hero",
  "HomeFleet",
  "HowItWorks",
  "Nav",
  "Phone",
  "Promotions",
  "Reviews",
  "Search",
  "Services",
  "WeddingCars",
] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const description = tSeo("home.description");
  const share = OG_DESCRIPTION[locale] ?? description;
  const image = ogImage(locale);
  const title = ogTitle(locale);
  return {
    metadataBase: new URL(PUBLIC_URL),
    title: {
      default: SITE.name,
      template: `%s | ${SITE.name}`,
    },
    description,
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
      title,
      description: share,
      locale: OG_LOCALE[locale] ?? "hr_HR",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: share,
      images: [image],
    },
  };
}

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
        <IntroLoader />
        <JsonLd locale={locale} />
        <ThemeProvider forced="light">
          <NextIntlClientProvider messages={messages}>
            <CompanyProvider value={company}>
            <CurrencyProvider defaultCurrency={locale === "hr" ? "BAM" : "EUR"}>
              <PageBackground />
              <div className="flex min-h-dvh flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer company={company} locations={footerLocations} />
              </div>
              <BackToTop />
              <WhatsAppFab />
              <CookieConsent />
              <Spotlight />
            </CurrencyProvider>
            </CompanyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
