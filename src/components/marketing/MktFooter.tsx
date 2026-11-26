"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart2,
  DollarSign,
  FileText,
  Globe,
  Mail,
  Shield,
  Zap,
} from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features", icon: Zap },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/#demo", label: "Demo", icon: BarChart2 },
];

const COMPANY_LINKS = [
  {
    href: "https://muhammadtanveerabbas.vercel.app",
    label: "About",
    external: true,
    icon: Globe,
  },
  {
    href: "mailto:muhammadtanveerabbas.contact@gmail.com",
    label: "Contact",
    external: true,
    icon: Mail,
  },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
  { href: "/refund", label: "Refund Policy", icon: FileText },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
      {children}
    </h4>
  );
}

export function MktFooter() {
  return (
    <footer className="border-t border-rule bg-paper text-body-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-5">
            <Link
              href="/"
              className="mb-3.5 inline-flex items-center gap-2.5 no-underline"
            >
              <Image
                src="/Clario.png"
                alt="Clario"
                width={34}
                height={34}
                className="h-8.5 w-8.5 rounded-lg object-cover"
              />
              <span
                className="font-serif text-xl font-normal tracking-tight text-ink"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Clario
              </span>
            </Link>
            <p className="mb-0 max-w-sm text-sm leading-relaxed text-body-muted">
              An AI content workspace for creators and teams. Summarize, remix,
              chat, and manage brand voice with clear usage tracking.
            </p>
          </div>

          <nav aria-label="Product" className="col-span-1 lg:col-span-2">
            <SectionTitle>Product</SectionTitle>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {PRODUCT_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-body-muted no-underline transition-colors hover:text-ink"
                  >
                    <Icon
                      size={14}
                      className="shrink-0 text-body-muted"
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="col-span-1 lg:col-span-2">
            <SectionTitle>Company</SectionTitle>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {COMPANY_LINKS.map(({ href, label, external, icon: Icon }) => (
                <li key={href}>
                  {external ? (
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={
                        href.startsWith("mailto:")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-body-muted no-underline transition-colors hover:text-ink"
                    >
                      <Icon
                        size={14}
                        className="shrink-0 text-body-muted"
                        aria-hidden
                      />
                      {label}
                      {!href.startsWith("mailto:") ? (
                        <ArrowUpRight
                          size={12}
                          className="text-body-muted"
                          aria-hidden
                        />
                      ) : null}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-body-muted no-underline transition-colors hover:text-ink"
                    >
                      <Icon
                        size={14}
                        className="shrink-0 text-body-muted"
                        aria-hidden
                      />
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Legal"
            className="col-span-2 sm:col-span-1 lg:col-span-3"
          >
            <SectionTitle>Legal</SectionTitle>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-body-muted no-underline transition-colors hover:text-ink"
                  >
                    <Icon
                      size={14}
                      className="shrink-0 text-body-muted"
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-rule pt-6 sm:flex-row">
          <p className="m-0 text-center text-xs text-body-muted sm:text-left">
            © {new Date().getFullYear()} Clario. All rights reserved.
          </p>
          <p className="m-0 text-xs text-body-muted">
            Made by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-ink-2 no-underline transition-colors hover:text-ink"
            >
              Muhammad Tanveer Abbas
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
