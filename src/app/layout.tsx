import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_SHORT_NAME, SITE_DESCRIPTION, organizationJsonLd } from "@/lib/site";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} (${SITE_SHORT_NAME})`,
    template: `%s | ${SITE_SHORT_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} (${SITE_SHORT_NAME})`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} (${SITE_SHORT_NAME})`,
    description: SITE_DESCRIPTION,
  },
};

import PublicShell from "@/components/layout/PublicShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
