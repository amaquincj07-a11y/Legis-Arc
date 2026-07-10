"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ScrollText,
  FileText,
  BookOpen,
  ArrowRight,
  Users,
  Network,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { mockCategories } from "@/lib/mock-data";
import { PUBLIC_SBCHART_PATH } from "@/lib/constants";
import { usePlaceFilter } from "@/lib/place-filter-context";
import { PublicContactInfo } from "@/components/public/public-contact-info";
import { cn } from "@/lib/utils";

const allCategoryNames = mockCategories.filter((c) => c.isActive).map((c) => c.name);
const halfIndex = Math.ceil(allCategoryNames.length / 2);
const ROW1_CATEGORIES = allCategoryNames.slice(0, halfIndex);
const ROW2_CATEGORIES = allCategoryNames.slice(halfIndex);

const BROWSE_CARDS = [
  {
    title: "Ordinances",
    description:
      "Local legislation enacted by the Sangguniang Bayan governing municipal affairs, regulations, and policies.",
    href: "/ordinances",
    icon: ScrollText,
    cta: "Click here to browse ordinances",
  },
  {
    title: "Resolutions",
    description:
      "Formal expressions of the will of the legislative body on matters of public interest and governance.",
    href: "/resolutions",
    icon: FileText,
    cta: "Click here to browse resolutions",
  },
  {
    title: "Session Minutes",
    description:
      "Official records of Sangguniang Bayan sessions including deliberations, motions, and proceedings.",
    href: "/minutes",
    icon: BookOpen,
    cta: "Click here to view session minutes",
  },
  {
    title: "CSO",
    description:
      "Accredited Civil Society Organizations registered with the Sangguniang Bayan.",
    href: "/cso",
    icon: Users,
    cta: "Click here to explore CSO listings",
  },
  {
    title: "SB Chart",
    description:
      "Organizational chart of the Sangguniang Bayan including members, committees, and assignments.",
    href: PUBLIC_SBCHART_PATH,
    icon: Network,
    cta: "Click here to view the SB chart",
  },
] as const;

const CAROUSEL_ARROW_CLASS =
  "top-1/2 z-20 flex size-10 -translate-y-1/2 border-2 border-[#cbab53] bg-white text-[#1e3a5f] shadow-md transition-colors hover:border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white disabled:opacity-40 [&_svg]:size-5 sm:size-11 sm:[&_svg]:size-6 lg:size-12";

export default function HomePage() {
  const { municipalityName, provinceName } = usePlaceFilter();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative aspect-[5/3] w-full sm:aspect-[2/1] lg:aspect-[21/9]">
          <Image
            src="/images/sb/Hero-background.png"
            alt={`Sangguniang Bayan of ${municipalityName}`}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 px-4 sm:bg-transparent">
            <div className="text-center">
              <p
                className="font-[family-name:var(--font-garamond)] text-[10px] font-medium uppercase tracking-[0.12em] text-white/95 sm:text-xs sm:tracking-[0.15em] lg:text-sm"
                style={{
                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.35)",
                }}
              >
                <span className="block">Republic of the Philippines</span>
                <span className="block">Province of {provinceName}</span>
                <span className="block">
                  Municipality of {municipalityName}
                </span>
              </p>
              <h1
                className="font-[family-name:var(--font-garamond)] mt-2 text-2xl font-bold uppercase tracking-[0.12em] text-white sm:mt-3 sm:text-5xl sm:tracking-[0.15em] lg:mt-4 lg:text-7xl"
                style={{
                  textShadow:
                    "0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                <span className="block">Sangguniang Bayan</span>
                <span className="mt-0.5 block text-[0.92em] font-semibold tracking-[0.15em] sm:mt-1 sm:tracking-[0.2em]">
                  Ng {municipalityName}
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold uppercase tracking-[0.25em] sm:text-3xl lg:text-4xl" style={{ color: "#1e3a5f" }}>
              About
            </h2>
            <p className="mt-6 font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg lg:text-xl">
             This Legislative Archive Platform provides public access to ordinances, resolutions, session minutes, and information about the Sangguniang Bayan. It promotes transparency, accountability, and efficient access to your local legislative information.
           </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-10 sm:py-14 lg:py-16" style={{ backgroundColor: "#0E132B" }}>
        <div className="relative mb-8 sm:mb-10">
          <div className="animate-marquee flex w-max gap-6 sm:gap-8">
            {[...ROW1_CATEGORIES, ...ROW1_CATEGORIES].map((cat, i) => (
              <span
                key={`r1-${i}`}
                className="font-[family-name:var(--font-garamond)] shrink-0 whitespace-nowrap text-lg italic text-white/70 sm:text-xl lg:text-2xl"
              >
                {cat}
                <span className="ml-6 sm:ml-8 text-white/30">&bull;</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            className="font-[family-name:var(--font-garamond)] text-2xl italic tracking-wide text-white sm:text-3xl lg:text-4xl"
          >
            Accessible Legislative Information For Every Citizen.
          </h2>
        </div>

        <div className="relative mt-8 sm:mt-10">
          <div className="animate-marquee-reverse flex w-max gap-6 sm:gap-8">
            {[...ROW2_CATEGORIES, ...ROW2_CATEGORIES].map((cat, i) => (
              <span
                key={`r2-${i}`}
                className="font-[family-name:var(--font-garamond)] shrink-0 whitespace-nowrap text-lg italic text-white/70 sm:text-xl lg:text-2xl"
              >
                {cat}
                <span className="ml-6 sm:ml-8 text-white/30">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-background py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Browse Legislative Records
            </h2>
            <p className="font-[family-name:var(--font-garamond)] mt-2 text-sm text-muted-foreground sm:text-base">
              Access public documents by category
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
              containScroll: "trimSnaps",
            }}
            className="relative mx-auto w-full px-10 sm:px-12 lg:px-14"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {BROWSE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <CarouselItem
                    key={card.href}
                    className="basis-[85%] pl-3 sm:basis-1/2 sm:pl-4 lg:basis-1/3"
                  >
                    <Link href={card.href} className="group block h-full">
                      <Card className="flex h-full flex-col border-2 border-transparent transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#cbab53]/40 group-hover:shadow-lg group-hover:shadow-[#cbab53]/10">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#cbab53]/10 text-[#cbab53] transition-colors group-hover:bg-[#cbab53] group-hover:text-white sm:mb-3 sm:h-12 sm:w-12">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <CardTitle className="font-[family-name:var(--font-garamond)] text-lg sm:text-xl">
                            {card.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col">
                          <p className="font-[family-name:var(--font-garamond)] flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {card.description}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-[#cbab53]/25 bg-[#cbab53]/8 px-3 py-2.5 transition-all group-hover:border-[#cbab53] group-hover:bg-[#1e3a5f] sm:px-4 sm:py-3">
                            <span className="font-[family-name:var(--font-garamond)] text-xs font-semibold text-[#1e3a5f] transition-colors group-hover:text-white sm:text-sm">
                              {card.cta}
                            </span>
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#cbab53]/20 text-[#cbab53] transition-all group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-[#1e3a5f]">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious
              className={cn(CAROUSEL_ARROW_CLASS, "left-0")}
              variant="outline"
              size="icon"
            />
            <CarouselNext
              className={cn(CAROUSEL_ARROW_CLASS, "right-0")}
              variant="outline"
              size="icon"
            />
          </Carousel>
          <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">
            Swipe left or right to explore more records
          </p>
        </div>
      </section>

      <PublicContactInfo />
    </>
  );
}
