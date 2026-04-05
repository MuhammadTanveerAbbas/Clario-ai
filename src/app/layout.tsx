import type { Metadata } from "next";
import { Inter, Poppins, Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ClientProviders } from "@/components/providers/client-providers";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  adjustFontFallback: true,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clario-hub.vercel.app/",
    siteName: "Clario",
    title: "Clario - Turn 1 Video into 10 Pieces of Content",
    description:
      "AI-powered content repurposing for creators. Summarize videos, remix into 10 formats, and write in your brand voice. Built for YouTubers and podcasters.",
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${fraunces.variable} ${geist.variable}`}>
      <body className="font-body antialiased">
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
