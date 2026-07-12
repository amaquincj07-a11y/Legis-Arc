import { Landmark } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuthCardShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy">
        <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-light/60 to-navy" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -left-20 bottom-1/4 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl shadow-black/30">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white shadow-lg shadow-navy/30">
            <Landmark className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {children}
          {footer ? <div className="mt-6">{footer}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
