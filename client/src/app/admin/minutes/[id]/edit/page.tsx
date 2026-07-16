"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminFormActions } from "@/components/admin/admin-form-actions";
import { EditPdfDocumentField } from "@/components/admin/edit-pdf-document-field";
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
        const sessionDate = result.data.sessionDate;
        setSessionDateLabel(format(sessionDate, "MMMM d, yyyy"));
        setExistingPdfFileName(
          `minutes-${format(sessionDate, "yyyy-MM-dd")}.pdf`
        );
        setHasExistingPdf(Boolean(result.data.pdfUrl));
        form.reset({
          sessionDate: format(result.data.sessionDate, "yyyy-MM-dd"),
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
      toast.success("Minutes updated successfully");
      router.push("/admin/minutes");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/minutes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Minutes — {sessionDateLabel}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the session details below
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                hasExistingDocument={hasExistingPdf}
                value={pdfFile}
                onChange={setPdfFile}
              />
            </CardContent>
          </Card>

          <Separator />

          <AdminFormActions>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/admin/minutes">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </AdminFormActions>
        </form>
      </Form>
    </div>
  );
}
