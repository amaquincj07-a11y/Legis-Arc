"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, UserCheck, UserX, Loader2, Users } from "lucide-react";
import type { LGUClient, User } from "@/lib/types";
import {
  createLGUUserForCompanyAction,
  fetchLGUUsersForCompanyAction,
  toggleLGUUserActiveForCompanyAction,
} from "@/lib/super-admin-lgu-user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LGUUsersTabProps = {
  client: LGUClient;
};

export function LGUUsersTab({ client }: LGUUsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const result = await fetchLGUUsersForCompanyAction(client.id);
    if (result.success) {
      setUsers(result.data);
    } else {
      setUsers([]);
      toast.error(result.error);
    }
    setLoading(false);
  }, [client.id]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function openCreateDialog() {
    setFormName("");
    setFormEmail("");
    setFormPosition("");
    setFormPassword("");
    setDialogOpen(true);
  }

  async function handleCreate() {
    const formData = new FormData();
    formData.set("name", formName);
    formData.set("email", formEmail);
    formData.set("position", formPosition);
    formData.set("password", formPassword);

    setSaving(true);
    const result = await createLGUUserForCompanyAction(client.id, formData);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setUsers((current) => [...current, result.data]);
    setDialogOpen(false);
    toast.success("LGU user access granted");
  }

  async function handleToggleActive(user: User) {
    const result = await toggleLGUUserActiveForCompanyAction(
      client.id,
      user.id,
      !user.isActive
    );

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setUsers((current) =>
      current.map((entry) => (entry.id === user.id ? result.data : entry))
    );
    toast.success(
      result.data.isActive ? "User access restored" : "User access revoked"
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">LGU User Access</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Grant login access for {client.municipality} staff even before
            payment. Subscription billing starts separately when payment is
            activated.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="gap-2 rounded-full bg-[#cbab53] px-5 text-slate-900 hover:bg-[#b89745]"
        >
          <Plus className="size-4" />
          Add LGU User
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Users className="size-8 text-slate-300" />
            <p className="text-sm text-muted-foreground">
              No LGU users found for this account yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isPrimaryAdmin ? (
                        <Badge variant="secondary">Primary Admin</Badge>
                      ) : (
                        <Badge variant="outline">Staff</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={
                          user.isActive
                            ? "bg-emerald-600 hover:bg-emerald-600"
                            : ""
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.isPrimaryAdmin ? (
                        <span className="text-xs text-muted-foreground">
                          Managed in Profile
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => void handleToggleActive(user)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="size-3.5" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3.5" />
                              Grant
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add LGU User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="company-user-name">Full Name</Label>
              <Input
                id="company-user-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-user-email">Email</Label>
              <Input
                id="company-user-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-user-position">Position</Label>
              <Input
                id="company-user-position"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-user-password">Temporary Password</Label>
              <Input
                id="company-user-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleCreate()}
            >
              {saving ? "Creating..." : "Grant Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
