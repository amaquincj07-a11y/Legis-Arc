"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pencil, UserX, UserCheck, Shield, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mockUsers, mockCategories } from "@/lib/mock-data";
import { USER_ROLES, ROLE_LABELS } from "@/lib/constants";
import type { User, UserRole, ModuleKey } from "@/lib/types";

const roleBadgeClass: Record<UserRole, string> = {
  sys_admin: "border-purple-300 bg-purple-50 text-purple-700",
  sb_secretary: "border-blue-300 bg-blue-50 text-blue-700",
  sb_member: "border-teal-300 bg-teal-50 text-teal-700",
  digitization_assistant: "border-orange-300 bg-orange-50 text-orange-700",
};

const ALL_MODULES: { key: ModuleKey; label: string }[] = [
  { key: "ordinances", label: "Ordinances" },
  { key: "resolutions", label: "Resolutions" },
  { key: "minutes", label: "Minutes" },
  { key: "tracking", label: "Tracking" },
  { key: "committee_reports", label: "Committee Reports" },
  { key: "categories", label: "Categories & Referral Types" },
];

const MODULE_LABELS: Record<ModuleKey, string> = {
  ordinances: "Ordinances",
  resolutions: "Resolutions",
  minutes: "Minutes",
  tracking: "Tracking",
  committee_reports: "Committee Reports",
  categories: "Categories",
};

const ALL_COMMITTEES = [
  "Committee on Tourism and Cultural Heritage",
  "Committee on Finance, Budget and Appropriations",
  "Committee on Environment",
  "Committee on Public Works, Infrastructure & Public Utilities",
  "Committee on Peace & Order and Public Safety",
  "Committee on Education",
  "Committee on Economic Development and Social Enterprise",
  "Committee on Health and Social Services",
  "Committee on Human Settlement, Land Use & Development",
];

