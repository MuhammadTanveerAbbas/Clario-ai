import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin } from "lucide-react";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1200 1227"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L112.633 43.4836H312.3L604.212 514.974L651.68 582.869L1099.03 1184.04H899.362L569.165 687.854V687.828Z"
      fill="currentColor"
    />
  </svg>
);

const socialLinks = [
  {
    href: "https://linkedin.com/in/muhammadtanveerabbas",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/muhammadtanveerabbas",
    icon: Github,
    label: "GitHub",
  },
  { href: "https://x.com/m_tanveerabbas", icon: XIcon, label: "X" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-black to-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Clario</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              AI powered productivity platform for text summarization, chat,
              document analysis, and writing assistance.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/summarizer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Text Summarizer
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Document Analyzer
                </Link>
              </li>
              <li>
                <Link
                  href="/writing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Writing Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a
                  href="mailto:muhammadtanveerabbas.dev@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/muhammadtanveerabbas/clario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:muhammadtanveerabbas.dev@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Clario. All rights reserved.
              </p>
              <Badge
                variant="outline"
                className="border-green-500/50 text-green-400"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                All Systems Operational
              </Badge>
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span>Built with Next.js 15</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>
                Made by{" "}
                <a
                  href="https://muhammadtanveerabbas.vercel.app/"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Muhammad Tanveer Abbas
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
