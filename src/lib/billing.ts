import {
  mockBillingHistory,
  mockBillingOverview,
  mockInvoices,
  mockLGUDepartmentProfile,
} from "./mock-data";
import type { Invoice } from "./types";

export function getBillingOverview() {
  return mockBillingOverview;
}

export function getBillingHistory() {
  return [...mockBillingHistory].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}

export function getLGUDepartmentProfile() {
  return { ...mockLGUDepartmentProfile };
}

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((invoice) => invoice.id === id);
}
