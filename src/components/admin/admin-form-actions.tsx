import { cn } from "@/lib/utils";

type AdminFormActionsProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminFormActions({ children, className }: AdminFormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
