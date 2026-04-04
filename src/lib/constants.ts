import type { UserRole } from "./types";

export const DOCUMENT_TYPES = [
  { value: "ordinance", label: "Ordinance" },
  { value: "resolution", label: "Resolution" },
  { value: "minutes", label: "Minutes" },
] as const;

export const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export const SESSION_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "special", label: "Special" },
] as const;

export const REQUEST_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "released", label: "Released" },
  { value: "denied", label: "Denied" },
] as const;

export const DEFAULT_CATEGORIES = [
  "Environment",
  "Infrastructure",
  "Taxes",
  "Fees and Charges",
  "Penal, Criminal and Regulatory",
  "Agriculture",
  "Education",
  "Health",
  "Peace and Order",
  "Sports / Amusement",
  "Tourism",
  "Monetary Aide and other requests",
  "Land Use / Zoning",
  "Municipal Lots",
  "Waterworks",
  "Administrative Matters",
  "History and Heritage",
  "Budget",
  "Loans and other Fiscal Matters",
  "Celebrations",
  "Sisterhood Agreement",
  "Women and Children / PWD / Senior Citizen",
  "Information Technology",
  "MOA / MOU / Usufruct / Contracts & Agreements",
  "Coastal Management",
  "Traffic Matters",
  "NGO / PO Accreditation",
  "Purok System",
  "Risk Reduction",
  "Transportation",
  "Franchise",
] as const;

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "sys_admin", label: "System Administrator" },
  { value: "sb_secretary", label: "SB Secretary" },
  { value: "sb_member", label: "SB Member" },
  { value: "digitization_assistant", label: "Digitization Assistant" },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  sys_admin: "System Administrator",
  sb_secretary: "SB Secretary",
  sb_member: "SB Member",
  digitization_assistant: "Digitization Assistant",
};

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
    roles: ["sys_admin", "sb_secretary", "sb_member", "digitization_assistant"],
  },
  {
    title: "Ordinances",
    href: "/admin/ordinances",
    icon: "ScrollText",
    roles: ["sb_secretary", "sb_member", "digitization_assistant"],
  },
  {
    title: "Resolutions",
    href: "/admin/resolutions",
    icon: "FileText",
    roles: ["sb_secretary", "sb_member", "digitization_assistant"],
  },
  {
    title: "Minutes",
    href: "/admin/minutes",
    icon: "BookOpen",
    roles: ["sb_secretary"],
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: "Tags",
    roles: ["sys_admin", "sb_secretary"],
  },
  {
    title: "Tracking",
    href: "/admin/tracking",
    icon: "GitBranch",
    roles: ["sb_secretary", "sb_member"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "Users",
    roles: ["sys_admin"],
  },
  {
    title: "Recent Activity",
    href: "/admin/recent-activity",
    icon: "Shield",
    roles: ["sys_admin", "sb_secretary"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
    roles: ["sys_admin"],
  },
];

export const PUBLIC_NAV_ITEMS = [
  { title: "Home", href: "/portal" },
  { title: "Ordinances", href: "/ordinances" },
  { title: "Resolutions", href: "/resolutions" },
  { title: "Citizen's Charter", href: "/citizens-charter" },
  { title: "Minutes", href: "/minutes" },
  { title: "CSO", href: "/cso" },
  { title: "Committee Reports", href: "/committee-reports" },
  { title: "SB Chart", href: "/about" },
  { title: "Contacts", href: "/contacts" },
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const ACCEPTED_FILE_TYPES = ["application/pdf"];
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];
