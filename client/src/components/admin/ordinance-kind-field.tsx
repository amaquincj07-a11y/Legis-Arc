"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { APPROPRIATION_ORDINANCE_CATEGORY } from "@/lib/constants";

type OrdinanceKindFieldProps = {
  category: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function OrdinanceKindField({
  category,
  checked,
  onCheckedChange,
}: OrdinanceKindFieldProps) {
  if (category !== APPROPRIATION_ORDINANCE_CATEGORY) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50/60 p-4">
      <Switch
        id="appropriation-ordinance"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label htmlFor="appropriation-ordinance" className="text-sm font-medium">
          Appropriation Ordinance
        </Label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Turn on for annual or supplemental budget ordinances. They will appear
          as <span className="font-medium">APPROPRIATION ORD</span> on the list.
          Other Budget ordinances stay as{" "}
          <span className="font-medium">MUNICIPAL ORD</span>.
        </p>
      </div>
    </div>
  );
}
