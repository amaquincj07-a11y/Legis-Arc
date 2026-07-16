"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Pencil } from "lucide-react";

import { getLGUDepartmentProfile } from "@/lib/billing";
import type { LGUDepartmentProfile, SupportPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAN_LABELS: Record<SupportPlan, string> = {
  annual: "Annual",
};

export function LGUDepartmentProfilePanel() {
  const [profile, setProfile] = useState<LGUDepartmentProfile>(
    getLGUDepartmentProfile()
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<LGUDepartmentProfile>(profile);

  function openModifyDialog() {
    setForm({ ...profile });
    setDialogOpen(true);
  }

  function handleSave() {
    if (
      !form.province.trim() ||
      !form.municipality.trim() ||
      !form.streetAddress.trim()
    ) {
      toast.error("Please fill in all address fields");
      return;
    }

    setProfile({ ...form });
    setDialogOpen(false);
    toast.success("LGU department profile updated");
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">LGU Department Profile</CardTitle>
            <CardDescription>
              Billing address and support plan for your local government unit
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={openModifyDialog}
          >
            <Pencil className="mr-2 size-4" />
            Modify
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Address
              </span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Province</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {profile.province}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Municipality</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {profile.municipality}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Street Address</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {profile.streetAddress}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Subscription Plan
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {PLAN_LABELS[profile.supportPlan]}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modify LGU Department Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={form.province}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, province: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="municipality">Municipality</Label>
              <Input
                id="municipality"
                value={form.municipality}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    municipality: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={form.streetAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    streetAddress: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supportPlan">Subscription Plan</Label>
              <Select
                value={form.supportPlan}
                onValueChange={(value: SupportPlan) =>
                  setForm((prev) => ({ ...prev, supportPlan: value }))
                }
              >
                <SelectTrigger id="supportPlan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
