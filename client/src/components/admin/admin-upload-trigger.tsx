import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type AdminUploadTriggerProps = {
  label?: string;
  uploadHref: string;
  icon?: LucideIcon;
};

export function AdminUploadTrigger({
  label = "Upload New",
  uploadHref,
  icon: Icon = Plus,
}: AdminUploadTriggerProps) {
  return (
    <Button
      asChild
      className="h-11 w-full gap-2 rounded-full bg-[#cbab53] px-5 text-[13px] font-semibold text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40 sm:h-10 sm:w-auto"
    >
      <Link href={uploadHref}>
        <Icon className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
