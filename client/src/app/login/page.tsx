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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { AdminPageLoaderCentered } from "@/components/admin/admin-page-loader";
import { AuthCardShell } from "@/components/auth-card-shell";
import type { AccountPortal } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function resolvePostLoginPath(
  portal: AccountPortal,
  fallback: string,
  nextParam: string | null
) {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return fallback;
  }

  const normalized =
    nextParam.endsWith("/") && nextParam.length > 1
      ? nextParam.slice(0, -1)
      : nextParam;

  if (portal === "lgu" && (normalized === "/admin" || normalized.startsWith("/admin/"))) {
    return nextParam;
  }

  if (
    portal === "company" &&
    (normalized === "/super-admin" || normalized.startsWith("/super-admin/"))
  ) {
    return nextParam;
  }

  return fallback;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login,
    isAuthenticated,
    isTabUnlocked,
    isLoading: authLoading,
    portal,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated || !portal || !isTabUnlocked) return;

    const fallback =
      portal === "company" ? "/super-admin/dashboard" : "/admin/dashboard";
    router.replace(
      resolvePostLoginPath(portal, fallback, searchParams.get("next"))
    );
  }, [
    authLoading,
    isAuthenticated,
    isTabUnlocked,
    portal,
    router,
    searchParams,
  ]);

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);

    const result = await login(values.email, values.password);

    if (!result.success) {
      toast.error("Login failed", {
        description: result.error ?? "Invalid email or password. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!", {
      description: "Redirecting to dashboard...",
    });

    const destination = resolvePostLoginPath(
      result.portal,
      result.redirectTo,
      searchParams.get("next")
    );

    // Full navigation so the JWT cookie is always sent to middleware.
    window.location.assign(destination);
    setIsLoading(false);
  }

  if (authLoading || (isAuthenticated && isTabUnlocked)) {
    return <AdminPageLoaderCentered className="min-h-screen" />;
  }

  return (
    <AuthCardShell
      title="LegisDoc Platform"
      description="Sign in to your dashboard"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          LGU accounts are created by the Company Admin team.
          <br />
          Contact support if you need access.
        </p>
      }
    >
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/login/forgot-password"
                    className="text-xs font-medium text-teal hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </AuthCardShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AdminPageLoaderCentered className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
