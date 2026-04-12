"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 mx-auto text-muted-foreground mb-8 opacity-50" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
