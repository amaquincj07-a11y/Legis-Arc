"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  DocumentScannerFlow,
  defaultBuildPdf,
} from "@/components/admin/document-scanner/document-scanner-flow";
import { ScanDocumentInfoDialog } from "@/components/admin/document-scanner/scan-document-info-dialog";
import { Input } from "@/components/ui/input";
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
import { createSessionMinutesAction } from "@/lib/minutes-actions";

const formSchema = z.object({
  sessionDate: z.string().min(1, "Session date is required"),
  sessionType: z.enum(["regular", "special"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function MinutesScanPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionDate: "",
      sessionType: "regular",
    },
  });

  async function handleUpload(pdfFile: File) {
    const valid = await form.trigger();
    if (!valid) {
      toast.error("Please complete all required session information");
      return false;
    }

    const values = form.getValues();
    const formData = new FormData();
    formData.append("sessionDate", values.sessionDate);
    formData.append("sessionType", values.sessionType);
    formData.append("pdf", pdfFile);

    const result = await createSessionMinutesAction(formData);
    if (result.success) {
      toast.success("Scanned session minutes uploaded successfully");
      return true;
    }

    toast.error(result.error);
    return false;
  }

  return (
    <DocumentScannerFlow
      backHref="/admin/minutes"
      pdfFileName="scanned-minutes.pdf"
      onBuildPdf={(pages) => defaultBuildPdf(pages, "scanned-minutes.pdf")}
      onUpload={handleUpload}
      infoDialog={({ open, onOpenChange, pdfFile, submitting, onSubmit }) => (
        <ScanDocumentInfoDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Session minutes information"
          description="Review the scanned PDF and fill in the session details before uploading."
          pdfFile={pdfFile}
          submitting={submitting}
          onSubmit={onSubmit}
        >
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Session Date <span className="text-destructive">*</span>
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
            </form>
          </Form>
        </ScanDocumentInfoDialog>
      )}
    />
  );
}
