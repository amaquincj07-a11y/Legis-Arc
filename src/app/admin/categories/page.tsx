"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Tags, FileInput } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

interface ReferralTypeItem {
  id: string;
  name: string;
  value: string;
  isActive: boolean;
}

const INITIAL_REFERRAL_TYPES: ReferralTypeItem[] = [
  { id: "rt-1", name: "Letter", value: "letter", isActive: true },
  { id: "rt-2", name: "Brgy Resolution", value: "brgy_resolution", isActive: true },
  { id: "rt-3", name: "Brgy Ordinance", value: "brgy_ordinance", isActive: true },
  { id: "rt-4", name: "Subd Application", value: "subd_application", isActive: true },
  { id: "rt-5", name: "Accreditation", value: "accreditation", isActive: true },
  { id: "rt-6", name: "Board/Council Resolutions", value: "board_council_resolutions", isActive: true },
  { id: "rt-7", name: "Memorandum", value: "memorandum", isActive: true },
  { id: "rt-8", name: "Executive Orders", value: "executive_orders", isActive: true },
  { id: "rt-9", name: "Draft Resolutions", value: "draft_resolutions", isActive: true },
  { id: "rt-10", name: "Draft Ordinance", value: "draft_ordinance", isActive: true },
  { id: "rt-11", name: "Others", value: "others", isActive: true },
];

export default function CategoriesPage() {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([...mockCategories]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Referral Types state
  const [referralTypes, setReferralTypes] = useState<ReferralTypeItem[]>(INITIAL_REFERRAL_TYPES);
  const [rtDialogOpen, setRtDialogOpen] = useState(false);
  const [editingRt, setEditingRt] = useState<ReferralTypeItem | null>(null);
  const [rtName, setRtName] = useState("");

  // Category handlers
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

  function handleSave() {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, name: categoryName.trim() } : c
        )
      );
      toast.success("Category updated");
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: categoryName.trim(),
        isActive: true,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category added");
    }

    setDialogOpen(false);
    setCategoryName("");
    setEditingCategory(null);
  }

  function toggleActive(id: string) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
    const cat = categories.find((c) => c.id === id);
    toast.success(
      cat?.isActive ? "Category disabled" : "Category enabled"
    );
  }

  // Referral Type handlers
  function openAddRtDialog() {
    setEditingRt(null);
    setRtName("");
    setRtDialogOpen(true);
  }

  function openEditRtDialog(rt: ReferralTypeItem) {
    setEditingRt(rt);
    setRtName(rt.name);
    setRtDialogOpen(true);
  }

  function handleSaveRt() {
    if (!rtName.trim()) {
      toast.error("Referral type name is required");
      return;
    }

    if (editingRt) {
      setReferralTypes((prev) =>
        prev.map((r) =>
          r.id === editingRt.id
            ? { ...r, name: rtName.trim(), value: rtName.trim().toLowerCase().replace(/[\s/]+/g, "_") }
            : r
        )
      );
      toast.success("Referral type updated");
    } else {
      const newRt: ReferralTypeItem = {
        id: `rt-${Date.now()}`,
        name: rtName.trim(),
        value: rtName.trim().toLowerCase().replace(/[\s/]+/g, "_"),
        isActive: true,
      };
      setReferralTypes((prev) => [...prev, newRt]);
      toast.success("Referral type added");
    }

    setRtDialogOpen(false);
    setRtName("");
    setEditingRt(null);
  }

  function toggleRtActive(id: string) {
    setReferralTypes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      )
    );
    const rt = referralTypes.find((r) => r.id === id);
    toast.success(
      rt?.isActive ? "Referral type disabled" : "Referral type enabled"
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories & Referral Types</h1>
        <p className="text-sm text-muted-foreground">
          Manage document categories and referral types used across the system
        </p>
      </div>

      {/* Document Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Document Categories</CardTitle>
            <CardDescription>Categories used for ordinances, resolutions, and other documents</CardDescription>
          </div>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 size-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Category Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
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
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(cat)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={() => toggleActive(cat.id)}
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
        </CardContent>
      </Card>

      {/* Referral Types Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Referral Types</CardTitle>
            <CardDescription>Types of referral used in legislative tracking</CardDescription>
          </div>
          <Button onClick={openAddRtDialog} size="sm">
            <Plus className="mr-2 size-4" />
            Add Referral Type
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Referral Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralTypes.map((rt) => (
                <TableRow key={rt.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <FileInput className="size-4 text-muted-foreground" />
                      <span className="font-medium">{rt.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={rt.isActive ? "default" : "secondary"}
                      className={
                        rt.isActive
                          ? "border-transparent bg-emerald-100 text-emerald-700"
                          : ""
                      }
                    >
                      {rt.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditRtDialog(rt)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Switch
                        checked={rt.isActive}
                        onCheckedChange={() => toggleRtActive(rt.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {referralTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No referral types found.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Dialog */}
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
                    handleSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Type Dialog */}
      <Dialog open={rtDialogOpen} onOpenChange={setRtDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRt ? "Edit Referral Type" : "Add Referral Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rtName">Referral Type Name</Label>
              <Input
                id="rtName"
                value={rtName}
                onChange={(e) => setRtName(e.target.value)}
                placeholder="e.g. Board Resolution"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveRt();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveRt}>
              {editingRt ? "Save Changes" : "Add Referral Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
