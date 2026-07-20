/**
 * Empty-field affordance for admin document forms.
 * Soft fill + light italic placeholders so hints don't look like entered values.
 */
export const adminDocInputClassName =
  "bg-muted/50 text-foreground placeholder:text-muted-foreground/40 placeholder:italic focus-visible:bg-background";

export const adminDocTextareaClassName =
  "min-h-[80px] resize-none bg-muted/50 text-foreground placeholder:text-muted-foreground/40 placeholder:italic focus-visible:bg-background";

export const adminDocSelectTriggerClassName =
  "w-full bg-muted/50 data-[placeholder]:text-muted-foreground/40 data-[placeholder]:italic focus-visible:bg-background";
