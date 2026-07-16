"use client";

import { Building2, User } from "lucide-react";
import {
  formatPlaceName,
  getDefaultMunicipalityForProvince,
  getMunicipalities,
  getProvinces,
  DEFAULT_PROVINCE,
} from "@/lib/places";
import type { LGUAdministrator } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LGUProfileSetupValues = {
  municipality: string;
  province: string;
  administrator: LGUAdministrator;
};

export const emptyLGUProfileSetup: LGUProfileSetupValues = {
  municipality: formatPlaceName(
    getDefaultMunicipalityForProvince(DEFAULT_PROVINCE)
  ),
  province: formatPlaceName(DEFAULT_PROVINCE),
  administrator: {
    fullName: "",
    position: "",
    officeEmail: "",
    mobileNumber: "",
    password: "",
  },
};

type LGUProfileSetupFormProps = {
  values: LGUProfileSetupValues;
  onChange: (values: LGUProfileSetupValues) => void;
  idPrefix?: string;
  showLguFields?: boolean;
  requirePassword?: boolean;
  isEditMode?: boolean;
};

export function LGUProfileSetupForm({
  values,
  onChange,
  idPrefix = "",
  showLguFields = true,
  requirePassword = true,
  isEditMode = false,
}: LGUProfileSetupFormProps) {
  const provinces = getProvinces();
  const provinceKey =
    provinces.find(
      (p) => formatPlaceName(p) === values.province || p === values.province
    ) ?? DEFAULT_PROVINCE;
  const municipalities = getMunicipalities(provinceKey);

  function updateAdministrator(patch: Partial<LGUAdministrator>) {
    onChange({
      ...values,
      administrator: { ...values.administrator, ...patch },
    });
  }

  function handleProvinceChange(province: string) {
    const municipality = getDefaultMunicipalityForProvince(province);
    onChange({
      ...values,
      province: formatPlaceName(province),
      municipality: municipality ? formatPlaceName(municipality) : "",
    });
  }

  return (
    <div className="space-y-6">
      {showLguFields && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Local Government Unit
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}province`}>Province</Label>
              <Select value={provinceKey} onValueChange={handleProvinceChange}>
                <SelectTrigger id={`${idPrefix}province`} className="w-full">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {formatPlaceName(province)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}municipality`}>LGU</Label>
              <Select
                value={
                  municipalities.find(
                    (m) => formatPlaceName(m) === values.municipality
                  ) ?? ""
                }
                onValueChange={(municipality) =>
                  onChange({
                    ...values,
                    municipality: formatPlaceName(municipality),
                  })
                }
              >
                <SelectTrigger id={`${idPrefix}municipality`} className="w-full">
                  <SelectValue placeholder="Select municipality or city" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {formatPlaceName(municipality)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          <User className="size-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Primary Administrator
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}fullName`}>Full Name</Label>
            <Input
              id={`${idPrefix}fullName`}
              value={values.administrator.fullName}
              onChange={(e) => updateAdministrator({ fullName: e.target.value })}
              placeholder="Maria Santos Cruz"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}position`}>Position</Label>
            <Input
              id={`${idPrefix}position`}
              value={values.administrator.position}
              onChange={(e) => updateAdministrator({ position: e.target.value })}
              placeholder="Municipal Secretary"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}officeEmail`}>Office Email</Label>
            <Input
              id={`${idPrefix}officeEmail`}
              type="email"
              value={values.administrator.officeEmail}
              onChange={(e) =>
                updateAdministrator({ officeEmail: e.target.value })
              }
              placeholder="secretary@lgu.gov.ph"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}mobileNumber`}>Mobile Number</Label>
            <Input
              id={`${idPrefix}mobileNumber`}
              value={values.administrator.mobileNumber}
              onChange={(e) =>
                updateAdministrator({ mobileNumber: e.target.value })
              }
              placeholder="09171234567"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={`${idPrefix}password`}>
              {isEditMode
                ? "Current Password"
                : requirePassword
                  ? "Password"
                  : "New Password (optional)"}
            </Label>
            <PasswordInput
              id={`${idPrefix}password`}
              value={values.administrator.password ?? ""}
              onChange={(e) => updateAdministrator({ password: e.target.value })}
              placeholder={
                isEditMode
                  ? values.administrator.password
                    ? undefined
                    : "No password on file — enter a new password"
                  : requirePassword
                    ? "Set initial password"
                    : "Leave blank to keep current"
              }
              autoComplete={isEditMode ? "current-password" : "new-password"}
            />
            {isEditMode ? (
              <p className="text-xs text-muted-foreground">
                Use the eye icon to view or hide. Change the value to update the
                primary administrator login password.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function validateLGUProfileSetup(
  values: LGUProfileSetupValues,
  requirePassword = true
): boolean {
  const { municipality, province, administrator } = values;
  return Boolean(
    municipality.trim() &&
      province.trim() &&
      administrator.fullName.trim() &&
      administrator.position.trim() &&
      administrator.officeEmail.trim() &&
      administrator.mobileNumber.trim() &&
      (requirePassword ? administrator.password?.trim() : true)
  );
}
