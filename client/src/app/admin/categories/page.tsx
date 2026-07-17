"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Tags, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import {
  createCategoryAction,
  deleteCategoryAction,
  fetchCategoriesAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/lib/category-actions";
import { ADMIN_CACHE_KEYS, invalidateAdminCache } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const {
    data,
    loading,
    setData: setCategories,
  } = useAdminQuery(ADMIN_CACHE_KEYS.categoriesAll, fetchCategoriesAction);
  const categories = data ?? [];
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  function openAddDialog() {
    setEditingCategory(null);
    setCategoryName("");
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    const result = editingCategory
      ? await updateCategoryAction(editingCategory.id, categoryName)
      : await createCategoryAction(categoryName);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev
          .map((c) => (c.id === editingCategory.id ? result.data : c))
          .toSorted((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Category updated");
    } else {
      setCategories((prev) =>
        [...prev, result.data].toSorted((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Category added");
    }

    setDialogOpen(false);
    setCategoryName("");
    setEditingCategory(null);
    invalidateAdminCache(ADMIN_CACHE_KEYS.categories);
    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
  }

  async function toggleActive(id: string, nextActive: boolean) {
    const result = await toggleCategoryActiveAction(id, nextActive);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? result.data : c))
    );
    invalidateAdminCache(ADMIN_CACHE_KEYS.categories);
    invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
    toast.success(nextActive ? "Category enabled" : "Category disabled");
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;

    setDeleting(true);
    try {
      const result = await deleteCategoryAction(target.id);

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      setCategories((prev) => prev.filter((c) => c.id !== target.id));
      invalidateAdminCache(ADMIN_CACHE_KEYS.categories);
      invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
      toast.success("Category deleted");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage document categories used for ordinances, resolutions, and other
          documents. Changes here apply only to your LGU account.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Document Categories</CardTitle>
            <CardDescription>
              Each LGU has its own category list. Adding, disabling, or deleting
              a category affects only your municipality — other LGUs are not
              changed.
            </CardDescription>
          </div>
          <Button
            onClick={openAddDialog}
            disabled={loading}
            className="h-11 w-full gap-2 sm:h-9 sm:w-auto"
          >
            <Plus className="size-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#3998eb]" />
            </div>
          ) : (
            <>
              <div className="divide-y sm:hidden">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Tags className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{cat.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge
                        variant={cat.isActive ? "default" : "secondary"}
                        className={
                          cat.isActive
                            ? "border-transparent bg-emerald-100 text-emerald-700"
                            : ""
                        }
                      >
                        {cat.isActive ? "Active" : "Disabled"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => openEditDialog(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setDeleteTarget(cat)}
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={(checked) =>
                          void toggleActive(cat.id, checked)
                        }
                      />
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="p-6 text-center text-muted-foreground">
                    No categories found.
                  </p>
                )}
              </div>

              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Category Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <Tags className="size-4 text-muted-foreground" />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={cat.isActive ? "default" : "secondary"}
                            className={
                              cat.isActive
                                ? "border-transparent bg-emerald-100 text-emerald-700"
                                : ""
                            }
                          >
                            {cat.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEditDialog(cat)}
                              aria-label={`Edit ${cat.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => setDeleteTarget(cat)}
                              aria-label={`Delete ${cat.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Switch
                              checked={cat.isActive}
                              onCheckedChange={(checked) =>
                                void toggleActive(cat.id, checked)
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center">
                          <p className="text-muted-foreground">
                            No categories found.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Social Services"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={saving} onClick={() => void handleSave()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="Delete this category?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from your LGU's category list. Other LGU accounts are not affected. Existing documents that used this category will keep their current label.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
