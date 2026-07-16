"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  emptyLGUProfileSetup,
  LGUProfileSetupForm,
  validateLGUProfileSetup,
  type LGUProfileSetupValues,
} from "@/components/super-admin/lgu-profile-setup-form";

type CreateLGUAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateLGUAccountDialog({
  open,
  onOpenChange,
}: CreateLGUAccountDialogProps) {
  const router = useRouter();
  const { addClient } = useSuperAdminLGUs();
  const [form, setForm] = useState<LGUProfileSetupValues>(emptyLGUProfileSetup);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setForm(emptyLGUProfileSetup);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleCreate() {
    if (!validateLGUProfileSetup(form)) {
      toast.error("Please complete all profile fields");
      return;
    }

    setIsSubmitting(true);
    const created = await addClient({
      municipality: form.municipality,
      province: form.province,
      administrator: { ...form.administrator },
    });
    setIsSubmitting(false);

    if (!created) {
      toast.error("Failed to create LGU account", {
        description: "Check your API connection and company admin login.",
      });
      return;
    }

    toast.success("LGU admin account created", {
      description: `${created.municipality}, ${created.province}`,
    });

    handleOpenChange(false);
    router.push(`/super-admin/lgus/${created.id}/`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create LGU Admin Account</DialogTitle>
          <DialogDescription>
            Set up the LGU profile and primary administrator. The LGU starts on
            Trial and can log in immediately. Activate paid subscription when
            payment is received to start the annual billing period.
          </DialogDescription>
        </DialogHeader>

        <LGUProfileSetupForm
          values={form}
          onChange={setForm}
          idPrefix="create-"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateLGUAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="h-11 w-full gap-2 rounded-full bg-violet-600 px-5 text-[13px] font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-700 sm:h-10 sm:w-auto"
      >
        <Plus className="size-4" />
        Create Account
      </Button>
      <CreateLGUAccountDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
