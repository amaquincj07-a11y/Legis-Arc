import { cn } from "@/lib/utils";

type PdfFileIconProps = {
  className?: string;
};

/**
 * Flat PDF file mark: document silhouette + red PDF badge (admin list trigger).
 */
export function PdfFileIcon({ className }: PdfFileIconProps) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full"
      >
        {/* Document body */}
        <path
          d="M9 7C9 5.895 9.895 5 11 5H22.5L29 11.5V33C29 34.105 28.105 35 27 35H11C9.895 35 9 34.105 9 33V7Z"
          fill="#C5CDD8"
        />
        {/* Folded corner */}
        <path
          d="M22.5 5V10.5C22.5 11.328 23.172 12 24 12H29L22.5 5Z"
          fill="#E2E6ED"
        />
      </svg>
      <span className="absolute bottom-[18%] left-1/2 z-10 -translate-x-1/2 rounded-[3px] bg-[#E53935] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-white">
        PDF
      </span>
    </span>
  );
}
