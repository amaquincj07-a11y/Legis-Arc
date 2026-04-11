"use client";

import { useState } from "react";
import { NEWS_ITEMS } from "@/lib/news-data";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState(NEWS_ITEMS);
  const [form, setForm] = useState({
    image: "",
    title: "",
    date: "",
    content: "",
  });
  const [preview, setPreview] = useState<string | null>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file.name }));
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.content) return;
    setNewsList([
      {
        id: Date.now(),
        title: form.title,
        date: form.date,
        excerpt: form.content.slice(0, 120) + (form.content.length > 120 ? "..." : ""),
        image: preview || "/images/sb/news-placeholder.jpg",
        content: form.content,
      },
      ...newsList,
    ]);
    setForm({ image: "", title: "", date: "", content: "" });
    setPreview(null);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">News & Updates Management</h1>
      <form className="mb-10 space-y-4 bg-white p-6 rounded-xl shadow" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="mt-2">
              <Image src={preview} alt="Preview" width={200} height={120} className="rounded" />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            required
          />
        </div>
        <Button type="submit" className="mt-2">Add News</Button>
      </form>

      <h2 className="text-xl font-semibold mb-4">News List</h2>
      <div className="space-y-6">
        {newsList.map((news) => (
          <div key={news.id} className="flex gap-4 bg-slate-50 rounded-lg p-4 shadow-sm">
            <div className="w-32 h-20 relative flex-shrink-0">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover rounded"
                sizes="128px"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">{news.date}</div>
              <div className="font-bold text-lg mb-1">{news.title}</div>
              <div className="text-sm text-slate-700 line-clamp-2">{news.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
