import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Globe, Star } from "lucide-react";

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
    href: "https://github.com/MuhammadTanveerAbbas",
    icon: Github,
    label: "GitHub",
  },
  { href: "https://x.com/themvpguy", icon: XIcon, label: "X" },
  { href: "https://themvpguy.vercel.app", icon: Globe, label: "Portfolio" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand - Larger section */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Clario</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              AI-powered content platform for creators. Summarize, remix, and chat your way to better content. Built for YouTubers, podcasters, bloggers, and newsletter writers.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-orange-500/20 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-orange-500/30"
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <a
              href="https://github.com/MuhammadTanveerAbbas/Clario-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-orange-400 transition-colors group"
            >
              <Star className="h-3.5 w-3.5 group-hover:fill-orange-400 transition-all" />
              Star on GitHub
            </a>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/summarizer" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">AI Summarizer</span>
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">AI Chat</span>
                </Link>
              </li>
              <li>
                <Link href="/remix" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Content Remix</span>
                </Link>
              </li>
              <li>
                <Link href="/brand-voice" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Brand Voice</span>
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Content Calendar</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Pricing</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://themvpguy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">About The MVP Guy</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:muhammadtanveerabbas@outlook.com"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://github.com/MuhammadTanveerAbbas/Clario-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MuhammadTanveerAbbas/Clario-ai#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Documentation</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:muhammadtanveerabbas@outlook.com"
                  className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Support</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Clario. Built by{" "}
                <a
                  href="https://themvpguy.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                >
                  The MVP Guy
                </a>
              </p>
              <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Open Source
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="text-gray-400 font-medium">Next.js</span>
              <span>·</span>
              <span className="text-gray-400 font-medium">Supabase</span>
              <span>·</span>
              <span className="text-gray-400 font-medium">Groq AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
