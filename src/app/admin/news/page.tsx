"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Newspaper,
  Plus,
  Pencil,
  Eye,
  Globe,
  GlobeLock,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminActionsMenu } from "@/components/admin/admin-actions-menu";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { NEWS_ITEMS } from "@/lib/news-data";
import type { NewsItem } from "@/lib/types";

type NewsFormState = {
  title: string;
  date: string;
  content: string;
  image: string;
};

const emptyForm = (): NewsFormState => ({
  title: "",
  date: "",
  content: "",
  image: "",
});

function formatDisplayDate(dateStr: string) {
  try {
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return format(parsed, "MMMM d, yyyy");
    }
  } catch {
    /* keep original */
  }
  return dateStr;
}

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(
    NEWS_ITEMS.map((item) => ({
      ...(item as NewsItem),
      isPublished: (item as NewsItem).isPublished ?? true,
    }))
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<NewsFormState>(emptyForm);
  const [preview, setPreview] = useState<string | null>(null);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm());
    setPreview(null);
    setFormOpen(true);
  }

  function openEditForm(item: NewsItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date.includes("-") ? item.date : "",
      content: item.content,
      image: item.image,
    });
    setPreview(item.image);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setPreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSave() {
    if (!form.title.trim() || !form.date || !form.content.trim()) {
      toast.error("Please fill in title, date, and content");
      return;
    }

    const displayDate = formatDisplayDate(form.date);
    const excerpt =
      form.content.trim().slice(0, 120) +
      (form.content.trim().length > 120 ? "..." : "");

    if (editingId !== null) {
      setNewsList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: form.title.trim(),
                date: displayDate,
                content: form.content.trim(),
                excerpt,
                image: preview || item.image,
              }
            : item
        )
      );
      toast.success("News article updated");
    } else {
      setNewsList((prev) => [
        {
          id: Date.now(),
          title: form.title.trim(),
          date: displayDate,
          excerpt,
          content: form.content.trim(),
          image: preview || "/images/sb/news-placeholder.jpg",
          isPublished: false,
        },
        ...prev,
      ]);
      toast.success("News article saved as draft — publish when ready");
    }
    closeForm();
  }

  function togglePublish(item: NewsItem) {
    setNewsList((prev) =>
      prev.map((n) =>
        n.id === item.id ? { ...n, isPublished: !n.isPublished } : n
      )
    );
    toast.success(
      item.isPublished
        ? "Article removed from public site"
        : "Article published to the public site"
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setNewsList((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    toast.success("News article deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3998eb]/10 text-[#3998eb]">
            <Newspaper className="size-5" />
          </div>
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              News & Updates
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Create and manage news articles shown on the public portal. New
              articles start as drafts until you publish them.
            </p>
          </div>
        </div>
        <Button
          onClick={openAddForm}
          className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold text-slate-900 shadow-md shadow-[#cbab53]/35 hover:bg-[#b89745]"
        >
          <Plus className="size-4" />
          Add article
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200/90 shadow-sm">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
          <CardTitle className="text-base font-semibold text-slate-800">
            All articles ({newsList.length})
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Use the Actions menu on each row to view, edit, publish, or delete.
          </p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50/60">
                <TableHead className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Title
                </TableHead>
                <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Date
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Status
                </TableHead>
                <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <p className="text-sm text-muted-foreground">
                      No articles yet. Click &quot;Add article&quot; to create one.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                newsList.map((news) => (
                  <TableRow key={news.id} className="hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <Image
                            src={news.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-slate-800">
                            {news.title}
                          </p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {news.excerpt}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-600">
                      {news.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          news.isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                        }
                      >
                        {news.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <AdminActionsMenu
                        items={[
                          {
                            label: "View on site",
                            icon: Eye,
                            onClick: () =>
                              window.open(`/news/${news.id}`, "_blank"),
                          },
                          {
                            label: "Edit",
                            icon: Pencil,
                            onClick: () => openEditForm(news),
                          },
                          {
                            label: news.isPublished ? "Unpublish" : "Publish",
                            icon: news.isPublished ? GlobeLock : Globe,
                            onClick: () => togglePublish(news),
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onClick: () => setDeleteTarget(news),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit article" : "Add new article"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "Update the article details below."
                : "Fill in the details. The article will be saved as a draft until you publish it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="news-image">Cover image</Label>
              <Input
                id="news-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && (
                <div className="relative mt-2 h-28 w-full overflow-hidden rounded-lg">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="news-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Headline for the article"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="news-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-content">
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="news-content"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={6}
                placeholder="Write the full article text..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
              onClick={handleSave}
            >
              {editingId !== null ? "Save changes" : "Save as draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this article?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
