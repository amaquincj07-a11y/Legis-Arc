"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, Globe, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function isActive(href: string) {
    if (href === "/portal") return pathname === "/portal" || pathname === "/";
    return pathname.startsWith(href);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top bar with republic text and contact info */}
      <div className="hidden border-b border-gray-100 bg-[#1e3a5f] py-2 text-xs text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide text-white">REPUBLIC OF THE PHILIPPINES</span>
            <span className="text-[#cbab53]/30">|</span>
            <span className="text-white/90">Municipality of Panglao</span>
            <span className="text-[#cbab53]/30">|</span>
            <span className="font-medium text-[#cbab53]">SANGGUNIANG BAYAN</span>
            <span className="text-[#cbab53]/30">|</span>
            <span className="text-white/90">Province of Bohol</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-[#3998eb] hover:text-[#cbab53] transition-colors cursor-pointer" />
              <Link href="#" className="text-white/80 hover:text-[#cbab53] transition-colors">Filipino</Link>
              <span className="text-[#cbab53]/30">|</span>
              <Link href="#" className="font-medium text-[#cbab53] hover:text-[#cbab53]/80 transition-colors">English</Link>
            </div>
            <span className="text-[#cbab53]/30">|</span>
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-[#3998eb] hover:text-[#cbab53] transition-colors" />
              <span className="text-white/90">(038) 502-XXXX</span>
            </div>
            <span className="text-[#cbab53]/30">|</span>
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-[#3998eb] hover:text-[#cbab53] transition-colors" />
              <span className="text-[#cbab53] hover:text-[#cbab53]/80 transition-colors">info@panglao.gov.ph</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        {/* Logo and title */}
        <Link href="/portal" className="flex items-center gap-2 shrink-0 sm:gap-4">
          <div className="relative h-10 w-10 overflow-hidden sm:h-16 sm:w-16">
            <Image
              src="/images/sb/panglao-logo.png"
              alt="Municipality of Panglao"
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
              REPUBLIC OF THE PHILIPPINES
            </p>
            <p className="text-xs font-medium text-gray-700">Municipality of Panglao</p>
            <p className="text-2xl font-bold leading-tight text-[#3998eb]">
              SANGGUNIANG BAYAN
            </p>
            <p className="text-xs font-medium text-gray-700">Province of Bohol</p>
          </div>
          {/* Compact mobile title */}
          <div className="sm:hidden">
            <p className="text-sm font-bold leading-tight text-[#3998eb]">
              SANGGUNIANG BAYAN
            </p>
            <p className="text-[10px] font-medium text-gray-600">Panglao, Bohol</p>
          </div>
        </Link>

        {/* Mobile right side */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-[#3998eb] hover:bg-[#cbab53]/10 hover:text-[#cbab53] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-left">
                  <div className="relative h-10 w-10">
                    <Image
                      src="/images/sb/panglao-logo.png"
                      alt="Panglao Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Municipality of Panglao</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">Bohol</p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3998eb] transition-colors" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-10 w-full rounded-full border-gray-200 bg-gray-50 pl-9 pr-12 text-sm focus-visible:ring-1 focus-visible:ring-[#3998eb]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10 rounded-full bg-[#3998eb] text-white flex items-center justify-center hover:bg-[#2a7ccc] transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Mobile navigation */}
              <nav className="mt-6 flex flex-col gap-1">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-[#cbab53]/10 text-[#cbab53]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#cbab53]"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>

              {/* Mobile contact info */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="h-4 w-4 text-[#3998eb] hover:text-[#cbab53] transition-colors" />
                    <div className="flex items-center gap-2">
                      <Link href="#" className="hover:text-[#cbab53] transition-colors">Filipino</Link>
                      <span className="text-gray-300">|</span>
                      <Link href="#" className="font-medium text-[#cbab53]">English</Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-[#3998eb] hover:text-[#cbab53] transition-colors" />
                    <span>(038) 502-XXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#3998eb] hover:text-[#cbab53] transition-colors" />
                    <span className="text-[#cbab53]">info@panglao.gov.ph</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="border-t border-gray-100 bg-[#1e3a5f] py-2 text-xs text-white lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4">
          <span className="text-white/90">Panglao, Bohol</span>
          <span className="text-[#cbab53]/30">|</span>
          <span className="text-[#cbab53]">SB</span>
        </div>
      </div>

      {/* Desktop Navigation Bar - Full width below header */}
      <nav className="hidden lg:flex w-full border-t-4 border-[#cbab53] bg-[#3998eb] px-0 py-0">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-0">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex-1 px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide",
                "text-white hover:text-white transition-colors",
                "hover:bg-[#7eb0dc]",
                isActive(item.href) ? "bg-[#3998eb] border-b-4 border-[#cbab53]" : "bg-[#3998eb]",
              ].join(" ")}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="flex lg:hidden w-full border-t-4 border-[#cbab53] bg-[#3998eb] px-2 py-1.5 sm:px-4 sm:py-2">
        <div className="flex w-full items-center gap-1 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-md sm:px-3 sm:py-2 sm:text-xs",
                "text-white hover:text-[#cbab53] transition-colors",
                "hover:bg-[#7eb0dc]",
                isActive(item.href) ? "bg-white/20 border-b-2 border-[#cbab53]" : "bg-[#3998eb]",
              ].join(" ")}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}