"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLguHref } from "@/hooks/use-lgu-href";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  const { href } = useLguHref();

  return (
    <Link
      href={href("")}
      aria-label="LegisArc home"
      className={cn(
        "group flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 sm:gap-3",
        className
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-gold/10 via-white to-gold/5 ring-1 ring-gold/25 transition-transform duration-200 group-hover:scale-[1.02]",
          compact
            ? "size-9 sm:size-10"
            : "size-10 sm:size-11 md:size-12"
        )}
        aria-hidden
      >
        <Image
          src="/images/sb/Logo.png"
          alt=""
          width={96}
          height={96}
          className="absolute top-0 left-1/2 h-[155%] w-[155%] max-w-none -translate-x-1/2 object-cover object-top mix-blend-multiply"
          priority
        />
      </span>

      <span
        className={cn(
          "font-(family-name:--font-garamond) min-w-0 font-semibold tracking-tight text-navy transition-colors group-hover:text-navy-light",
          compact
            ? "text-base sm:text-lg"
            : "text-lg sm:text-xl md:text-[1.35rem]"
        )}
      >
        Legis<span className="text-gold">Arc</span>
      </span>
    </Link>
  );
}
