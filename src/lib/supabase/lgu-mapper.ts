import { formatPlaceName } from "@/lib/places";
import type {
  LGUClient,
  LGUClientStatus,
  LGUAdministrator,
  SupportPlan,
} from "@/lib/types";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  position: string | null;
  mobile: string | null;
  is_primary_admin: boolean;
  managed_password: string | null;
}

export interface LguRow {
  id: string;
  province: string;
  municipality: string;
  status: LGUClientStatus;
  subscription_amount: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  street_address: string | null;
  support_plan: SupportPlan | null;
  document_count: number;
  admin_full_name: string;
  admin_position: string;
  admin_office_email: string;
  admin_mobile_number: string;
  profiles?: ProfileRow[] | null;
}

export function toPlaceStorageKey(name: string): string {
  return name.trim().toUpperCase();
}

export function mapLguRowToClient(row: LguRow): LGUClient {
  const primaryAdmin =
    row.profiles?.find((profile) => profile.is_primary_admin) ??
    row.profiles?.[0];

  const administrator: LGUAdministrator = {
    fullName: primaryAdmin?.full_name ?? row.admin_full_name,
    position: primaryAdmin?.position ?? row.admin_position,
    officeEmail: primaryAdmin?.email ?? row.admin_office_email,
    mobileNumber: primaryAdmin?.mobile ?? row.admin_mobile_number,
    managedPassword: primaryAdmin?.managed_password ?? undefined,
  };

  return {
    id: row.id,
    province: formatPlaceName(row.province),
    municipality: formatPlaceName(row.municipality),
    status: row.status,
    subscriptionAmount: Number(row.subscription_amount),
    subscriptionStartDate: row.subscription_start_date
      ? new Date(row.subscription_start_date)
      : null,
    subscriptionEndDate: row.subscription_end_date
      ? new Date(row.subscription_end_date)
      : null,
    documentCount: row.document_count ?? 0,
    streetAddress: row.street_address ?? undefined,
    supportPlan: row.support_plan ?? undefined,
    primaryAdminProfileId: primaryAdmin?.id,
    administrator,
  };
}

export const LGU_SELECT = `
  id,
  province,
  municipality,
  status,
  subscription_amount,
  subscription_start_date,
  subscription_end_date,
  street_address,
  support_plan,
  document_count,
  admin_full_name,
  admin_position,
  admin_office_email,
  admin_mobile_number,
  profiles (
    id,
    full_name,
    email,
    position,
    mobile,
    is_primary_admin,
    managed_password
  )
`;
