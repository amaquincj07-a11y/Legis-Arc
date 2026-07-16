"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Pencil, User } from "lucide-react";
import type { LGUClient } from "@/lib/types";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LGUProfileSetupForm,
  type LGUProfileSetupValues,
} from "@/components/super-admin/lgu-profile-setup-form";
import { PasswordReveal } from "@/components/ui/password-reveal";

type LGUProfileTabProps = {
  client: LGUClient;
  onUpdate: (updated: LGUClient) => void;
};

function toProfileValues(client: LGUClient): LGUProfileSetupValues {
  return {
    municipality: client.municipality,
    province: client.province,
    administrator: {
      ...client.administrator,
      password: client.administrator.managedPassword ?? "",
    },
  };
}

const PLAN_LABELS = {
  annual: "Annual",
} as const;

export function LGUProfileTab({ client, onUpdate }: LGUProfileTabProps) {
  const { updateClientProfile } = useSuperAdminLGUs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LGUProfileSetupValues>(() =>
    toProfileValues(client)
  );
  const [isSaving, setIsSaving] = useState(false);

  function openEditDialog() {
    setForm(toProfileValues(client));
    setDialogOpen(true);
  }

  async function handleSave() {
    if (
      !form.administrator.fullName.trim() ||
      !form.administrator.position.trim() ||
      !form.administrator.officeEmail.trim() ||
      !form.administrator.mobileNumber.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const nextPassword = form.administrator.password?.trim() ?? "";
    // If reveal password was never recorded (legacy), require Company Admin to set it once.
    if (!client.administrator.managedPassword && nextPassword.length < 8) {
      toast.error(
        "Enter the administrator password (min 8 characters) so it can be shown here for company support."
      );
      return;
    }

    setIsSaving(true);
    const updated = await updateClientProfile(
      client.id,
      { ...form.administrator },
      nextPassword || undefined
    );
    setIsSaving(false);

    if (!updated) {
      toast.error("Failed to update administrator profile");
      return;
    }

    onUpdate(updated);
    setDialogOpen(false);
    toast.success("Administrator profile updated");
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription>
              LGU details and primary administrator account
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openEditDialog}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Local Government Unit
              </span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">LGU</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.municipality}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Province</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.province}
                </dd>
              </div>
            </dl>
          </div>

          {client.streetAddress ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Department Address
                </span>
              </div>
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Street Address
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">
                    {client.streetAddress}
                  </dd>
                </div>
                {client.supportPlan ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Subscription Plan
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">
                      {PLAN_LABELS[client.supportPlan]}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <User className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Primary Administrator
              </span>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.administrator.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Position</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.administrator.position}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Office Email</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.administrator.officeEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Mobile Number</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {client.administrator.mobileNumber}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Current Password
                </dt>
                <dd className="mt-1">
                  <PasswordReveal
                    value={client.administrator.managedPassword}
                    emptyLabel="Not on file yet — open Edit and enter the login password once to enable reveal"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
          </DialogHeader>

          <LGUProfileSetupForm
            values={form}
            onChange={setForm}
            idPrefix="edit-"
            showLguFields={false}
            requirePassword={!client.administrator.managedPassword}
            isEditMode
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
