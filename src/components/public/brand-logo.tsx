import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { PUBLIC_HOME_PATH } from "@/lib/constants";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <Link
      href={PUBLIC_HOME_PATH}
      aria-label="LegisArc — Legislative Archive home"
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

      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-(family-name:--font-garamond) font-semibold tracking-tight text-navy transition-colors group-hover:text-navy-light",
            compact
              ? "text-base sm:text-lg"
              : "text-lg sm:text-xl md:text-[1.35rem]"
          )}
        >
          Legis<span className="text-gold">Arc</span>
        </span>
        <span
          className={cn(
            "font-(family-name:--font-garamond) mt-0.5 truncate uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-muted-foreground/80",
            compact
              ? "hidden text-[9px] md:block"
              : "text-[9px] sm:text-[10px] md:text-[11px]"
          )}
        >
          Legislative Archive
        </span>
      </span>
    </Link>
  );
}
