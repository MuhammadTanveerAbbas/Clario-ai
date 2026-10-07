import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClientProviders } from "@/components/providers/client-providers";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    "Turn 1 YouTube video into 10 pieces of content. AI-powered summarizer, chat, remix studio, and brand voice library. Built for YouTubers, podcasters, and content creators.",
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clario-hub.vercel.app/",
    siteName: "Clario",
    title: "Clario - Turn 1 Video into 10 Pieces of Content",
    description:
      "AI-powered content repurposing for creators. Summarize videos, remix into 10 formats, and write in your brand voice. Built for YouTubers and podcasters.",
    images: [
      {
        url: "https://clario-hub.vercel.app/opengraph-image",
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
      "AI-powered content repurposing for creators. Summarize videos, remix into 10 formats, and write in your brand voice.",
  },
  alternates: {
    canonical: "https://clario-hub.vercel.app",
  },
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
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('clario-theme');
                if (!theme && window.matchMedia('(prefers-color-scheme: light)').matches) {
                  theme = 'light';
                }
                document.documentElement.classList.add(theme || 'dark');
              } catch (e) {}
            `,
          }}
        />
        <ClientProviders>
          <AuthProvider>
            <SidebarProvider>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </SidebarProvider>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
