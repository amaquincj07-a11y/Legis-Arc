import Image from "next/image";
import { SBChartContent } from "./sbchart-content";

export default function SBChartPage() {
  return (
    <div className="min-h-[70vh]">
      <section className="relative">
        <Image
          src="/images/sb/Hero-Background.png"
          alt="Sangguniang Bayan SB Chart"
          width={1920}
          height={1080}
          priority
          className="h-auto w-full object-contain"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1
            className="font-[family-name:var(--font-garamond)] text-3xl font-bold uppercase tracking-wide text-white sm:text-5xl lg:text-6xl"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
          >
            Sangguniang Bayan
            <span className="mt-2 block">Member Chart</span>
          </h1>
          <p
            className="mt-4 max-w-2xl font-[family-name:var(--font-garamond)] text-base text-white sm:text-xl lg:text-2xl"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            Elected and appointed members of the Sangguniang Bayan
          </p>
        </div>
      </section>

      <SBChartContent />
    </div>
  );
}