const CATEGORY_NAMES = mockCategories.filter((c) => c.isActive).map((c) => c.name);

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([...mockUsers]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("sb_member");
  const [formModuleAccess, setFormModuleAccess] = useState<ModuleKey[]>([]);
  const [formAllowedCategories, setFormAllowedCategories] = useState<string[]>([]);
  const [formAllowedCommittees, setFormAllowedCommittees] = useState<string[]>([]);

  function openCreateDialog() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("sb_member");
    setFormModuleAccess(["ordinances", "resolutions", "tracking", "committee_reports"]);
    setFormAllowedCategories([]);
    setFormAllowedCommittees([]);
    setDialogOpen(true);
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormModuleAccess(user.moduleAccess || []);
    setFormAllowedCategories(user.allowedCategories || []);
    setFormAllowedCommittees(user.allowedCommittees || []);
    setDialogOpen(true);
  }

  function toggleModule(key: ModuleKey) {
    setFormModuleAccess((prev) => {
      const next = prev.includes(key)
        ? prev.filter((m) => m !== key)
        : [...prev, key];
      // Clear sub-access when module is unchecked
      if (!next.includes("ordinances") && !next.includes("resolutions")) {
        setFormAllowedCategories([]);
      }
      if (!next.includes("committee_reports")) {
        setFormAllowedCommittees([]);
      }
      return next;
    });
  }

  function toggleCategory(name: string) {
    setFormAllowedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function toggleCommittee(name: string) {
    setFormAllowedCommittees((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function selectAllCategories() {
    setFormAllowedCategories(
      formAllowedCategories.length === CATEGORY_NAMES.length ? [] : [...CATEGORY_NAMES]
    );
  }

  function selectAllCommittees() {
    setFormAllowedCommittees(
      formAllowedCommittees.length === ALL_COMMITTEES.length ? [] : [...ALL_COMMITTEES]
    );
  }

  function handleSave() {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const isFull = formRole === "sb_secretary";
    const moduleAccess = isFull ? ALL_MODULES.map((m) => m.key) : formModuleAccess;
    const allowedCategories = isFull ? [] : formAllowedCategories;
    const allowedCommittees = isFull ? [] : formAllowedCommittees;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formName.trim(),
                email: formEmail.trim(),
                role: formRole,
                moduleAccess,
                allowedCategories,
                allowedCommittees,
              }
            : u
        )
      );
      toast.success("User updated");
    } else {
      if (!formPassword.trim()) {
        toast.error("Password is required for new users");
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        moduleAccess,
        allowedCategories,
        allowedCommittees,
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success("User created");
    }

    setDialogOpen(false);
  }

  function toggleActive(userId: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
    const user = users.find((u) => u.id === userId);
    toast.success(
      user?.isActive ? "User deactivated" : "User activated"
    );
  }

  // SB Secretary has full access always
  const isSbSecretary = formRole === "sb_secretary";
  const hasOrdOrRes = isSbSecretary || formModuleAccess.includes("ordinances") || formModuleAccess.includes("resolutions");
  const hasCommittee = isSbSecretary || formModuleAccess.includes("committee_reports");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, roles, and module access
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6 font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={roleBadgeClass[user.role]}
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {(user.moduleAccess || []).map((m) => (
                        <Badge
                          key={m}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {MODULE_LABELS[m]}
                        </Badge>
                      ))}
                      {(!user.moduleAccess || user.moduleAccess.length === 0) && (
                        <span className="text-xs text-muted-foreground">No access</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive
                          ? "border-transparent bg-emerald-100 text-emerald-700"
                          : ""
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(user.lastLogin, "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => toggleActive(user.id)}
                      >
                        {user.isActive ? (
                          <UserX className="size-4" />
                        ) : (
                          <UserCheck className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info - responsive 2-col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userName">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userEmail">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@panglao.gov.ph"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userPassword">
                  Password{" "}
                  {!editingUser && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={
                    editingUser ? "Leave blank to keep current" : "Set password"
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={formRole}
                  onValueChange={(v) => setFormRole(v as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Module Access */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                Module Access
              </Label>
              {isSbSecretary && (
                <p className="text-xs text-muted-foreground">
                  SB Secretary has full access to all modules by default.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-md border p-3">
                {ALL_MODULES.map((mod) => {
                  const checked = isSbSecretary || formModuleAccess.includes(mod.key);
                  return (
                    <div key={mod.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mod-${mod.key}`}
                        checked={checked}
                        disabled={isSbSecretary}
                        onCheckedChange={() => toggleModule(mod.key)}
                      />
                      <label
                        htmlFor={`mod-${mod.key}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                          isSbSecretary ? "text-muted-foreground" : ""
                        }`}
                      >
                        {mod.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Sub-access (when Ordinances or Resolutions is enabled) */}
            {hasOrdOrRes && (
              <Collapsible defaultOpen>
                <div className="rounded-md border">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Allowed Categories</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {isSbSecretary ? "All" : `${formAllowedCategories.length} of ${CATEGORY_NAMES.length}`}
                      </Badge>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-3 pb-3">
                      {isSbSecretary ? (
                        <p className="text-xs text-muted-foreground pt-2">
                          SB Secretary has access to all categories.
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between py-2">
                            <p className="text-xs text-muted-foreground">
                              Select which categories this user can access for Ordinances &amp; Resolutions
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={selectAllCategories}
                            >
                              {formAllowedCategories.length === CATEGORY_NAMES.length ? "Deselect All" : "Select All"}
                            </Button>
                          </div>
                          <ScrollArea className="h-[180px]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {CATEGORY_NAMES.map((cat) => (
                                <div key={cat} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`cat-${cat}`}
                                    checked={formAllowedCategories.includes(cat)}
                                    onCheckedChange={() => toggleCategory(cat)}
                                  />
                                  <label
                                    htmlFor={`cat-${cat}`}
                                    className="text-sm leading-none cursor-pointer"
                                  >
                                    {cat}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Committee Sub-access (when Committee Reports is enabled) */}
            {hasCommittee && (
              <Collapsible defaultOpen>
                <div className="rounded-md border">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Allowed Committees</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {isSbSecretary ? "All" : `${formAllowedCommittees.length} of ${ALL_COMMITTEES.length}`}
                      </Badge>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-3 pb-3">
                      {isSbSecretary ? (
                        <p className="text-xs text-muted-foreground pt-2">
                          SB Secretary has access to all committees.
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between py-2">
                            <p className="text-xs text-muted-foreground">
                              Select which committees this user can access
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={selectAllCommittees}
                            >
                              {formAllowedCommittees.length === ALL_COMMITTEES.length ? "Deselect All" : "Select All"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {ALL_COMMITTEES.map((com) => (
                              <div key={com} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`com-${com}`}
                                  checked={formAllowedCommittees.includes(com)}
                                  onCheckedChange={() => toggleCommittee(com)}
                                />
                                <label
                                  htmlFor={`com-${com}`}
                                  className="text-sm leading-none cursor-pointer"
                                >
                                  {com}
                                </label>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
