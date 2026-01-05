import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e)n=t[e]=function(){n.push([e].concat(Array.prototype.slice.call(arguments,0)))};else for(var p=0;p<e.length;p++)n[e[p]]=function(t){return function(){n.push([t].concat(Array.prototype.slice.call(arguments,0)))}}(e[p]);return t}(p=e,"capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" ")),p._i.push([i,s,a]),p.__SV=1}(document,window.posthog||[]);
              if (typeof window !== 'undefined' && '${
                process.env.NEXT_PUBLIC_POSTHOG_KEY
              }') {
                posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
                  api_host: '${
                    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
                    "https://app.posthog.com"
                  }'
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SidebarProvider>
            {children}
            <Toaster />
            <ScrollToTop />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
