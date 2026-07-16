import type { LguStatus } from "./enums.js";

export interface LguRow {
  id: string;
  province: string;
  municipality: string;
  status: LguStatus;
  subscription_amount: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  street_address: string | null;
  support_plan: string | null;
  document_count: number;
  admin_full_name: string | null;
  admin_position: string | null;
  admin_office_email: string | null;
  admin_mobile_number: string | null;
  created_at: string;
  updated_at: string;
}

export const LGU_SELECT =
  "id, province, municipality, status, subscription_amount, subscription_start_date, subscription_end_date, street_address, support_plan, document_count, admin_full_name, admin_position, admin_office_email, admin_mobile_number, created_at, updated_at";
