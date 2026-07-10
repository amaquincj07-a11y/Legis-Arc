import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { NEWS_ITEMS } from "@/lib/news-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const news = NEWS_ITEMS.find((n) => n.id === Number(id));

  if (!news) {
    notFound();
  }

  return (
    <div className="min-h-[70vh]">
      {/* Hero Image */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6]">
        <Image
          src={news.image}
          alt={news.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {/* Back link */}
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3998eb] transition-colors hover:text-[#2a7bc8] sm:mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Portal
        </Link>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {news.title}
        </h1>

        {/* Date */}
        <div className="mt-4 flex items-center gap-2 border-b border-gray-200 pb-6 sm:mt-5">
          <Calendar className="size-4 text-[#cbab53]" />
          <span className="text-sm font-medium text-gray-500 sm:text-base">
            {news.date}
          </span>
        </div>

        {/* Body */}
        <div className="mt-6 sm:mt-8">
          {news.content.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="font-[family-name:var(--font-garamond)] mb-5 text-base leading-relaxed text-gray-700 sm:text-lg sm:leading-8 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return NEWS_ITEMS.map((n) => ({ id: String(n.id) }));
}
