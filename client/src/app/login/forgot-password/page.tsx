"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthCardShell } from "@/components/auth-card-shell";
import { requestLguPasswordResetAction } from "@/lib/password-reset-actions";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    setIsLoading(true);

    const redirectTo = `${window.location.origin}/login/reset-password/`;
    const result = await requestLguPasswordResetAction(values.email, redirectTo);

    if (!result.success) {
      toast.error("Could not send reset email", {
        description: result.error,
      });
      setIsLoading(false);
      return;
    }

    setSent(true);
    toast.success("Check your email", {
      description: result.message,
    });
    setIsLoading(false);
  }

  return (
    <AuthCardShell
      title="Forgot password"
      description="Enter your LGU main admin email to receive a reset link."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            If that email matches an LGU main admin account, a reset link has been
            sent. Open the link in the same browser to choose a new password.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Return to sign in</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal font-semibold text-white shadow-lg shadow-teal/25 hover:bg-teal/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </Form>
      )}
    </AuthCardShell>
  );
}
