"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, UserX, UserCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordReveal } from "@/components/ui/password-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/lib/auth-context";
import {
  createLGUUserAction,
  fetchLGUUsersAction,
  toggleLGUUserActiveAction,
  updateLGUUserAction,
} from "@/lib/lgu-user-actions";
import { ADMIN_CACHE_KEYS } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const {
    data,
    loading,
    setData: setUsers,
  } = useAdminQuery(ADMIN_CACHE_KEYS.users, fetchLGUUsersAction, {
    enabled: Boolean(currentUser?.isPrimaryAdmin),
  });
  const users = data ?? [];
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const accessDenied = Boolean(currentUser && !currentUser.isPrimaryAdmin);
  const editingPrimaryAdmin = Boolean(editingUser?.isPrimaryAdmin);

  function openCreateDialog() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPosition("");
    setFormMobile("");
    setFormPassword("");
    setDialogOpen(true);
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPosition(user.position);
    setFormMobile(user.mobile ?? "");
    setFormPassword(user.managedPassword ?? "");
    setDialogOpen(true);
  }

  async function handleSave() {
    const formData = new FormData();
    formData.set("name", formName);
    formData.set("email", formEmail);
    formData.set("position", formPosition);
    formData.set("password", formPassword);
    if (editingPrimaryAdmin) {
      formData.set("mobile", formMobile);
    }

    setSaving(true);
    const result = editingUser
      ? await updateLGUUserAction(editingUser.id, formData)
      : await createLGUUserAction(formData);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? result.data : u))
      );
      toast.success(
        editingPrimaryAdmin
          ? "Primary administrator updated"
          : "User updated"
      );
    } else {
      setUsers((prev) => [...prev, result.data]);
      toast.success("User created");
    }

    setDialogOpen(false);
  }

  async function toggleActive(userId: string, nextActive: boolean) {
    const result = await toggleLGUUserActiveAction(userId, nextActive);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? result.data : u))
    );
    toast.success(nextActive ? "User activated" : "User deactivated");
  }

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Only the primary LGU administrator can manage user accounts.
          </p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            You do not have permission to access this section.
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your primary administrator account and LGU staff logins.
            Sub-users cannot access this section.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          disabled={loading}
          className="h-11 w-full gap-2 sm:h-10 sm:w-auto"
        >
          <Plus className="size-4" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#3998eb]" />
            </div>
          ) : (
            <>
              <div className="divide-y lg:hidden">
                {users.map((user) => (
                  <article key={user.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="break-all text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        {user.isPrimaryAdmin ? (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            Primary Admin
                          </Badge>
                        ) : null}
                      </div>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={
                          user.isActive
                            ? "shrink-0 border-transparent bg-emerald-100 text-emerald-700"
                            : "shrink-0"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Current Password
                      </p>
                      <PasswordReveal
                        value={user.managedPassword}
                        emptyLabel="Not on file"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full"
                        onClick={() => openEditDialog(user)}
                        aria-label={
                          user.isPrimaryAdmin
                            ? "Edit primary administrator"
                            : "Edit user"
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {!user.isPrimaryAdmin ? (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 rounded-full"
                          onClick={() => void toggleActive(user.id, !user.isActive)}
                          aria-label={
                            user.isActive ? "Deactivate user" : "Activate user"
                          }
                        >
                          {user.isActive ? (
                            <UserX className="size-4" />
                          ) : (
                            <UserCheck className="size-4" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
                {users.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    No users found.
                  </p>
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Password</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="pl-6 font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{user.name}</span>
                            {user.isPrimaryAdmin ? (
                              <Badge variant="outline" className="w-fit text-[10px]">
                                Primary Admin
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <PasswordReveal
                            value={user.managedPassword}
                            emptyLabel="Not on file"
                          />
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
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEditDialog(user)}
                              aria-label={
                                user.isPrimaryAdmin
                                  ? "Edit primary administrator"
                                  : "Edit user"
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                            {!user.isPrimaryAdmin ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() =>
                                  void toggleActive(user.id, !user.isActive)
                                }
                                aria-label={
                                  user.isActive
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                              >
                                {user.isActive ? (
                                  <UserX className="size-4" />
                                ) : (
                                  <UserCheck className="size-4" />
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No users found.
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
              {editingUser
                ? editingPrimaryAdmin
                  ? "Edit Primary Administrator"
                  : "Edit User"
                : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userPosition">Position</Label>
              <Input
                id="userPosition"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                placeholder="e.g. Municipal Secretary"
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
                placeholder="email@municipality.gov.ph"
              />
            </div>
            {editingPrimaryAdmin ? (
              <div className="grid gap-2">
                <Label htmlFor="userMobile">Mobile Number</Label>
                <Input
                  id="userMobile"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  placeholder="09171234567"
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="userPassword">
                {editingUser ? "Current Password" : "Password"}{" "}
                {!editingUser && <span className="text-destructive">*</span>}
              </Label>
              <PasswordInput
                id="userPassword"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={
                  editingUser
                    ? formPassword
                      ? undefined
                      : "No password on file — enter a new password"
                    : "Min. 8 characters"
                }
                autoComplete={editingUser ? "current-password" : "new-password"}
              />
              {editingUser ? (
                <p className="text-xs text-muted-foreground">
                  Use the eye icon to view or hide. Change the value to update
                  the login password.
                </p>
              ) : null}
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
              ) : editingUser ? (
                "Save Changes"
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
