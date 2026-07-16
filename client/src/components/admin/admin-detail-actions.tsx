import { cn } from "@/lib/utils";

type AdminDetailActionsProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Action bar for admin detail pages. On mobile the buttons lay out in a
 * two-column grid for large tap targets; from sm up they flow inline.
 * Child <Button> elements are stretched to fill their cell on mobile.
 */
export function AdminDetailActions({
  children,
  className,
}: AdminDetailActionsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 *:w-full sm:flex sm:flex-nowrap sm:items-center sm:gap-2 sm:*:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
