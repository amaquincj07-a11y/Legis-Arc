export type DocumentType = "ordinance" | "resolution" | "minutes";
export type OrdinanceKind = "municipal" | "appropriation";
export type DocumentStatus = "draft" | "approved" | "published" | "archived";
export type SessionType = "regular" | "special";
export type UserRole =
  | "sys_admin"
  | "sb_secretary"
  | "sb_member"
  | "digitization_assistant";

export type AccountPortal = "lgu" | "company";
export type RequestStatus =
  | "submitted"
  | "approved"
  | "released"
  | "denied";

export interface TrackingEvent {
  status: string;
  date: Date;
  performedBy: string;
}

export interface DocumentVersion {
  versionNumber: number;
  pdfUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  notes: string;
}

export interface LegislativeDocument {
  id: string;
  documentType: "ordinance" | "resolution";
  ordinanceKind?: OrdinanceKind;
  proposedNumber: string;
  approvedNumber: string;
  seriesYear: number;
  title: string;
  authorSponsor: string;
  category: string;
  dateEnacted: Date;
  dateApproved: Date;
  publicationInfo: string;
  remarks: string;
  notes: string;
  repealsAmendments: string;
  status: DocumentStatus;
  isPublic: boolean;
  pdfUrl: string;
  versions: DocumentVersion[];
  timeline: TrackingEvent[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMinutes {
  id: string;
  documentType: "minutes";
  sessionDate: Date;
  sessionType: SessionType;
  status: DocumentStatus;
  isPublic: boolean;
  pdfUrl: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ModuleKey =
  | "ordinances"
  | "resolutions"
  | "minutes"
  | "categories";

export interface User {
  id: string;
  name: string;
  email: string;
  lguId?: string;
  position: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  isPrimaryAdmin?: boolean;
  managedPassword?: string;
  lastLogin: Date;
  createdAt: Date;
  moduleAccess?: ModuleKey[];
  allowedCategories?: string[];
}

export interface CompanyAdmin {
  id: string;
  name: string;
  email: string;
}

export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  portal: AccountPortal;
  userId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  documentId?: string;
  documentTitle?: string;
  details: string;
}

export interface DocumentRequest {
  id: string;
  requestor: string;
  documentId: string;
  documentTitle: string;
  dateRequested: Date;
  dateReleased?: Date;
  status: RequestStatus;
  processedBy: string;
}

export interface DocumentDownloadRecord {
  id: string;
  dateRequested: Date;
  name: string;
  office: string;
  purpose: string;
  fileType: string;
  documentNumber: string;
  title: string;
  category: string;
}

export interface PublicDocumentDownloadContext {
  province: string;
  municipality: string;
  documentId: string;
  documentType: DocumentType;
  documentNumber?: string;
  documentTitle: string;
  documentCategory?: string;
  municipalityLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export type SBMemberPositionSlot =
  | "vice_mayor"
  | "kagawad_1"
  | "kagawad_2"
  | "kagawad_3"
  | "kagawad_4"
  | "kagawad_5"
  | "kagawad_6"
  | "kagawad_7"
  | "kagawad_8"
  | "abc_president"
  | "sk_federated"
  | "sb_secretary";

export interface SBMember {
  id: string;
  name: string;
  position: string;
  positionSlot: SBMemberPositionSlot;
  yearTerm: string;
  committees: string[];
  imageUrl?: string;
}

export interface Committee {
  id: string;
  name: string;
  yearTerm: string;
  chairman: string;
  viceChairman: string;
  members: string[];
}

export interface CSOOrganization {
  id: string;
  name: string;
  officerName: string;
  position: string;
  term: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export type SupportPlan = "annual";
export type LGUPaymentStatus = "paid" | "unpaid";
export type BillingEntryType = "invoice" | "payment";

export interface BillingOverview {
  paymentStatus: LGUPaymentStatus;
  accountStatus: LGUClientStatus;
  subscriptionPlan: string;
  subscriptionAmount: number;
  expiresOn: Date | null;
  daysRemaining: number | null;
}

export interface BillingHistoryEntry {
  id: string;
  date: Date;
  description: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  periodLabel: string;
  issueDate: Date;
  dueDate: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "open" | "past_due";
}

export interface LGUDepartmentProfile {
  province: string;
  municipality: string;
  streetAddress: string;
  supportPlan: SupportPlan;
}

export type LGUClientStatus = "trial" | "active" | "expired" | "suspended";

export interface LGUAdministrator {
  fullName: string;
  position: string;
  officeEmail: string;
  mobileNumber: string;
  password?: string;
  managedPassword?: string;
}

export interface LGUClient {
  id: string;
  municipality: string;
  province: string;
  status: LGUClientStatus;
  subscriptionAmount: number;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  documentCount: number;
  streetAddress?: string;
  supportPlan?: SupportPlan;
  primaryAdminProfileId?: string;
  administrator: LGUAdministrator;
}

export interface SuperAdminDashboardStats {
  activeLGUs: number;
  paid: number;
  trial: number;
  expiringSoon: number;
  revenue: number;
  documents: number;
}

export interface CreateLGUAccountInput {
  municipality: string;
  province: string;
  administrator: LGUAdministrator;
}
