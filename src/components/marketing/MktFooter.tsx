"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles, Zap, DollarSign, BarChart2, Globe, Mail, Shield, FileText } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features", icon: Zap },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/#compare", label: "Compare", icon: BarChart2 },
];

const COMPANY_LINKS = [
  { href: "https://themvpguy.vercel.app", label: "About", external: true, icon: Globe },
  { href: "mailto:themvpguy.contact@gmail.com", label: "Contact", external: true, icon: Mail },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
];

export function MktFooter() {
  return (
    <footer className="bg-white text-stone-600 border-t border-stone-200">
      {/* CTA band */}
      <div className="border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 py-10 sm:py-12">
          <div className="relative rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-amber-500/[0.06]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 px-6 sm:px-8 py-8 sm:py-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-orange-500 text-[11px] font-semibold uppercase tracking-[0.14em] mb-3">
                  <Sparkles size={12} />
                  Start creating smarter
                </div>
                <h3
                  className="font-serif text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
                >
                  Turn any content into your next hit.
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed m-0">
                  Summarize, remix, and repurpose your content in seconds, in your own voice.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold no-underline transition-colors shadow-md shadow-orange-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-sm font-medium no-underline transition-colors"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Brand column — full width on mobile, 2 cols on sm, 5 cols on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span
                className="font-serif text-xl font-light text-stone-900 tracking-tight"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Clario
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs mb-5">
              Summarize, remix, and repurpose your content in seconds, in your own voice.
            </p>
          </div>

          {/* Product links — 1 col on mobile, 1/4 on sm, 2/12 on lg */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h4
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500 mb-4"
              style={{ textShadow: "0 1px 0 #c2410c, 0 2px 0 #9a3412, 0 3px 4px rgba(194,65,12,0.3)" }}
            >
              Product
            </h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {PRODUCT_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-500 no-underline transition-colors group">
                    <Icon size={13} className="text-stone-400 group-hover:text-orange-400 transition-colors shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links — 1 col on mobile, 1/4 on sm, 2/12 on lg */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h4
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500 mb-4"
              style={{ textShadow: "0 1px 0 #c2410c, 0 2px 0 #9a3412, 0 3px 4px rgba(194,65,12,0.3)" }}
            >
              Company
            </h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {COMPANY_LINKS.map(({ href, label, external, icon: Icon }) => (
                <li key={href}>
                  {external ? (
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-500 no-underline transition-colors group"
                    >
                      <Icon size={13} className="text-stone-400 group-hover:text-orange-400 transition-colors shrink-0" />
                      {label}
                      {!href.startsWith("mailto:") && (
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  ) : (
                    <Link href={href} className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-500 no-underline transition-colors group">
                      <Icon size={13} className="text-stone-400 group-hover:text-orange-400 transition-colors shrink-0" />
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links — 1 col on mobile, 1/4 on sm, 3/12 on lg */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3">
            <h4
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500 mb-4"
              style={{ textShadow: "0 1px 0 #c2410c, 0 2px 0 #9a3412, 0 3px 4px rgba(194,65,12,0.3)" }}
            >
              Legal
            </h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-500 no-underline transition-colors group">
                    <Icon size={13} className="text-stone-400 group-hover:text-orange-400 transition-colors shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-500 m-0 text-center sm:text-left">
            © {new Date().getFullYear()} Clario. All rights reserved.
          </p>
          <p className="text-xs text-stone-500 m-0">
            Made by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-700 hover:text-orange-500 no-underline transition-colors font-medium"
            >
              Tanveer
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
