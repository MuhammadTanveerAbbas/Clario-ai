"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, StickyNote, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navLinks: { href: string; label: string }[] = [];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10" style={{ backgroundColor: '#000000' }}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex flex-1 items-center justify-start ml-[3%]">
          <Link href="/" className="flex items-center space-x-2">
              <StickyNote className="h-6 w-6" style={{ color: "var(--accent)" }} />
              <span className="font-bold text-white sm:inline-block text-lg">Clario</span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-gray-400 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 mr-2 sm:mr-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback style={{ background: "var(--accent)", color: "#fff" }} className="flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black border-white/10">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white cursor-pointer">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="text-gray-400 hover:text-white cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-400 hover:text-white cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-up">
              <Button style={{ background: "var(--accent)", color: "#fff" }} className="hover:opacity-90 font-semibold shadow-lg transition-all px-4 sm:px-6 text-sm h-10">
                Create Account
              </Button>
            </Link>
          )}
        </div>


        {navLinks.length > 0 && (
          <div className="flex items-center justify-end space-x-2 md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <VisuallyHidden>
                    <SheetTitle>Mobile Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Link
                      href="/"
                      className="flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <StickyNote className="h-5 w-5" style={{ color: "var(--accent)" }} />
                      <span className="font-bold text-white">Clario</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5 text-[#4169E1]" />
                      <span className="sr-only">Close Menu</span>
                    </Button>
                  </div>
                  <nav className="mt-6 flex flex-col space-y-4 text-lg font-medium">
                    {navLinks.map(({ href, label }) => (
                      <Link
                        key={label}
                        href={href}
                        className="text-gray-400 transition-colors hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}
