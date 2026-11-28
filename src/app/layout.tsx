import type { Metadata, Viewport } from "next";
import { Cantarell, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClientProviders } from "@/components/providers/client-providers";

const cantarell = Cantarell({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clario-hub.vercel.app"),
  title: {
    default: "Clario - AI Content Repurposing Tool for Creators",
    template: "%s | Clario",
  },
  description:
    "Turn 1 video into 10 ready to publish posts with AI. Summarize, remix for any platform, chat, and write in your brand voice. Built for creators and teams.",
  keywords: [
    "content repurposing",
    "AI content creator",
    "YouTube to Twitter",
    "content remix",
    "brand voice AI",
    "video summarizer",
    "content automation",
    "creator tools",
    "AI for creators",
    "content marketing",
  ],
  authors: [{ name: "Muhammad Tanveer Abbas" }],
  creator: "Muhammad Tanveer Abbas",
  publisher: "Clario",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/Clario.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clario-hub.vercel.app/",
    siteName: "Clario",
    title: "Clario - Turn 1 Video into 10 Pieces of Content",
    description:
      "Turn 1 video into 10 ready to publish posts with AI. Summarize, remix for any platform, chat, and write in your brand voice. Built for creators and teams.",
    images: [
      {
        url: "https://clario-hub.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clario - AI Content Repurposing Tool for Creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@m_tanveerabbas",
    creator: "@m_tanveerabbas",
    title: "Clario - Turn 1 Video into 10 Pieces of Content",
    description:
      "Turn 1 video into 10 ready to publish posts with AI. Summarize, remix for any platform, chat, and write in your brand voice. Built for creators and teams.",
    images: [
      {
        url: "https://clario-hub.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clario - AI Content Repurposing Tool for Creators",
      },
    ],
  },
  alternates: {
    canonical: "https://clario-hub.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://clario-hub.vercel.app/#organization",
      name: "Clario",
      url: "https://clario-hub.vercel.app/",
      logo: "https://clario-hub.vercel.app/Clario.png",
      email: "muhammadtanveerabbas.contact@gmail.com",
      sameAs: ["https://x.com/m_tanveerabbas"],
    },
    {
      "@type": "WebSite",
      "@id": "https://clario-hub.vercel.app/#website",
      url: "https://clario-hub.vercel.app/",
      name: "Clario",
      publisher: { "@id": "https://clario-hub.vercel.app/#organization" },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: "Clario",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://clario-hub.vercel.app/",
      description:
        "AI content workspace for summarizing, remixing, chatting, and managing brand voice.",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "19",
          priceCurrency: "USD",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cantarell.variable} ${fraunces.variable}`}
    >
      <head>
        <meta
          property="og:logo"
          content="https://clario-hub.vercel.app/Clario.png"
        />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientProviders>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
