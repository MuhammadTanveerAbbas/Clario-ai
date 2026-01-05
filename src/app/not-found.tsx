"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Sparkles, MessageSquare, FileText, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container z-10 px-4 text-center relative">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block mb-8 px-6 py-3 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm"
        >
          <span className="text-sm text-red-400 flex items-center gap-2 font-medium">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Error 404 - Page Not Found
          </span>
        </motion.div>

        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h1 className="text-[10rem] sm:text-[14rem] md:text-[18rem] font-black leading-none">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20"
          >
            <Sparkles className="w-20 h-20 text-blue-400 absolute top-0 left-1/4" />
            <Zap className="w-16 h-16 text-purple-400 absolute bottom-0 right-1/4" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Oops! Lost in the <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">AI Universe</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved, deleted, or perhaps it never existed at all.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/">
            <Button size="lg" className="group relative overflow-hidden rounded-xl bg-white px-8 py-6 text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 w-full sm:w-auto">
              <span className="relative z-10 flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 rounded-xl px-8 py-6 w-full sm:w-auto backdrop-blur-sm transition-all duration-300">
              <Sparkles className="mr-2 h-5 w-5 text-blue-400" />
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-sm text-gray-500 mb-6">Or explore our features:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'AI Chat', icon: MessageSquare, href: '/chat', color: 'from-blue-500 to-purple-600' },
              { label: 'Summarizer', icon: FileText, href: '/summarizer', color: 'from-green-500 to-blue-600' },
              { label: 'Documents', icon: Search, href: '/documents', color: 'from-purple-500 to-pink-600' },
              { label: 'Writing', icon: Sparkles, href: '/writing', color: 'from-orange-500 to-red-600' }
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`p-4 rounded-xl bg-gradient-to-r ${item.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group`}
                >
                  <item.icon className="w-6 h-6 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-white font-medium">{item.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
