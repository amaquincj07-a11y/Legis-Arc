"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ScrollText,
  FileText,
  BookOpen,
  ArrowRight,
  ClipboardList,
  Users,
  FileBarChart,
  Network,
  Star,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { mockOrdinances, mockResolutions, mockCategories } from "@/lib/mock-data";

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
    count: mockOrdinances.filter((d) => d.isPublic).length,
  },
  {
    title: "Resolutions",
    description:
      "Formal expressions of the will of the legislative body on matters of public interest and governance.",
    href: "/resolutions",
    icon: FileText,
    count: mockResolutions.filter((d) => d.isPublic).length,
  },
  {
    title: "Session Minutes",
    description:
      "Official records of Sangguniang Bayan sessions including deliberations, motions, and proceedings.",
    href: "/minutes",
    icon: BookOpen,
    count: null,
  },
  {
    title: "Citizen's Charter",
    description:
      "Official document outlining government services, requirements, processing times, and procedures for the public.",
    href: "/citizens-charter",
    icon: ClipboardList,
    count: null,
  },
  {
    title: "CSO",
    description:
      "Accredited Civil Society Organizations registered with the Sangguniang Bayan of Panglao.",
    href: "/cso",
    icon: Users,
    count: null,
  },
  {
    title: "Committee Reports",
    description:
      "Reports submitted by legislative committees on referred matters, bills, and resolutions.",
    href: "/committee-reports",
    icon: FileBarChart,
    count: null,
  },
  {
    title: "SB Chart",
    description:
      "Organizational chart of the Sangguniang Bayan including members, committees, and assignments.",
    href: "/about",
    icon: Network,
    count: null,
  },
  {
    title: "Contacts",
    description:
      "Get in touch with the Office of the Sangguniang Bayan for inquiries, requests, and feedback.",
    href: "/contacts",
    icon: Phone,
    count: null,
  },
] as const;

export default function PortalPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      {/* Hero Section with Full Background Image */}
      <section className="relative overflow-hidden">
        {/* Full Background Image */}
        <div className="relative w-full">
          <Image
            src="/images/sb/panglao-background.png"
            alt="Sangguniang Bayan of Panglao"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain"
            priority
          />
          {/* Centered text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1
                className="font-[family-name:var(--font-garamond)] text-3xl font-bold uppercase tracking-[0.15em] text-white sm:text-5xl lg:text-7xl"
                style={{ textShadow: "0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)" }}
              >
                Sangguniang Bayan
              </h1>
              <p
                className="font-[family-name:var(--font-garamond)] mt-1 text-xl font-semibold uppercase tracking-[0.2em] text-white sm:mt-2 sm:text-3xl lg:text-5xl"
                style={{ textShadow: "0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)" }}
              >
                ng Panglao
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Goals Section */}
      <section className="py-14 sm:py-20 lg:py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Vision */}
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold uppercase tracking-[0.25em] sm:text-3xl lg:text-4xl" style={{ color: "#1e3a5f" }}>
              Vision
            </h2>
            <p className="mt-6 font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg lg:text-xl">
              Panglao as a leading eco-cultural tourist destination and agri-industrial town with a God-loving and morally upright community living in a competitive, progressive economy ensuring a balanced, peaceful, and clean environment under a firm and decent leadership.
            </p>
          </div>

          {/* Divider */}
          <div className="my-10 flex items-center justify-center gap-3 sm:my-14">
            <div className="h-px w-16 bg-[#cbab53]/50" />
            <div className="h-2 w-2 rotate-45 bg-[#cbab53]" />
            <div className="h-px w-16 bg-[#cbab53]/50" />
          </div>

          {/* Mission */}
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold uppercase tracking-[0.25em] sm:text-3xl lg:text-4xl" style={{ color: "#1e3a5f" }}>
              Mission
            </h2>
            <p className="mt-6 font-[family-name:var(--font-garamond)] text-base italic leading-relaxed text-gray-600 sm:text-lg">
              In order to realize our vision, we therefore commit ourselves to:
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Institutionalize good governance by being transparent, accountable, and firm leaders to uphold and protect the interest, rights, and welfare of the people;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Provide investment opportunities and livelihood to the marginalized people by boosting the local economy through agricultural productivity and tourism-investment opportunities;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Promote Panglao&apos;s competitive and environmentally safe eco-cultural tourist destination
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 flex items-center justify-center gap-3 sm:my-14">
            <div className="h-px w-16 bg-[#cbab53]/50" />
            <div className="h-2 w-2 rotate-45 bg-[#cbab53]" />
            <div className="h-px w-16 bg-[#cbab53]/50" />
          </div>

          {/* Goals */}
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold uppercase tracking-[0.25em] sm:text-3xl lg:text-4xl" style={{ color: "#1e3a5f" }}>
              Goals
            </h2>
          </div>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Better social services, protection and safety for the welfare of the people.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Improved environmental protection, climate change adaptation, and disaster resiliency.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Competitive, business-enabling climate, and economic progress.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Adequate and standard infrastructure support.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[#cbab53] text-[#cbab53]" />
              <p className="font-[family-name:var(--font-garamond)] text-base leading-relaxed text-gray-700 sm:text-lg">
                Transparent, accountable, participatory, and effective governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Section */}
      <section className="border-b bg-background py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              Browse Legislative Records
            </h2>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Access public documents by category
            </p>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="mx-auto w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {BROWSE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <CarouselItem
                    key={card.href}
                    className="pl-3 sm:pl-4 basis-[80%] sm:basis-1/2 lg:basis-1/3"
                  >
                    <Link href={card.href} className="group block h-full">
                      <Card className="h-full border-2 border-transparent transition-all duration-200 group-hover:border-[#cbab53]/30 group-hover:shadow-lg group-hover:shadow-[#cbab53]/5">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#cbab53]/10 text-[#cbab53] transition-colors group-hover:bg-[#cbab53] group-hover:text-white sm:mb-3 sm:h-12 sm:w-12">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            {card.title}
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[#cbab53]" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {card.description}
                          </p>
                          {card.count !== null && (
                            <p className="mt-3 text-xs font-medium text-[#3998eb]">
                              {card.count} published documents
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-12" />
          </Carousel>
        </div>
      </section>

      {/* Tagline + Scrolling Categories */}
      <section className="overflow-hidden py-10 sm:py-14 lg:py-16" style={{ backgroundColor: "#0E132B" }}>
        {/* Row 1 — scrolls right to left (above tagline) */}
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
            Accessible Local Legislation and Public Service Information
          </h2>
        </div>

        {/* Row 2 — scrolls left to right (below tagline) */}
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

    </>
  );
}