import type { Metadata, Viewport } from "next";
import { Poppins, Merriweather, JetBrains_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { INSTALL_BOOTSTRAP } from "@/lib/install-store";
import { PIXEL_SCRIPT } from "@/lib/meta-pixel";
import { UTMIFY_SCRIPT } from "@/lib/utmify";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], weight: ["400", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "700"] });

/** Cole o ID do container aqui (ou defina NEXT_PUBLIC_GTM_ID). */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cash Club",
  description: "Discover cutting-edge solutions that transform the way you interact with technology.",
  applicationName: "Cash Club",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Cash Club" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // o funil é noindex por padrão; páginas que devem ser indexadas sobrescrevem
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Cash Club",
    locale: "en_US",
    images: [{ url: "/og-cash-club.png", width: 1200, height: 630, alt: "Cash Club" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-cash-club.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090909",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable} ${jetbrains.variable} h-full antialiased`}>
      <head>
        {/* captura o beforeinstallprompt antes da hidratação */}
        <script dangerouslySetInnerHTML={{ __html: INSTALL_BOOTSTRAP }} />
        {/* Meta Pixel (fbevents.js) + PageView — deduplicado com /api/capi via event_id */}
        {PIXEL_SCRIPT && <script dangerouslySetInnerHTML={{ __html: PIXEL_SCRIPT }} />}
        {/* UTMify — rastreio de UTMs em todo o funil */}
        <script dangerouslySetInnerHTML={{ __html: UTMIFY_SCRIPT }} />
        {/* Cloak fingerprint — detecta headless/automação no cliente e marca
            cookie pra white na próxima request. Inofensivo pra comprador real. */}
        <script src="/cloak-fp.js" async />
      </head>
      <body className="min-h-full">
        {children}
        {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      </body>
    </html>
  );
}
