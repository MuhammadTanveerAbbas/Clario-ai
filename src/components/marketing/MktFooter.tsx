"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
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
  { href: "/#compare", label: "Compare", icon: BarChart2 },
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
    <h4 className="mb-4 text-[12px] font-semibold tracking-[0.02em] text-stone-900">
      {children}
    </h4>
  );
}

export function MktFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white text-stone-600">
      {/* CTA band */}
      <div className="border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-stone-200 bg-stone-50 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h3
                className="mb-2 font-serif text-2xl font-medium tracking-tight text-stone-900 sm:text-3xl"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Create, repurpose, and publish faster.
              </h3>
              <p className="m-0 text-sm leading-relaxed text-stone-600 sm:text-[15px]">
                Summarize content, remix it for every platform, and keep your
                brand voice consistent in one workspace.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto">
              <Link
                href="/sign-up"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[#f97316] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]"
              >
                Get started
                <ArrowRight size={15} aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-stone-400 hover:text-stone-900"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 sm:col-span-4 lg:col-span-5">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2.5 no-underline"
            >
              <Image
                src="/favicon.svg"
                alt="Clario"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg"
              />
              <span
                className="font-serif text-xl font-medium tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Clario
              </span>
            </Link>
            <p className="mb-0 max-w-sm text-sm leading-relaxed text-stone-600">
              An AI content workspace for creators and teams. Summarize, remix,
              chat, and manage brand voice with clear usage tracking.
            </p>
          </div>

          <nav
            aria-label="Product"
            className="col-span-1 sm:col-span-1 lg:col-span-2"
          >
            <SectionTitle>Product</SectionTitle>
            <ul className="m-0 list-none space-y-3 p-0">
              {PRODUCT_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-stone-600 no-underline transition-colors hover:text-stone-900"
                  >
                    <Icon
                      size={14}
                      className="shrink-0 text-stone-400"
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Company"
            className="col-span-1 sm:col-span-1 lg:col-span-2"
          >
            <SectionTitle>Company</SectionTitle>
            <ul className="m-0 list-none space-y-3 p-0">
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
                      className="inline-flex items-center gap-2 text-sm text-stone-600 no-underline transition-colors hover:text-stone-900"
                    >
                      <Icon
                        size={14}
                        className="shrink-0 text-stone-400"
                        aria-hidden
                      />
                      {label}
                      {!href.startsWith("mailto:") ? (
                        <ArrowUpRight
                          size={12}
                          className="text-stone-400"
                          aria-hidden
                        />
                      ) : null}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-sm text-stone-600 no-underline transition-colors hover:text-stone-900"
                    >
                      <Icon
                        size={14}
                        className="shrink-0 text-stone-400"
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
            className="col-span-1 sm:col-span-1 lg:col-span-3"
          >
            <SectionTitle>Legal</SectionTitle>
            <ul className="m-0 list-none space-y-3 p-0">
              {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-stone-600 no-underline transition-colors hover:text-stone-900"
                  >
                    <Icon
                      size={14}
                      className="shrink-0 text-stone-400"
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-stone-200 pt-6 sm:flex-row">
          <p className="m-0 text-center text-xs text-stone-500 sm:text-left">
            © {new Date().getFullYear()} Clario. All rights reserved.
          </p>
          <p className="m-0 text-xs text-stone-500">
            Made by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-700 no-underline transition-colors hover:text-stone-900"
            >
              Muhammad Tanveer Abbas
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

