"use client";

import { LifeBuoy, Mail } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SUPPORT_EMAIL = "support@legisarc.net";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title="Support"
        description="Get help from the LegisArc team when you need it"
      />

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/70 pb-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]">
            <LifeBuoy className="size-6" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-xl text-slate-900">
              We&apos;re here to help
            </CardTitle>
            <CardDescription className="text-[15px] leading-relaxed text-slate-600">
              If you encounter any errors, bugs, concerns, or have questions
              about LegisArc, please don&apos;t hesitate to reach out. Our
              support team is ready to assist you.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email us at
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-1.5 inline-flex items-center gap-2 text-base font-semibold text-[#1e3a5f] underline-offset-4 hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            When contacting support, please include your LGU name, a brief
            description of the issue, and any relevant screenshots. This helps
            us respond more quickly and accurately.
          </p>

          <Button
            asChild
            className="h-11 gap-2 rounded-full bg-[#1e3a5f] px-5 text-[13px] font-semibold text-white hover:bg-[#1e3a5f]/90"
          >
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail className="size-4" aria-hidden />
              Contact Support
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
