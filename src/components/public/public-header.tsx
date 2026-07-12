"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_NAV_ITEMS, PUBLIC_HOME_PATH, PUBLIC_SBCHART_PATH } from "@/lib/constants";
import { BrandLogo } from "@/components/public/brand-logo";
import {
  PlaceFilterBar,
  PlaceFilterMobileTrigger,
} from "@/components/public/place-filter-bar";
import { cn } from "@/lib/utils";

const NAV_LINK_BASE =
  "font-semibold uppercase tracking-wide text-navy transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

function isNavActive(pathname: string, href: string) {
  if (href === PUBLIC_HOME_PATH) {
    return (
      pathname === PUBLIC_HOME_PATH ||
      pathname === `${PUBLIC_HOME_PATH}/` ||
      pathname === "/portal" ||
      pathname === "/portal/" ||
      pathname === "/" ||
      pathname === ""
    );
  }
  if (href === PUBLIC_SBCHART_PATH) {
    return (
      pathname === PUBLIC_SBCHART_PATH ||
      pathname === `${PUBLIC_SBCHART_PATH}/` ||
      pathname === "/about" ||
      pathname === "/about/"
    );
  }
  return pathname.startsWith(href);
}

export function PublicHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [scrollHints, setScrollHints] = useState({ left: false, right: true });
  const navRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  const updateScrollHints = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setScrollHints({
      left: scrollLeft > 4,
      right: scrollLeft + clientWidth < scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    updateScrollHints();
    window.addEventListener("resize", updateScrollHints);
    return () => window.removeEventListener("resize", updateScrollHints);
  }, [updateScrollHints]);

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    updateScrollHints();
  }, [pathname, updateScrollHints]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Branding + Location */}
      <div
        className={cn(
          "border-b border-gray-100 bg-white transition-[padding] duration-200",
          compact ? "py-2 md:py-2.5" : "py-2.5 md:py-4 lg:py-5"
        )}
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <BrandLogo compact={compact} className="shrink-0" />

          <PlaceFilterMobileTrigger
            theme="header"
            className="min-w-0 max-w-[min(11.5rem,52vw)] shrink-0 sm:hidden"
          />

          <div className="pointer-events-none absolute inset-x-4 hidden justify-center sm:inset-x-6 sm:flex lg:inset-x-8">
            <div className="pointer-events-auto">
              <PlaceFilterBar theme="header" />
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation — horizontal scroll on all screen sizes */}
      <nav
        aria-label="Main navigation"
        className="relative border-t-4 border-gold bg-white"
      >
        {scrollHints.left && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-white to-transparent sm:w-8"
            aria-hidden
          />
        )}
        {scrollHints.right && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-white to-transparent sm:w-8"
            aria-hidden
          />
        )}
        <div
          ref={navRef}
          onScroll={updateScrollHints}
          className="mx-auto flex w-full max-w-7xl touch-pan-x flex-nowrap items-stretch overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] scroll-smooth scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PUBLIC_NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                ref={active ? activeLinkRef : undefined}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  NAV_LINK_BASE,
                  "flex shrink-0 items-center justify-center whitespace-nowrap px-4 py-3 text-xs sm:px-5 sm:text-sm lg:flex-1 lg:shrink lg:px-4 lg:py-4 xl:px-5",
                  active
                    ? "border-b-2 border-gold text-gold lg:border-b-4"
                    : "border-b-2 border-transparent lg:border-b-4"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
