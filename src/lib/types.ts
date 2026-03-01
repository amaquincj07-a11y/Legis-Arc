export type DocumentType = "ordinance" | "resolution" | "minutes";
export type DocumentStatus = "draft" | "approved" | "published" | "archived";
export type SessionType = "regular" | "special";
export type UserRole =
  | "sys_admin"
  | "sb_secretary"
  | "sb_member"
  | "digitization_assistant";
export type RequestStatus =
  | "submitted"
  | "approved"
  | "released"
  | "denied";
export type ReferralType =
  | "letter"
  | "brgy_resolution"
  | "brgy_ordinance"
  | "subd_application"
  | "accreditation"
  | "board_council_resolutions"
  | "memorandum"
  | "executive_orders"
  | "draft_resolutions"
  | "draft_ordinance"
  | "others";
export type TrackingStatus =
  | "for_referral"
  | "under_committee"
  | "for_public_hearing"
  | "for_committee_report"
  | "for_signature"
  | "for_approval"
  | "for_reporting"
  | "others";

export interface TrackingEvent {
  status: string;
  date: Date;
  performedBy: string;
}

export interface RoutingHistoryEntry {
  office: string;
  assignedTo: string;
  stage: string;
  date: Date;
  remark?: string;
  committee?: string;
  userEmail?: string;
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
  /** Current office/committee holding the document */
  currentOffice?: string;
  /** Person responsible at current location */
  assignedTo?: string;
  /** Stage (e.g. For Review, For Signature, For Publication) */
  stage?: string;
  /** Log of routing movements */
  routingHistory?: RoutingHistoryEntry[];
  /** Session Date for tracking (YYYY-MM-DD) */
  sessionDate?: Date;
  /** Type of referral (Letter, Brgy Resolution, etc.) */
  referralType?: ReferralType;
  /** Subject of the referral aligned to referral type */
  trackingSubject?: string;
  /** Committee assigned to handle the document */
  assignedCommittee?: string;
  /** Legislative output/result from tracking */
  legislativeOutput?: string;
  /** User email who updated the document */
  lastUpdatedByEmail?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMinutes {
  id: string;
  documentType: "minutes";
  sessionDate: Date;
  sessionType: SessionType;
  sessionNumber: string;
  presidingOfficer: string;
  preparedBy: string;
  remarks: string;
  notes: string;
  status: DocumentStatus;
  isPublic: boolean;
  pdfUrl: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
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

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SBMember {
  id: string;
  name: string;
  position: string;
  committees: string[];
  imageUrl?: string;
}

export interface Committee {
  id: string;
  name: string;
  members: string[];
}
