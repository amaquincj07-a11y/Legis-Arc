import type { Metadata } from "next";
import Image from "next/image";
import { SBChartContent } from "../../../sbchart/sbchart-content";
import { formatPlaceName } from "@/lib/places";
import { lguPageMetadata, resolveLguParams } from "../lgu-route";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}): Promise<Metadata> {
  const place = await resolveLguParams(params);
  const name = formatPlaceName(place.municipality);
  return lguPageMetadata(params, {
    pathRest: "/sbchart",
    pageTitle: `SB Chart — Sangguniang Bayan of ${name}`,
    pageDescription: `Organizational chart and members of the Sangguniang Bayan of ${name}.`,
  });
}

export default async function LguSbChartPage({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}) {
  await resolveLguParams(params);
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
