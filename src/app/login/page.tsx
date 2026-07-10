"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
    router.push(result.redirectTo);
    setIsLoading(false);
  }

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
              LegisDoc Platform
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your dashboard
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
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

          <p className="mt-6 text-center text-xs text-muted-foreground">
            LGU accounts are created by the Company Admin team.
            <br />
            Contact support if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
