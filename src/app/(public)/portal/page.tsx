"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ScrollText,
  FileText,
  BookOpen,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockOrdinances, mockResolutions } from "@/lib/mock-data";
import type { LegislativeDocument } from "@/lib/types";

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
] as const;

function getLatestPublished(): LegislativeDocument[] {
  return [...mockOrdinances, ...mockResolutions]
    .filter((doc) => doc.isPublic)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);
}

export default function PortalPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const latestDocs = getLatestPublished();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-light/80 to-navy" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gold/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
            {"Public Transparency Portal"}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {"Sangguniang Bayan"}
            <span className="mt-1 block text-gold">ng Panglao</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-lg">
            Legislative Records &amp; Public Transparency Portal
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 max-w-xl sm:mt-10"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ordinances, resolutions..."
                className="h-13 rounded-xl border-0 bg-white pl-12 pr-28 text-sm shadow-2xl shadow-black/20 ring-1 ring-white/20 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-teal sm:h-14 sm:text-base"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-teal px-5 text-sm font-semibold text-white shadow-lg shadow-teal/25 transition-all hover:bg-teal/90 hover:shadow-teal/40"
              >
                Search
              </Button>
            </div>
          </form>

          <p className="mt-4 text-xs text-white/30">
            Search by title, document number, author, or keyword
          </p>
        </div>
      </section>

      {/* Browse Section */}
      <section className="border-b bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse Legislative Records
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access public documents by category
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BROWSE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <Card className="h-full border-2 border-transparent transition-all duration-200 group-hover:border-teal/30 group-hover:shadow-lg group-hover:shadow-teal/5">
                    <CardHeader className="pb-3">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="flex items-center justify-between text-lg">
                        {card.title}
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                      {card.count !== null && (
                        <p className="mt-3 text-xs font-medium text-teal">
                          {card.count} published documents
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Published */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Recently Published
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Latest legislative documents available for public access
              </p>
            </div>
            <Link
              href="/search"
              className="hidden text-sm font-medium text-teal transition-colors hover:text-teal/80 sm:block"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/search">
              <Button variant="outline" className="gap-2">
                View all documents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function DocumentCard({ doc }: { doc: LegislativeDocument }) {
  const href =
    doc.documentType === "ordinance"
      ? `/ordinances/${doc.id}`
      : `/resolutions/${doc.id}`;

  const typeLabel =
    doc.documentType === "ordinance" ? "Ordinance" : "Resolution";

  const docNumber =
    doc.approvedNumber || doc.proposedNumber
      ? `${typeLabel} No. ${doc.approvedNumber || doc.proposedNumber}`
      : typeLabel;

  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={
                doc.documentType === "ordinance"
                  ? "bg-navy/10 text-navy"
                  : "bg-teal/10 text-teal"
              }
            >
              {typeLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Series of {doc.seriesYear}
            </span>
          </div>

          <p className="text-xs font-semibold text-teal">{docNumber}</p>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-navy">
            {doc.title}
          </h3>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(doc.dateApproved, "MMM d, yyyy")}
            </span>
            {doc.category && (
              <>
                <span className="text-border">|</span>
                <span>{doc.category}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
