"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPdfDocumentField } from "@/components/admin/edit-pdf-document-field";
import { AdminFormPageHeader } from "@/components/admin/admin-form-page-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchSessionMinutesByIdAction,
  updateSessionMinutesAction,
} from "@/lib/minutes-actions";
import {
  ADMIN_CACHE_KEYS,
  invalidateAdminDocumentCaches,
} from "@/lib/admin-query-cache";
import {
  formatSessionDateDisplay,
  formatSessionDateInput,
} from "@/lib/session-date";

const formSchema = z.object({
  sessionDate: z.string().min(1, "Session date is required"),
  sessionType: z.enum(["regular", "special"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditMinutesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sessionDateLabel, setSessionDateLabel] = useState("");
  const [existingPdfFileName, setExistingPdfFileName] = useState("");
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [hasExistingPdf, setHasExistingPdf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionDate: "",
      sessionType: "regular",
    },
  });

  useEffect(() => {
    async function load() {
      const result = await fetchSessionMinutesByIdAction(id);
      if (result.success) {
        const sessionDate = formatSessionDateInput(result.data.sessionDate);
        setSessionDateLabel(formatSessionDateDisplay(sessionDate));
        setExistingPdfFileName(`minutes-${sessionDate}.pdf`);
        setExistingPdfUrl(result.data.pdfUrl?.trim() ?? "");
        setHasExistingPdf(Boolean(result.data.pdfUrl?.trim()));
        form.reset({
          sessionDate,
          sessionType: result.data.sessionType,
        });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    void load();
  }, [id, form]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading session minutes...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Minutes not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The session minutes you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/minutes">Back to Minutes</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("sessionDate", values.sessionDate);
    formData.append("sessionType", values.sessionType);
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    const result = await updateSessionMinutesAction(id, formData);
    setSubmitting(false);

    if (result.success) {
      invalidateAdminDocumentCaches(ADMIN_CACHE_KEYS.minutes);
      toast.success("Minutes updated successfully");
      router.push("/admin/minutes");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AdminFormPageHeader
            backHref="/admin/minutes"
            title={`Edit Minutes — ${sessionDateLabel}`}
            description="Update the session details below"
            actions={
              <>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/minutes">Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Session Date{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">PDF Document</CardTitle>
            </CardHeader>
            <CardContent>
              <EditPdfDocumentField
                existingFileName={existingPdfFileName}
                existingPdfUrl={existingPdfUrl}
                hasExistingDocument={hasExistingPdf}
                value={pdfFile}
                onChange={setPdfFile}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
