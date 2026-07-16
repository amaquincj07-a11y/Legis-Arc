"use client";
import { NEWS_ITEMS } from "@/lib/news-data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 5;

export default function NewsArchivePage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(NEWS_ITEMS.length / PAGE_SIZE);
  const paginatedNews = NEWS_ITEMS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16 lg:py-20">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl lg:text-4xl text-center">News Archive</h1>
      <p className="mb-8 text-center text-muted-foreground">All news and updates from the Sangguniang Bayan</p>
      <div className="space-y-8">
        {paginatedNews.map((news) => (
          <article key={news.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row gap-0 sm:gap-6">
            <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 224px"
                priority={false}
              />
            </div>
            <div className="flex flex-col justify-between p-5 flex-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-[#cbab53]" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{news.date}</span>
                </div>
                <h2 className="text-lg font-bold text-[#1e3a5f] mb-1 leading-tight line-clamp-2">
                  {news.title}
                </h2>
                <p className="text-sm text-slate-700 line-clamp-3 mb-2">{news.excerpt}</p>
              </div>
              <div className="mt-2">
                <Link
                  href={`/news/${news.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#1e3a5f]/20 bg-[#1e3a5f]/10 px-5 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-[#1e3a5f]/20 transition-all"
                >
                  Read More
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full px-4 py-2 text-sm font-medium border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded-full px-3 py-2 text-sm font-medium border border-slate-200 ${page === i + 1 ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full px-4 py-2 text-sm font-medium border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
