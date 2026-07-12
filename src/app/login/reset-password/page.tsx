"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthCardShell } from "@/components/auth-card-shell";
import { AdminPageLoaderCentered } from "@/components/admin/admin-page-loader";
import { createClient } from "@/lib/supabase/client";
import { completeLguPasswordResetAction } from "@/lib/password-reset-actions";
import { signOutFromSupabase } from "@/lib/auth";
import { clearTabSession } from "@/lib/tab-session";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPreparing, setIsPreparing] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function prepareSession() {
      try {
        const supabase = createClient();
        const code = searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (!cancelled) {
              setPrepareError(
                "This reset link is invalid or has expired. Request a new one."
              );
              setIsPreparing(false);
            }
            return;
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setPrepareError(
              "Open the reset link from your email to choose a new password."
            );
            setIsPreparing(false);
          }
          return;
        }

        if (!cancelled) {
          setIsReady(true);
          setIsPreparing(false);
        }
      } catch {
        if (!cancelled) {
          setPrepareError("Unable to verify the reset link. Please try again.");
          setIsPreparing(false);
        }
      }
    }

    void prepareSession();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function onSubmit(values: ResetValues) {
    setIsLoading(true);

    const result = await completeLguPasswordResetAction(
      values.password,
      values.confirmPassword
    );

    if (!result.success) {
      toast.error("Could not update password", {
        description: result.error,
      });
      setIsLoading(false);
      return;
    }

    clearTabSession();
    await signOutFromSupabase();

    toast.success("Password updated", {
      description: result.message,
    });

    router.replace("/login");
    setIsLoading(false);
  }

  if (isPreparing) {
    return <AdminPageLoaderCentered className="min-h-screen" />;
  }

  if (prepareError || !isReady) {
    return (
      <AuthCardShell
        title="Reset password"
        description="We could not verify your reset link."
        footer={
          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/login/forgot-password"
              className="font-medium text-teal hover:underline"
            >
              Request a new reset link
            </Link>
            {" · "}
            <Link href="/login" className="font-medium text-teal hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <p className="text-sm text-muted-foreground">
          {prepareError ??
            "Open the reset link from your email to choose a new password."}
        </p>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Set new password"
      description="Choose a new password for your LGU main admin account."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="font-medium text-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
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
                Saving...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </Form>
    </AuthCardShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AdminPageLoaderCentered className="min-h-screen" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
