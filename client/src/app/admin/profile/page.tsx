"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileStack,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  UserCircle,
  Briefcase,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/constants";
import {
  fetchCurrentLGUAccountProfileAction,
  type LGUAccountProfile,
} from "@/lib/lgu-account-actions";
import { formatPeso } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LGUStatusBadge } from "@/components/super-admin/lgu-status-badge";
import { getEffectiveLGUStatus, SUBSCRIPTION_PLAN_LABEL } from "@/lib/lgu-subscription";
import { PasswordReveal } from "@/components/ui/password-reveal";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMobile(mobile: string) {
  if (!mobile) return "—";
  if (mobile.length === 11 && mobile.startsWith("09")) {
    return `${mobile.slice(0, 4)} ${mobile.slice(4, 7)} ${mobile.slice(7)}`;
  }
  return mobile;
}

type ProfileFieldProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-900 wrap-break-word">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [accountProfile, setAccountProfile] =
    useState<LGUAccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      const result = await fetchCurrentLGUAccountProfileAction();
      if (cancelled) return;

      if (!result.success) {
        setAccountProfile(null);
        setError(result.error);
      } else {
        setAccountProfile(result.data);
      }

      setIsLoading(false);
    }

    if (user) {
      void loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl">
        <AdminPageHeader
          title="Profile"
          description="View your account information"
        />
        <Card className="mt-6">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No user is signed in.
          </CardContent>
        </Card>
      </div>
    );
  }

  const shouldShowLoading = isLoading || (!accountProfile && !error);

  if (shouldShowLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <AdminPageHeader
          title="Profile"
          description="Your account information for the Legislative Management System"
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !accountProfile) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <AdminPageHeader
          title="Profile"
          description="Your account information for the Legislative Management System"
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-slate-900">
              Unable to load database profile
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error ?? "The signed-in account is not linked to an LGU record."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, lgu } = accountProfile;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Profile"
        description="Your account and registered LGU information"
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-xl">{profile.fullName}</CardTitle>
            <CardDescription className="mt-1">
              {profile.position}
            </CardDescription>
            <Badge variant="secondary" className="mt-2">
              {ROLE_LABELS[profile.role]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ProfileField
            icon={<UserCircle className="size-4" />}
            label="Full Name"
            value={profile.fullName}
          />
          <ProfileField
            icon={<Briefcase className="size-4" />}
            label="Position"
            value={profile.position}
          />
          <ProfileField
            icon={<Mail className="size-4" />}
            label="Email"
            value={profile.email}
          />
          {profile.isPrimaryAdmin ? (
            <ProfileField
              icon={<Phone className="size-4" />}
              label="Mobile Number"
              value={formatMobile(profile.mobile)}
            />
          ) : null}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 sm:col-span-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <KeyRound className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current Password
              </p>
              <div className="mt-1">
                <PasswordReveal
                  value={profile.managedPassword}
                  emptyLabel="Managed by your Company Admin"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Registered LGU Account
              </CardTitle>
              <CardDescription>
                Information registered by the Company Admin
              </CardDescription>
            </div>
            <LGUStatusBadge
              status={getEffectiveLGUStatus({
                status: lgu.status,
                subscriptionStartDate: lgu.subscriptionStartDate,
                subscriptionEndDate: lgu.subscriptionEndDate,
              })}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ProfileField
            icon={<Building2 className="size-4" />}
            label="LGU"
            value={lgu.municipality}
          />
          <ProfileField
            icon={<MapPin className="size-4" />}
            label="Province"
            value={lgu.province}
          />
          <ProfileField
            icon={<MapPin className="size-4" />}
            label="Office Address"
            value={lgu.streetAddress}
          />
          <ProfileField
            icon={<FileStack className="size-4" />}
            label="Documents"
            value={lgu.documentCount.toLocaleString("en-PH")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription Details</CardTitle>
          <CardDescription>
            Current billing period for this registered LGU account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ProfileField
            icon={<BadgeCheck className="size-4" />}
            label="Subscription Plan"
            value={SUBSCRIPTION_PLAN_LABEL}
          />
          <ProfileField
            icon={<BadgeCheck className="size-4" />}
            label="Subscription Amount"
            value={formatPeso(lgu.subscriptionAmount)}
          />
          <ProfileField
            icon={<CalendarDays className="size-4" />}
            label="Date Started"
            value={
              lgu.subscriptionStartDate
                ? format(lgu.subscriptionStartDate, "MMMM d, yyyy")
                : "Not started"
            }
          />
          <ProfileField
            icon={<CalendarDays className="size-4" />}
            label="Date Ended"
            value={
              lgu.subscriptionEndDate
                ? format(lgu.subscriptionEndDate, "MMMM d, yyyy")
                : "Not started"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
