import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { PostHogPageView } from "./posthog-pageview";
import { Suspense } from "react";


export const metadata: Metadata = {
  metadataBase: new URL("https://clario-hub.vercel.app"),
  title: {
    default: "Clario - AI Productivity Tool",
    template: "%s | Clario",
  },
  description:
    "Transform meeting transcripts, articles, and documents into clear summaries with AI. 10 summary modes, 50K character limit, PDF export. Free forever, no login required.",
  keywords: [
    "AI summarizer",
    "text summarizer",
    "meeting minutes",
    "transcript summarizer",
    "article summarizer",
    "free AI tool",
    "document summarization",
    "TLDR",
    "summary generator",
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
    url: "https://clario-summarizer.vercel.app/",
    siteName: "Clario",
    title: "Clario - AI Text Summarizer | Free Meeting & Article Summarization",
    description:
      "Transform meeting transcripts, articles, and documents into clear summaries with AI. 10 summary modes, 50K character limit, PDF export. Free forever.",
    images: [
      {
        url: "https://placehold.co/1200x630/000000/FFFFFF/png?text=Clario",
        width: 1200,
        height: 630,
        alt: "Clario AI Summarizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@m_tanveerabbas",
    creator: "@m_tanveerabbas",
    title: "Clario - AI Text Summarizer | Free Meeting & Article Summarization",
    description:
      "Transform meeting transcripts, articles, and documents into clear summaries with AI. 10 summary modes, 50K character limit, PDF export. Free forever.",
    images: ["https://placehold.co/1200x630/000000/FFFFFF/png?text=Clario"],
  },
  alternates: {
    canonical: "https://clario-summarizer.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sansation:wght@400;700&display=swap"
          rel="stylesheet"
        />

      </head>
      <body className="font-body antialiased">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster />
              <ScrollToTop />
            </SidebarProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
