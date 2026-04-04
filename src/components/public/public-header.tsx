"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

  // Hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full shadow-sm transition-transform duration-300",
        hidden && "-translate-y-full"
      )}
    >

      {/* Main header */}
      <div className="bg-white mx-auto flex max-w-full items-center justify-center px-4 py-4 sm:py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center relative">
        {/* Centered title */}
        <Link href="/portal" className="flex flex-col items-center text-center" style={{ fontFamily: 'var(--font-garamond), "EB Garamond", "Garamond", "Georgia", serif' }}>
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-600">
            Republic of the Philippines
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-700">Municipality of Panglao</p>
          <p className="text-xl sm:text-3xl font-bold leading-tight tracking-wide text-[#000000] uppercase">
            Sangguniang Bayan
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-700">Province of Bohol</p>
        </Link>

        {/* Mobile menu button - positioned absolute right */}
        <div className="absolute right-0 flex items-center gap-2 lg:hidden">
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
                <SheetTitle className="text-center">
                  <p className="text-xs text-gray-500">Municipality of Panglao</p>
                  <p className="text-sm font-bold text-[#1e3a5f]">Sangguniang Bayan</p>
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
      </div>

     

      {/* Desktop Navigation Bar - Full width below header */}
      <nav className="hidden lg:flex w-full border-t-4 border-[#cbab53] bg-white px-0 py-0">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-0">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex-1 px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide",
                "text-[#1e3a5f] hover:text-[#cbab53] transition-colors",
                isActive(item.href) ? "border-b-4 border-[#cbab53] text-[#cbab53]" : "",
              ].join(" ")}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="flex lg:hidden w-full border-t-4 border-[#cbab53] bg-white px-2 py-1.5 sm:px-4 sm:py-2">
        <div className="flex w-full items-center gap-1 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-md sm:px-3 sm:py-2 sm:text-xs",
                "text-[#1e3a5f] hover:text-[#cbab53] transition-colors",
                isActive(item.href) ? "border-b-2 border-[#cbab53] text-[#cbab53]" : "",
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