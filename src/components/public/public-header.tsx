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
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
          <BrandLogo compact={compact} className="shrink-0" />

          <div className="flex min-w-0 justify-center px-1 sm:px-2">
            <PlaceFilterBar theme="header" />
            <PlaceFilterMobileTrigger theme="header" />
          </div>
        </div>
      </div>

      {/* Main navigation — always visible, compresses on smaller screens */}
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
          className="mx-auto flex w-full max-w-7xl items-stretch overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  "flex min-w-[4.25rem] flex-1 items-center justify-center px-1 py-2.5 text-center text-[10px] leading-tight sm:min-w-0 sm:px-2 sm:py-3 sm:text-xs lg:px-3 lg:py-4 lg:text-xs xl:px-5 xl:text-sm",
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
