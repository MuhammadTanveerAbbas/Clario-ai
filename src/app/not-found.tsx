"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl text-gray-400">Page not found</p>
        <Link href="/">
          <Button className="bg-white text-black hover:bg-gray-200">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
