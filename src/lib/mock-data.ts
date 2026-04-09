import type {
  LegislativeDocument,
  OrdinanceKind,
  SessionMinutes,
  User,
  AuditLogEntry,
  DocumentRequest,
  Category,
  SBMember,
  Committee,
  CSOOrganization,
  CommitteeReport,
} from "./types";

// Sample PDFs in public/documents/ for view/download (add files to repo or copy from Downloads)
export const SAMPLE_PDF_SNORKELING =
  "/documents/MUN_ORD_02_2017_SNORKELING_ORDINANCE.pdf";
export const SAMPLE_PDF_TRICYCLE =
  "/documents/MUN_ORD_04_2022_TRICYCLE_TARIFF_AMENDMENT_SIGNED.pdf";
export const SAMPLE_PDF_EUF =
  "/documents/MUN_ORD_12_2014_EUF_AMENDMENT.pdf";

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Environment", isActive: true },
  { id: "cat-2", name: "Infrastructure", isActive: true },
  { id: "cat-3", name: "Taxes", isActive: true },
  { id: "cat-4", name: "Fees and Charges", isActive: true },
  { id: "cat-5", name: "Penal, Criminal and Regulatory", isActive: true },
  { id: "cat-6", name: "Agriculture", isActive: true },
  { id: "cat-7", name: "Education", isActive: true },
  { id: "cat-8", name: "Health", isActive: true },
  { id: "cat-9", name: "Peace and Order", isActive: true },
  { id: "cat-10", name: "Sports / Amusement", isActive: true },
  { id: "cat-11", name: "Tourism", isActive: true },
  { id: "cat-12", name: "Monetary Aide and other requests", isActive: true },
  { id: "cat-13", name: "Land Use / Zoning", isActive: true },
  { id: "cat-14", name: "Municipal Lots", isActive: true },
  { id: "cat-15", name: "Waterworks", isActive: true },
  { id: "cat-16", name: "Administrative Matters", isActive: true },
  { id: "cat-17", name: "History and Heritage", isActive: true },
  { id: "cat-18", name: "Budget", isActive: true },
  { id: "cat-19", name: "Loans and other Fiscal Matters", isActive: true },
  { id: "cat-20", name: "Celebrations", isActive: true },
  { id: "cat-21", name: "Sisterhood Agreement", isActive: true },
  { id: "cat-22", name: "Women and Children / PWD / Senior Citizen", isActive: true },
  { id: "cat-23", name: "Information Technology", isActive: true },
  { id: "cat-24", name: "MOA / MOU / Usufruct / Contracts & Agreements", isActive: true },
  { id: "cat-25", name: "Coastal Management", isActive: true },
  { id: "cat-26", name: "Traffic Matters", isActive: true },
  { id: "cat-27", name: "NGO / PO Accreditation", isActive: true },
  { id: "cat-28", name: "Purok System", isActive: true },
  { id: "cat-29", name: "Risk Reduction", isActive: true },
  { id: "cat-30", name: "Transportation", isActive: true },
  { id: "cat-31", name: "Franchise", isActive: true },
];

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Admin User",
    email: "admin@panglao.gov.ph",
    role: "sys_admin",
    isActive: true,
    lastLogin: new Date("2026-02-17T08:00:00"),
    createdAt: new Date("2024-01-01"),
    moduleAccess: ["ordinances", "resolutions", "minutes", "tracking", "committee_reports", "categories"],
    allowedCategories: [],
    allowedCommittees: [],
  },
  {
    id: "user-2",
    name: "Maria Santos",
    email: "maria.santos@panglao.gov.ph",
    role: "sb_secretary",
    isActive: true,
    lastLogin: new Date("2026-02-18T09:30:00"),
    createdAt: new Date("2024-01-15"),
    moduleAccess: ["ordinances", "resolutions", "minutes", "tracking", "committee_reports", "categories"],
    allowedCategories: [],
    allowedCommittees: [],
  },
  {
    id: "user-3",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@panglao.gov.ph",
    role: "sb_member",
    isActive: true,
    lastLogin: new Date("2026-02-16T14:00:00"),
    createdAt: new Date("2024-02-01"),
    moduleAccess: ["ordinances", "resolutions", "tracking", "committee_reports"],
    allowedCategories: ["Environment", "Tourism", "Infrastructure"],
    allowedCommittees: ["Committee on Environment", "Committee on Tourism and Cultural Heritage"],
  },
  {
    id: "user-4",
    name: "Ana Reyes",
    email: "ana.reyes@panglao.gov.ph",
    role: "digitization_assistant",
    isActive: true,
    lastLogin: new Date("2026-02-18T07:45:00"),
    createdAt: new Date("2024-03-01"),
    moduleAccess: ["ordinances", "resolutions"],
    allowedCategories: ["Taxes", "Fees and Charges", "Budget"],
    allowedCommittees: [],
  },
];

// Sample tracking data for cycling
const _referralTypes: ("letter" | "brgy_resolution" | "brgy_ordinance" | "subd_application" | "accreditation" | "board_council_resolutions" | "memorandum" | "executive_orders" | "draft_resolutions" | "draft_ordinance" | "others")[] = [
  "letter", "brgy_resolution", "draft_ordinance", "memorandum", "executive_orders",
  "brgy_ordinance", "accreditation", "board_council_resolutions", "subd_application", "draft_resolutions", "others",
];
const _trackingStatuses: ("for_referral" | "under_committee" | "for_public_hearing" | "for_committee_report" | "for_signature" | "for_approval" | "for_reporting" | "others")[] = [
  "for_referral", "under_committee", "for_public_hearing", "for_committee_report",
  "for_signature", "for_approval", "for_reporting", "others",
];
const _committees = [
  "Committee of the Whole / En Banc",
  "Committee on Laws, Rules & Internal Affairs",
  "Committee on Finance, Budget and Appropriations",
  "Committee on Education",
  "Committee on Health and Social Services",
  "Committee on Barangay Affairs and Tourism",
  "Committee on Public Works, Infrastructure & Public Utilities",
  "Committee on Peace & Order and Public Safety",
  "Committee on Agriculture, Fisheries, Food and Agrarian Reform",
  "Committee on Human Settlement, Land Use & Development",
  "Committee on Trade, Commerce & Enterprises",
];
const _legislativeOutputs = [
  "Ordinance Passed", "Resolution Approved", "Pending Committee Action", "For Further Study",
  "Endorsed to Mayor", "Returned to Author", "Approved on Third Reading", "Deferred",
  "Adopted", "Filed", "",
];
const _updaterEmails = [
  "maria.santos@panglao.gov.ph",
  "juan.delacruz@panglao.gov.ph",
  "ana.reyes@panglao.gov.ph",
  "admin@panglao.gov.ph",
];

// Helper to build a simple published ordinance
function _ord(
  id: number,
  year: number,
  num: string,
  title: string,
  author: string,
  category: string,
  pdfUrl: string,
  month: number = 3,
  day: number = 15,
  opts?: { status?: "draft" | "approved" | "published" | "archived"; isPublic?: boolean; ordinanceKind?: OrdinanceKind },
): LegislativeDocument {
  const status = opts?.status ?? "published";
  const isPublic = opts?.isPublic ?? true;
  const ordinanceKind = opts?.ordinanceKind ?? "municipal";
  const enacted = new Date(year, month - 1, day);
  const approved = new Date(year, month - 1, day + 5 > 28 ? 28 : day + 5);
  return {
    id: `ord-${id}`,
    documentType: "ordinance",
    ordinanceKind,
    proposedNumber: `${year}-${num}`,
    approvedNumber: status === "draft" ? "" : `${year}-${num}`,
    seriesYear: year,
    title,
    authorSponsor: author,
    category,
    dateEnacted: enacted,
    dateApproved: approved,
    publicationInfo: status === "published" ? `Published in Panglao Gazette, Series of ${year}` : "",
    remarks: "",
    notes: "",
    repealsAmendments: "",
    status,
    isPublic,
    pdfUrl,
    versions: [],
    timeline: [
      { status: "Scanned", date: new Date(year, month - 1, day - 5 > 0 ? day - 5 : 1), performedBy: "Ana Reyes" },
      { status: "Published", date: approved, performedBy: "Maria Santos" },
    ],
    sessionDate: enacted,
    referralType: _referralTypes[id % _referralTypes.length],
    stage: _trackingStatuses[id % _trackingStatuses.length],
    assignedCommittee: _committees[id % _committees.length],
    legislativeOutput: _legislativeOutputs[id % _legislativeOutputs.length],
    lastUpdatedByEmail: _updaterEmails[id % _updaterEmails.length],
    createdBy: "user-2",
    createdAt: enacted,
    updatedAt: new Date(2026, 2 + (id % 2), 1 + (id % 28), 8 + (id % 10), (id * 7) % 60),
  };
}

const _pdfs = [SAMPLE_PDF_SNORKELING, SAMPLE_PDF_TRICYCLE, SAMPLE_PDF_EUF];
const _authors = [
  "Hon. Ricardo Mendoza", "Hon. Elena Villareal", "Hon. Pedro Castillo",
  "Hon. Lourdes Garcia", "Hon. Noel E. Hormachuelos", "Hon. Joseph Jasper A. Arcay",
  "Hon. Felix M. Fudolig", "Hon. Briccio D. Velasco",
];
const _cats = [
  "Tourism", "Environment", "Education", "Health", "Budget",
  "Infrastructure", "Peace and Order", "Taxes", "Fees and Charges",
  "Land Use / Zoning", "Agriculture", "Coastal Management", "Transportation",
  "Women and Children / PWD / Senior Citizen", "Waterworks", "Sports / Amusement",
];

export const mockOrdinances: LegislativeDocument[] = [
  // ── 2025 (5 ordinances) ─────────────────────────────
  _ord(1, 2025, "01", "An Ordinance Regulating the Operation of Tourist Transport Services in the Municipality of Panglao", _authors[0], "Tourism", _pdfs[0], 1, 15),
  _ord(2, 2025, "02", "An Ordinance Imposing Environmental Protection Fees for Visitors Accessing Protected Marine Areas", _authors[1], "Environment", _pdfs[1], 3, 10),
  _ord(3, 2025, "03", "An Ordinance Establishing the Municipal Scholarship Program for Underprivileged Youth", _authors[2], "Education", _pdfs[2], 5, 20, { status: "draft", isPublic: false }),
  _ord(4, 2025, "04", "An Ordinance Regulating the Use of Single-Use Plastics Within the Municipality", _authors[1], "Environment", _pdfs[0], 7, 12),
  _ord(5, 2025, "05", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2026", _authors[0], "Budget", _pdfs[1], 9, 1),

  // ── 2024 (5 ordinances) ─────────────────────────────
  _ord(6, 2024, "01", "An Ordinance Creating the Panglao Municipal Health Emergency Response Team", _authors[3], "Health", _pdfs[2], 2, 15),
  _ord(7, 2024, "02", "An Ordinance Mandating the Establishment of Barangay-Level Disaster Preparedness Committees", _authors[2], "Peace and Order", _pdfs[0], 4, 10),
  _ord(8, 2024, "03", "An Ordinance Providing for the Comprehensive Land Use Plan of the Municipality of Panglao", _authors[0], "Land Use / Zoning", _pdfs[1], 6, 20),
  _ord(9, 2024, "04", "An Ordinance Providing Tax Incentives for Local Businesses Employing Persons with Disabilities", _authors[3], "Women and Children / PWD / Senior Citizen", _pdfs[2], 8, 5),
  _ord(10, 2024, "05", "An Ordinance Establishing the Municipal Road Improvement and Maintenance Program", _authors[2], "Infrastructure", _pdfs[0], 10, 1, { status: "approved", isPublic: false }),

  // ── 2022 (4 ordinances) ─────────────────────────────
  _ord(11, 2022, "01", "An Ordinance Amending the Tricycle Franchising and Regulatory Board Ordinance", _authors[6], "Transportation", _pdfs[1], 1, 20),
  _ord(12, 2022, "02", "An Ordinance Imposing Penalties for Illegal Dumping of Solid Waste in Coastal Areas", _authors[1], "Environment", _pdfs[2], 4, 8),
  _ord(13, 2022, "03", "An Ordinance Establishing a Municipal Tourism Development Fund", _authors[0], "Tourism", _pdfs[0], 7, 15),
  _ord(14, 2022, "04", "An Ordinance Amending Sections of the Tricycle Tariff and Regulatory Ordinance No. 03, Series of 2002", _authors[6], "Fees and Charges", _pdfs[1], 10, 24),

  // ── 2020 (3 ordinances) ─────────────────────────────
  _ord(15, 2020, "01", "An Ordinance Prescribing Health and Safety Protocols for Tourism Establishments During Public Health Emergencies", _authors[3], "Health", _pdfs[2], 3, 25),
  _ord(16, 2020, "02", "An Ordinance Creating the Municipal Disaster Risk Reduction and Management Fund", _authors[2], "Peace and Order", _pdfs[0], 6, 10),
  _ord(17, 2020, "03", "An Ordinance Regulating the Operation of Home-Stay Establishments in the Municipality", _authors[0], "Tourism", _pdfs[1], 9, 5),

  // ── 2017 (3 ordinances) ─────────────────────────────
  _ord(18, 2017, "01", "An Ordinance Regulating the Conduct of Snorkeling Activity Within the Municipal Waters of Panglao", _authors[4], "Coastal Management", _pdfs[0], 1, 30),
  _ord(19, 2017, "02", "An Ordinance Prescribing Fees for the Use of the Municipal Sports Complex", _authors[5], "Sports / Amusement", _pdfs[1], 5, 18),
  _ord(20, 2017, "03", "An Ordinance Imposing Real Property Tax Rates for the Municipality of Panglao", _authors[0], "Taxes", _pdfs[2], 8, 22),

  // ── 2014 (3 ordinances) ─────────────────────────────
  _ord(21, 2014, "01", "An Ordinance Establishing the Revised Environmental Users Fee Activity System for Diving and Snorkeling", _authors[5], "Environment", _pdfs[2], 3, 15),
  _ord(22, 2014, "02", "An Ordinance Providing for the Construction and Maintenance of Barangay Roads", _authors[2], "Infrastructure", _pdfs[0], 6, 20),
  _ord(23, 2014, "03", "An Ordinance Creating the Municipal Agriculture and Fisheries Council", _authors[3], "Agriculture", _pdfs[1], 9, 29),

  // ── 2010 (3 ordinances) ─────────────────────────────
  _ord(24, 2010, "01", "An Ordinance Establishing the Panglao Municipal Waterworks System", _authors[7], "Waterworks", _pdfs[2], 2, 14),
  _ord(25, 2010, "02", "An Ordinance Regulating the Conduct of Business Establishments Within 200 Meters of Public Schools", _authors[2], "Education", _pdfs[0], 5, 10),
  _ord(26, 2010, "03", "An Ordinance Prescribing the Panglao Municipal Revenue Code", _authors[0], "Taxes", _pdfs[1], 10, 25),

  // ── 2005 (3 ordinances) ─────────────────────────────
  _ord(27, 2005, "01", "An Ordinance Establishing the Municipal Zoning and Land Use Plan for 2005–2015", _authors[0], "Land Use / Zoning", _pdfs[2], 1, 20),
  _ord(28, 2005, "02", "An Ordinance Regulating the Transport of Sand and Gravel Within the Municipality", _authors[7], "Environment", _pdfs[0], 4, 18),
  _ord(29, 2005, "03", "An Ordinance Creating the Municipal Peace and Order Council", _authors[2], "Peace and Order", _pdfs[1], 8, 12),

  // ── 2002 (2 ordinances) ─────────────────────────────
  _ord(30, 2002, "01", "An Ordinance Establishing the Panglao Tricycle Franchising and Regulatory Board", _authors[0], "Transportation", _pdfs[0], 3, 15),
  _ord(31, 2002, "02", "An Ordinance Prescribing Environmental Fees for Tourists Visiting Balicasag Island", _authors[1], "Fees and Charges", _pdfs[1], 7, 22),

  // ── 1998 (2 ordinances) ─────────────────────────────
  _ord(32, 1998, "01", "An Ordinance Establishing the Municipal Coastal Resource Management Program", _authors[4], "Coastal Management", _pdfs[2], 2, 20),
  _ord(33, 1998, "02", "An Ordinance Providing for the Operation and Maintenance of the Municipal Public Market", _authors[0], "Fees and Charges", _pdfs[0], 6, 15),

  // ── 1995 (2 ordinances) ─────────────────────────────
  _ord(34, 1995, "01", "An Ordinance Imposing a Municipal Tax on Business Operations Within the Municipality", _authors[7], "Taxes", _pdfs[1], 3, 10),
  _ord(35, 1995, "02", "An Ordinance Creating the Municipal Health Board of Panglao", _authors[3], "Health", _pdfs[2], 9, 5),

  // ── 1990 (2 ordinances) ─────────────────────────────
  _ord(36, 1990, "01", "An Ordinance Regulating the Construction of Buildings and Structures Within the Municipality", _authors[0], "Infrastructure", _pdfs[0], 4, 12),
  _ord(37, 1990, "02", "An Ordinance Establishing the Municipal Cemetery and Prescribing Fees for Burial Services", _authors[7], "Fees and Charges", _pdfs[1], 8, 20),

  // ── 1985 (2 ordinances) ─────────────────────────────
  _ord(38, 1985, "01", "An Ordinance Establishing the Panglao Public Elementary School System and Maintenance Fund", _authors[2], "Education", _pdfs[2], 3, 18),
  _ord(39, 1985, "02", "An Ordinance Regulating the Cutting of Timber and Trees Within the Municipality", _authors[1], "Environment", _pdfs[0], 7, 10),

  // ── 1980 (2 ordinances) ─────────────────────────────
  _ord(40, 1980, "01", "An Ordinance Establishing the Panglao Municipal Fire Brigade", _authors[2], "Peace and Order", _pdfs[1], 2, 25),
  _ord(41, 1980, "02", "An Ordinance Prescribing Fees for the Use of Municipal Wharf and Port Facilities", _authors[0], "Fees and Charges", _pdfs[2], 6, 15),

  // ── 1975 (2 ordinances) ─────────────────────────────
  _ord(42, 1975, "01", "An Ordinance Establishing the Municipal Water Supply System of Panglao", _authors[7], "Waterworks", _pdfs[0], 1, 20),
  _ord(43, 1975, "02", "An Ordinance Regulating the Slaughter and Sale of Livestock Within the Municipality", _authors[3], "Agriculture", _pdfs[1], 5, 15),

  // ── 1970 (2 ordinances) ─────────────────────────────
  _ord(44, 1970, "01", "An Ordinance Providing for the Establishment of the Municipal Public Library", _authors[2], "Education", _pdfs[2], 3, 10),
  _ord(45, 1970, "02", "An Ordinance Regulating the Extraction of Coral and Sand From the Municipal Shoreline", _authors[1], "Environment", _pdfs[0], 8, 20),

  // ── 1960 (2 ordinances) ─────────────────────────────
  _ord(46, 1960, "01", "An Ordinance Establishing the Municipal Roads and Bridges Maintenance Fund", _authors[0], "Infrastructure", _pdfs[1], 4, 5),
  _ord(47, 1960, "02", "An Ordinance Prescribing Market Fees and Charges for the Panglao Public Market", _authors[7], "Fees and Charges", _pdfs[2], 9, 18),

  // ── 1950 (2 ordinances) ─────────────────────────────
  _ord(48, 1950, "01", "An Ordinance Establishing the Municipal Police Force of Panglao", _authors[2], "Peace and Order", _pdfs[0], 2, 15),
  _ord(49, 1950, "02", "An Ordinance Regulating the Operation of Fishing Vessels Within Municipal Waters", _authors[4], "Coastal Management", _pdfs[1], 7, 20),

  // ── 1940 (2 ordinances) ─────────────────────────────
  _ord(50, 1940, "01", "An Ordinance Providing for the Establishment of the Municipal Rural Health Unit", _authors[3], "Health", _pdfs[2], 3, 12),
  _ord(51, 1940, "02", "An Ordinance Prescribing Regulations for the Municipal Cockpit and Amusement Tax", _authors[0], "Sports / Amusement", _pdfs[0], 8, 5),

  // ── 1930 (2 ordinances) ─────────────────────────────
  _ord(52, 1930, "01", "An Ordinance Establishing the Panglao Municipal Elementary School", _authors[2], "Education", _pdfs[1], 1, 25),
  _ord(53, 1930, "02", "An Ordinance Regulating the Use of Public Plazas and Parks Within the Municipality", _authors[7], "Infrastructure", _pdfs[2], 6, 18),

  // ── 1920 (2 ordinances) ─────────────────────────────
  _ord(54, 1920, "01", "An Ordinance Imposing a Cedula Tax Upon All Male Residents of the Municipality of Panglao", _authors[0], "Taxes", _pdfs[0], 2, 10),
  _ord(55, 1920, "02", "An Ordinance Prescribing Regulations for the Municipal Jail and Detention Facilities", _authors[2], "Peace and Order", _pdfs[1], 7, 15),

  // ── 1910 (2 ordinances) ─────────────────────────────
  _ord(56, 1910, "01", "An Ordinance Establishing the Panglao Municipal Council Under the Philippine Commission Act", _authors[0], "Administrative Matters", _pdfs[2], 3, 20),
  _ord(57, 1910, "02", "An Ordinance Regulating the Conduct of Public Markets and Trade Within the Municipality", _authors[7], "Fees and Charges", _pdfs[0], 9, 10),

  // ── 1900 (2 ordinances) ─────────────────────────────
  _ord(58, 1900, "01", "An Ordinance Providing for the Establishment of Public Roads Connecting the Barrios of Panglao", _authors[0], "Infrastructure", _pdfs[1], 4, 15),
  _ord(59, 1900, "02", "An Ordinance Prescribing the Duties and Responsibilities of the Cabeza de Barangay", _authors[7], "Administrative Matters", _pdfs[2], 10, 8),

  // ── 1895 (1 ordinance) ──────────────────────────────
  _ord(60, 1895, "01", "An Ordinance Establishing the Municipal Tribunal and Prescribing Rules for the Administration of Local Justice", _authors[0], "Peace and Order", _pdfs[0], 5, 12),

  // ── Appropriation Ordinances (Budget) ───────────────
  _ord(61, 2025, "06", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2025", _authors[0], "Budget", _pdfs[1], 1, 10, { ordinanceKind: "appropriation" }),
  _ord(62, 2024, "06", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2024", _authors[0], "Budget", _pdfs[2], 1, 12, { ordinanceKind: "appropriation" }),
  _ord(63, 2023, "01", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2023", _authors[3], "Budget", _pdfs[0], 1, 8, { ordinanceKind: "appropriation" }),
  _ord(64, 2022, "05", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2022", _authors[3], "Budget", _pdfs[1], 1, 14, { ordinanceKind: "appropriation" }),
  _ord(65, 2021, "01", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2021", _authors[0], "Budget", _pdfs[2], 1, 11, { ordinanceKind: "appropriation" }),
  _ord(66, 2020, "04", "An Ordinance Approving the Supplemental Budget No. 1 of the Municipality of Panglao for Fiscal Year 2020", _authors[3], "Budget", _pdfs[0], 6, 20, { ordinanceKind: "appropriation" }),
  _ord(67, 2019, "01", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2019", _authors[0], "Budget", _pdfs[1], 1, 9, { ordinanceKind: "appropriation" }),
  _ord(68, 2018, "01", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2018", _authors[3], "Budget", _pdfs[2], 1, 15, { ordinanceKind: "appropriation" }),
  _ord(69, 2017, "04", "An Ordinance Approving the Supplemental Budget No. 2 of the Municipality of Panglao for Fiscal Year 2017", _authors[0], "Budget", _pdfs[0], 8, 10, { ordinanceKind: "appropriation" }),
  _ord(70, 2016, "01", "An Ordinance Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 2016", _authors[3], "Budget", _pdfs[1], 1, 13, { ordinanceKind: "appropriation" }),
];

// Helper to build a simple resolution
function _res(
  id: number,
  year: number,
  num: string,
  title: string,
  author: string,
  category: string,
  pdfUrl: string,
  month: number = 3,
  day: number = 15,
  opts?: { status?: "draft" | "approved" | "published" | "archived"; isPublic?: boolean },
): LegislativeDocument {
  const status = opts?.status ?? "published";
  const isPublic = opts?.isPublic ?? true;
  const enacted = new Date(year, month - 1, day);
  const approved = new Date(year, month - 1, day + 5 > 28 ? 28 : day + 5);
  return {
    id: `res-${id}`,
    documentType: "resolution",
    proposedNumber: `${year}-${num}`,
    approvedNumber: status === "draft" ? "" : `${year}-${num}`,
    seriesYear: year,
    title,
    authorSponsor: author,
    category,
    dateEnacted: enacted,
    dateApproved: approved,
    publicationInfo: status === "published" ? `Published in Panglao Gazette, Series of ${year}` : "",
    remarks: "",
    notes: "",
    repealsAmendments: "",
    status,
    isPublic,
    pdfUrl,
    versions: [],
    timeline: [
      { status: "Scanned", date: new Date(year, month - 1, day - 5 > 0 ? day - 5 : 1), performedBy: "Ana Reyes" },
      { status: "Published", date: approved, performedBy: "Maria Santos" },
    ],
    sessionDate: enacted,
    referralType: _referralTypes[(id + 3) % _referralTypes.length],
    stage: _trackingStatuses[(id + 2) % _trackingStatuses.length],
    assignedCommittee: _committees[(id + 5) % _committees.length],
    legislativeOutput: _legislativeOutputs[(id + 4) % _legislativeOutputs.length],
    lastUpdatedByEmail: _updaterEmails[(id + 1) % _updaterEmails.length],
    createdBy: "user-2",
    createdAt: enacted,
    updatedAt: new Date(2026, 1 + (id % 3), 2 + (id % 26), 9 + (id % 9), (id * 11) % 60),
  };
}

export const mockResolutions: LegislativeDocument[] = [
  // ── 2025 (8 resolutions) ────────────────────────────
  _res(1, 2025, "01", "A Resolution Expressing Support for the National Government's Eco-Tourism Development Program", _authors[1], "Tourism", _pdfs[1], 1, 10),
  _res(2, 2025, "02", "A Resolution Requesting the DPWH to Expedite the Construction of the Panglao Bypass Road", _authors[2], "Infrastructure", _pdfs[0], 1, 20),
  _res(3, 2025, "03", "A Resolution Commending the Panglao National High School for Winning the Regional Science Competition", _authors[3], "Education", _pdfs[0], 2, 1, { status: "draft", isPublic: false }),
  _res(4, 2025, "04", "A Resolution Adopting the Municipal Disaster Risk Reduction and Management Plan for 2025-2030", _authors[2], "Peace and Order", _pdfs[0], 3, 5),
  _res(5, 2025, "05", "A Resolution Authorizing the Municipal Mayor to Enter into a Memorandum of Agreement with the Department of Health", _authors[3], "Health", _pdfs[0], 4, 10),
  _res(6, 2025, "06", "A Resolution Endorsing the Creation of Marine Protected Areas Along the Panglao Coastline", _authors[1], "Environment", _pdfs[0], 5, 20),
  _res(7, 2025, "07", "A Resolution Urging the Provincial Government to Increase Funding for Coastal Resource Management", _authors[0], "Coastal Management", _pdfs[2], 7, 15),
  _res(8, 2025, "08", "A Resolution Allocating Funds for the Senior Citizens Welfare Program of the Municipality", _authors[3], "Women and Children / PWD / Senior Citizen", _pdfs[0], 9, 10),

  // ── 2024 (8 resolutions) ────────────────────────────
  _res(9, 2024, "01", "A Resolution Approving the Annual Investment Plan of the Municipality of Panglao for Fiscal Year 2024", _authors[0], "Budget", _pdfs[1], 1, 12),
  _res(10, 2024, "02", "A Resolution Declaring the Month of June as Environmental Awareness Month in the Municipality", _authors[1], "Environment", _pdfs[2], 2, 18),
  _res(11, 2024, "03", "A Resolution Requesting the Department of Education to Establish an Additional Public High School in Barangay Tawala", _authors[3], "Education", _pdfs[0], 3, 5),
  _res(12, 2024, "04", "A Resolution Confirming the Appointment of Members to the Municipal Tourism Council", _authors[0], "Tourism", _pdfs[1], 4, 22),
  _res(13, 2024, "05", "A Resolution Condemning Illegal Fishing Activities Within the Municipal Waters of Panglao", _authors[1], "Coastal Management", _pdfs[2], 6, 8),
  _res(14, 2024, "06", "A Resolution Authorizing the Municipal Mayor to Negotiate a Loan for the Water Supply Improvement Project", _authors[0], "Waterworks", _pdfs[0], 7, 15),
  _res(15, 2024, "07", "A Resolution Endorsing the Application of Panglao for the ASEAN Clean Tourist City Standard Award", _authors[1], "Tourism", _pdfs[1], 9, 3),
  _res(16, 2024, "08", "A Resolution Expressing Gratitude to the Japan International Cooperation Agency for the Technical Assistance on Waste Management", _authors[2], "Environment", _pdfs[2], 11, 20),

  // ── 2023 (8 resolutions) ────────────────────────────
  _res(17, 2023, "01", "A Resolution Adopting the Comprehensive Development Plan of the Municipality of Panglao for 2023-2028", _authors[0], "Administrative Matters", _pdfs[0], 1, 15),
  _res(18, 2023, "02", "A Resolution Requesting the National Government for Financial Assistance for Post-Typhoon Rehabilitation", _authors[2], "Risk Reduction", _pdfs[1], 2, 20),
  _res(19, 2023, "03", "A Resolution Supporting the Establishment of a Municipal Drug Abuse Prevention and Treatment Center", _authors[3], "Health", _pdfs[2], 3, 10),
  _res(20, 2023, "04", "A Resolution Commending the Panglao Philippine National Police for Exemplary Performance in Crime Prevention", _authors[2], "Peace and Order", _pdfs[0], 5, 5),
  _res(21, 2023, "05", "A Resolution Authorizing the Acceptance of Donated Vehicles for the Municipal Health Office", _authors[3], "Health", _pdfs[1], 7, 18),
  _res(22, 2023, "06", "A Resolution Declaring November 15 of Every Year as Panglao Coastal Cleanup Day", _authors[1], "Coastal Management", _pdfs[2], 8, 22),
  _res(23, 2023, "07", "A Resolution Approving the Reclassification of Agricultural Land in Barangay Danao for Residential Purposes", _authors[0], "Land Use / Zoning", _pdfs[0], 10, 12),
  _res(24, 2023, "08", "A Resolution Endorsing the Nomination of Panglao Island as a UNESCO World Heritage Tentative List Site", _authors[1], "Tourism", _pdfs[1], 11, 25),

  // ── 2022 (7 resolutions) ────────────────────────────
  _res(25, 2022, "01", "A Resolution Ratifying the Sisterhood Agreement Between the Municipality of Panglao and Taketa City, Japan", _authors[0], "Sisterhood Agreement", _pdfs[2], 1, 20),
  _res(26, 2022, "02", "A Resolution Urging the Department of Transportation to Include Panglao in the National Railway Extension Plan", _authors[2], "Transportation", _pdfs[0], 3, 8),
  _res(27, 2022, "03", "A Resolution Appropriating Funds for the Construction of a Municipal Sports Complex", _authors[5], "Sports / Amusement", _pdfs[1], 4, 15),
  _res(28, 2022, "04", "A Resolution Declaring Certain Portions of Barangay Bolod as a Tourism Enterprise Zone", _authors[1], "Tourism", _pdfs[2], 6, 20),
  _res(29, 2022, "05", "A Resolution Adopting a Gender and Development Code for the Municipality of Panglao", _authors[3], "Women and Children / PWD / Senior Citizen", _pdfs[0], 8, 10),
  _res(30, 2022, "06", "A Resolution Expressing Concern Over the Destruction of Mangrove Forests in Barangay Lourdes", _authors[1], "Environment", _pdfs[1], 10, 5),
  _res(31, 2022, "07", "A Resolution Approving the Municipal Solid Waste Management Plan for 2022-2032", _authors[2], "Environment", _pdfs[2], 11, 18),

  // ── 2021 (7 resolutions) ────────────────────────────
  _res(32, 2021, "01", "A Resolution Endorsing the Expansion of the Panglao Municipal Waterworks System to Upland Barangays", _authors[0], "Waterworks", _pdfs[0], 1, 25),
  _res(33, 2021, "02", "A Resolution Authorizing the Municipal Mayor to Enter into a Contract with the Bohol Electric Cooperative for Street Lighting", _authors[2], "Infrastructure", _pdfs[1], 3, 12),
  _res(34, 2021, "03", "A Resolution Requesting the Bureau of Fisheries to Conduct a Marine Biodiversity Assessment in Panglao Waters", _authors[1], "Coastal Management", _pdfs[2], 4, 20),
  _res(35, 2021, "04", "A Resolution Commending Frontline Workers for Their Service During the COVID-19 Pandemic", _authors[3], "Health", _pdfs[0], 6, 15),
  _res(36, 2021, "05", "A Resolution Adopting the Panglao Island Tourism Master Plan for 2021-2030", _authors[1], "Tourism", _pdfs[1], 8, 8),
  _res(37, 2021, "06", "A Resolution Approving the Creation of Additional Barangay Nutrition Scholars Positions", _authors[3], "Health", _pdfs[2], 10, 10),
  _res(38, 2021, "07", "A Resolution Urging the National Housing Authority to Prioritize Panglao in the Socialized Housing Program", _authors[2], "Infrastructure", _pdfs[0], 11, 22),

  // ── 2020 (6 resolutions) ────────────────────────────
  _res(39, 2020, "01", "A Resolution Declaring a State of Public Health Emergency in the Municipality of Panglao Due to COVID-19", _authors[0], "Health", _pdfs[1], 3, 15),
  _res(40, 2020, "02", "A Resolution Appropriating Emergency Funds for the Purchase of Personal Protective Equipment and Medical Supplies", _authors[0], "Health", _pdfs[2], 3, 25),
  _res(41, 2020, "03", "A Resolution Authorizing the Use of Municipal Facilities as Quarantine Centers", _authors[2], "Health", _pdfs[0], 4, 5),
  _res(42, 2020, "04", "A Resolution Supporting the Mass Testing Program for COVID-19 in the Municipality", _authors[3], "Health", _pdfs[1], 5, 18),
  _res(43, 2020, "05", "A Resolution Providing Financial Assistance to Displaced Tourism Workers Due to the Pandemic", _authors[1], "Tourism", _pdfs[2], 7, 10),
  _res(44, 2020, "06", "A Resolution Adopting a Recovery Plan for the Tourism Industry of Panglao Post-COVID-19", _authors[1], "Tourism", _pdfs[0], 10, 20),

  // ── 2019 (6 resolutions) ────────────────────────────
  _res(45, 2019, "01", "A Resolution Confirming the Appointment of the Municipal Administrator of Panglao", _authors[0], "Administrative Matters", _pdfs[1], 1, 10),
  _res(46, 2019, "02", "A Resolution Approving the Supplemental Budget No. 1 of the Municipality for Fiscal Year 2019", _authors[0], "Budget", _pdfs[2], 3, 20),
  _res(47, 2019, "03", "A Resolution Endorsing the Candidacy of Panglao for the Most Competitive Municipality in the Visayas", _authors[1], "Administrative Matters", _pdfs[0], 5, 15),
  _res(48, 2019, "04", "A Resolution Requesting the DENR to Conduct an Environmental Impact Assessment for the Proposed Reclamation Project", _authors[1], "Environment", _pdfs[1], 7, 8),
  _res(49, 2019, "05", "A Resolution Granting a Franchise to Panglao Island Water District for Water Distribution Services", _authors[0], "Franchise", _pdfs[2], 9, 12),
  _res(50, 2019, "06", "A Resolution Commending the Philippine Coast Guard for Successful Maritime Safety Operations in Panglao", _authors[2], "Peace and Order", _pdfs[0], 11, 5),

  // ── 2018 (5 resolutions) ────────────────────────────
  _res(51, 2018, "01", "A Resolution Approving the Annual Investment Plan for Fiscal Year 2018", _authors[0], "Budget", _pdfs[1], 1, 15),
  _res(52, 2018, "02", "A Resolution Authorizing the Municipal Mayor to Negotiate the Acquisition of Land for a New Public Cemetery", _authors[2], "Municipal Lots", _pdfs[2], 3, 8),
  _res(53, 2018, "03", "A Resolution Adopting the Revised Revenue Code of the Municipality of Panglao", _authors[0], "Taxes", _pdfs[0], 5, 22),
  _res(54, 2018, "04", "A Resolution Expressing Support for the National Anti-Illegal Drug Campaign in the Municipality", _authors[2], "Peace and Order", _pdfs[1], 8, 10),
  _res(55, 2018, "05", "A Resolution Endorsing the Establishment of a Panglao Island Cultural Heritage Museum", _authors[1], "History and Heritage", _pdfs[2], 10, 18),

  // ── 2017 (5 resolutions) ────────────────────────────
  _res(56, 2017, "01", "A Resolution Approving the Memorandum of Understanding Between the Municipality and the Bohol Tourism Office", _authors[4], "Tourism", _pdfs[0], 2, 10),
  _res(57, 2017, "02", "A Resolution Requesting the Provincial Government to Repair the Panglao-Tagbilaran Bridge", _authors[5], "Infrastructure", _pdfs[1], 4, 15),
  _res(58, 2017, "03", "A Resolution Adopting the Barangay Purok System as the Basic Unit of Community Organization", _authors[4], "Purok System", _pdfs[2], 6, 20),
  _res(59, 2017, "04", "A Resolution Confirming the Accreditation of Civil Society Organizations Operating Within the Municipality", _authors[5], "NGO / PO Accreditation", _pdfs[0], 9, 5),
  _res(60, 2017, "05", "A Resolution Authorizing the Acceptance of a Donation of Computers from the Department of Information and Communications Technology", _authors[4], "Information Technology", _pdfs[1], 11, 12),

  // ── 2015 (5 resolutions) ────────────────────────────
  _res(61, 2015, "01", "A Resolution Adopting the Municipal Fisheries Ordinance and Coastal Resource Management Framework", _authors[0], "Coastal Management", _pdfs[2], 1, 20),
  _res(62, 2015, "02", "A Resolution Expressing Gratitude to the Korean Government for the Grant of School Building Construction", _authors[3], "Education", _pdfs[0], 3, 15),
  _res(63, 2015, "03", "A Resolution Requesting the Department of Agriculture to Provide Farm Equipment to Local Farmers", _authors[3], "Agriculture", _pdfs[1], 6, 10),
  _res(64, 2015, "04", "A Resolution Approving the Establishment of a Satellite Market in Barangay Bil-isan", _authors[0], "Fees and Charges", _pdfs[2], 8, 22),
  _res(65, 2015, "05", "A Resolution Supporting the National Government's Conditional Cash Transfer Program for Indigent Families", _authors[3], "Women and Children / PWD / Senior Citizen", _pdfs[0], 10, 5),

  // ── 2012 (5 resolutions) ────────────────────────────
  _res(66, 2012, "01", "A Resolution Endorsing the Municipal Development Plan for 2012-2017", _authors[0], "Administrative Matters", _pdfs[1], 1, 12),
  _res(67, 2012, "02", "A Resolution Authorizing the Municipal Mayor to Contract a Loan for Road Improvement Projects", _authors[2], "Loans and other Fiscal Matters", _pdfs[2], 3, 18),
  _res(68, 2012, "03", "A Resolution Declaring September as Disaster Preparedness Month in the Municipality", _authors[2], "Risk Reduction", _pdfs[0], 5, 8),
  _res(69, 2012, "04", "A Resolution Approving the Revised Schedule of Fees for the Use of Public Facilities", _authors[0], "Fees and Charges", _pdfs[1], 8, 20),
  _res(70, 2012, "05", "A Resolution Commending the Panglao Volunteer Fire Brigade for Outstanding Community Service", _authors[2], "Peace and Order", _pdfs[2], 11, 10),

  // ── 2010 (4 resolutions) ────────────────────────────
  _res(71, 2010, "01", "A Resolution Adopting the Municipal Ecological Solid Waste Management Plan of Panglao", _authors[7], "Environment", _pdfs[0], 2, 15),
  _res(72, 2010, "02", "A Resolution Supporting the Proclamation of Panglao as a First-Class Municipality", _authors[0], "Administrative Matters", _pdfs[1], 4, 20),
  _res(73, 2010, "03", "A Resolution Approving the Usufruct Agreement for the Use of Municipal Lots by the Philippine National Police", _authors[7], "MOA / MOU / Usufruct / Contracts & Agreements", _pdfs[2], 7, 10),
  _res(74, 2010, "04", "A Resolution Requesting the Philippine Ports Authority to Upgrade the Panglao Port Facilities", _authors[0], "Transportation", _pdfs[0], 10, 5),

  // ── 2008 (4 resolutions) ────────────────────────────
  _res(75, 2008, "01", "A Resolution Endorsing the Establishment of the Environmental Users Fee System for Diving and Snorkeling", _authors[5], "Environment", _pdfs[1], 1, 22),
  _res(76, 2008, "02", "A Resolution Ratifying the Memorandum of Agreement with the Provincial Tourism Office for Event Hosting", _authors[5], "Tourism", _pdfs[2], 4, 15),
  _res(77, 2008, "03", "A Resolution Approving the Schedule of Market Stall Rentals for the Panglao Public Market", _authors[7], "Fees and Charges", _pdfs[0], 7, 8),
  _res(78, 2008, "04", "A Resolution Confirming the Reorganization of the Municipal Peace and Order Council", _authors[7], "Peace and Order", _pdfs[1], 10, 18),

  // ── 2005 (4 resolutions) ────────────────────────────
  _res(79, 2005, "01", "A Resolution Approving the Municipal Land Use Plan of Panglao for 2005-2015", _authors[0], "Land Use / Zoning", _pdfs[2], 2, 10),
  _res(80, 2005, "02", "A Resolution Authorizing the Municipal Mayor to Execute a Contract for the Construction of the New Municipal Hall", _authors[0], "Infrastructure", _pdfs[0], 5, 18),
  _res(81, 2005, "03", "A Resolution Granting Tax Incentives to Investors in the Panglao Tourism Enterprise Zone", _authors[7], "Taxes", _pdfs[1], 8, 12),
  _res(82, 2005, "04", "A Resolution Endorsing the Application of Cooperative Banks for Operation in the Municipality", _authors[7], "Loans and other Fiscal Matters", _pdfs[2], 11, 5),

  // ── 2000 (3 resolutions) ────────────────────────────
  _res(83, 2000, "01", "A Resolution Approving the Revised Zoning Ordinance of the Municipality of Panglao", _authors[0], "Land Use / Zoning", _pdfs[0], 2, 20),
  _res(84, 2000, "02", "A Resolution Confirming the Establishment of the Municipal Scholarship Fund for Deserving Students", _authors[2], "Education", _pdfs[1], 6, 15),
  _res(85, 2000, "03", "A Resolution Supporting the National Reforestation Program in the Municipality of Panglao", _authors[7], "Environment", _pdfs[2], 10, 8),

  // ── 1995 (3 resolutions) ────────────────────────────
  _res(86, 1995, "01", "A Resolution Endorsing the Construction of the Panglao-Dauis Causeway Improvement Project", _authors[7], "Infrastructure", _pdfs[0], 1, 15),
  _res(87, 1995, "02", "A Resolution Approving the Annual Budget of the Municipality of Panglao for Fiscal Year 1995", _authors[0], "Budget", _pdfs[1], 4, 12),
  _res(88, 1995, "03", "A Resolution Expressing Support for the Implementation of the Local Government Code of 1991", _authors[7], "Administrative Matters", _pdfs[2], 8, 20),

  // ── 1990 (3 resolutions) ────────────────────────────
  _res(89, 1990, "01", "A Resolution Requesting the Provincial Government to Extend the Provincial Road to Barangay Doljo", _authors[0], "Infrastructure", _pdfs[0], 2, 10),
  _res(90, 1990, "02", "A Resolution Approving the Establishment of a Rural Health Unit in Barangay Libaong", _authors[7], "Health", _pdfs[1], 5, 18),
  _res(91, 1990, "03", "A Resolution Confirming the Appointment of the Municipal Treasurer of Panglao", _authors[0], "Administrative Matters", _pdfs[2], 9, 5),

  // ── 1980 (2 resolutions) ────────────────────────────
  _res(92, 1980, "01", "A Resolution Requesting the National Government to Establish a Telegraph Office in the Municipality of Panglao", _authors[2], "Information Technology", _pdfs[0], 3, 15),
  _res(93, 1980, "02", "A Resolution Approving the Donation of a Lot for the Construction of a Barangay Hall in Poblacion", _authors[0], "Municipal Lots", _pdfs[1], 8, 20),

  // ── 1960 (2 resolutions) ────────────────────────────
  _res(94, 1960, "01", "A Resolution Endorsing the Application for Electrification of the Municipality of Panglao Under the Rural Electrification Program", _authors[0], "Infrastructure", _pdfs[2], 4, 10),
  _res(95, 1960, "02", "A Resolution Approving the Construction of a New Municipal Public Market", _authors[7], "Fees and Charges", _pdfs[0], 9, 22),

  // ── 1940 (2 resolutions) ────────────────────────────
  _res(96, 1940, "01", "A Resolution Requesting the Provincial Board to Improve the Road Connecting Panglao to Tagbilaran", _authors[0], "Infrastructure", _pdfs[1], 3, 12),
  _res(97, 1940, "02", "A Resolution Approving the Establishment of a Public Cemetery in Barangay Poblacion", _authors[7], "Municipal Lots", _pdfs[2], 7, 18),

  // ── 1920 (2 resolutions) ────────────────────────────
  _res(98, 1920, "01", "A Resolution Petitioning the Provincial Government for the Establishment of a Primary School in Every Barrio of Panglao", _authors[0], "Education", _pdfs[0], 2, 15),
  _res(99, 1920, "02", "A Resolution Approving the Rules and Regulations for the Operation of the Municipal Ferry Service", _authors[7], "Transportation", _pdfs[1], 8, 10),

  // ── 1895 (1 resolution) ─────────────────────────────
  _res(100, 1895, "01", "A Resolution Establishing the Rules of Procedure for the Sangguniang Bayan of the Municipality of Panglao", _authors[0], "Administrative Matters", _pdfs[2], 5, 20),
];

// Helper to build session minutes
let _minCounter = 0;
function _min(
  year: number,
  month: number,
  day: number,
  sessionType: "regular" | "special" = "regular",
  opts?: { status?: "draft" | "approved" | "published"; isPublic?: boolean },
): SessionMinutes {
  _minCounter++;
  const st = opts?.status ?? "published";
  const pub = opts?.isPublic ?? (st === "published");
  return {
    id: `min-${_minCounter}`,
    documentType: "minutes",
    sessionDate: new Date(year, month - 1, day),
    sessionType,
    status: st,
    isPublic: pub,
    pdfUrl: _pdfs[_minCounter % 3],
    createdBy: "user-2",
    createdAt: new Date(year, month - 1, Math.min(day + 1, 28)),
    updatedAt: new Date(year, month - 1, Math.min(day + 3, 28)),
  };
}

/** Generate 12 sessions (one per month) for a given year */
function _yearMinutes(
  year: number,
  opts?: { draftMonths?: number[]; approvedMonths?: number[] },
): SessionMinutes[] {
  const days = [14, 11, 11, 8, 13, 10, 8, 12, 9, 14, 11, 9];
  return days.map((day, i) => {
    const month = i + 1;
    const isDraft = opts?.draftMonths?.includes(month);
    const isApproved = opts?.approvedMonths?.includes(month);
    const status: "draft" | "approved" | "published" = isDraft ? "draft" : isApproved ? "approved" : "published";
    return _min(
      year, month, day,
      month === 6 || month === 11 ? "special" : "regular",
      { status, isPublic: status === "published" },
    );
  });
}

export const mockMinutes: SessionMinutes[] = [
  // 2025 — recent year: last 2 months draft, October approved
  ..._yearMinutes(2025, { draftMonths: [11, 12], approvedMonths: [10] }),
  // 2024–1895: all published
  ...[
    2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2012, 2010, 2008, 2005, 2000, 1995, 1990, 1980, 1970,
    1960, 1940, 1920, 1895,
  ].flatMap((y) => _yearMinutes(y)),
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date("2026-02-18T09:30:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "login",
    details: "User logged in",
  },
  {
    id: "log-2",
    timestamp: new Date("2026-02-18T09:35:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "upload",
    documentId: "ord-10",
    documentTitle: "Ordinance 2026-04 - Road Improvement",
    details: "Uploaded new ordinance document",
  },
  {
    id: "log-3",
    timestamp: new Date("2026-02-17T14:20:00"),
    userId: "user-4",
    userName: "Ana Reyes",
    action: "upload",
    documentId: "ord-3",
    documentTitle: "Ordinance 2026-03 - Scholarship Program",
    details: "Scanned and uploaded document",
  },
  {
    id: "log-4",
    timestamp: new Date("2026-02-17T11:00:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "publish",
    documentId: "ord-2",
    documentTitle: "Ordinance 2026-02 - Environmental Protection Fees",
    details: "Published ordinance to public portal",
  },
  {
    id: "log-5",
    timestamp: new Date("2026-02-16T16:45:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "edit",
    documentId: "res-7",
    documentTitle: "Resolution 2026-04 - Tourism Month",
    details: "Updated metadata and remarks",
  },
  {
    id: "log-6",
    timestamp: new Date("2026-02-16T14:00:00"),
    userId: "user-3",
    userName: "Juan Dela Cruz",
    action: "login",
    details: "User logged in",
  },
  {
    id: "log-7",
    timestamp: new Date("2026-02-15T10:30:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "upload",
    documentId: "min-5",
    documentTitle: "Minutes - Feb 17 Regular Session",
    details: "Uploaded session minutes",
  },
  {
    id: "log-8",
    timestamp: new Date("2026-02-14T09:00:00"),
    userId: "user-1",
    userName: "Admin User",
    action: "login",
    details: "User logged in",
  },
  {
    id: "log-9",
    timestamp: new Date("2026-02-13T15:20:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "edit",
    documentId: "min-4",
    documentTitle: "Minutes - Feb 10 Regular Session",
    details: "Updated session minutes status to approved",
  },
  {
    id: "log-10",
    timestamp: new Date("2026-02-12T10:15:00"),
    userId: "user-4",
    userName: "Ana Reyes",
    action: "upload",
    documentId: "res-3",
    documentTitle: "Resolution 2026-03 - Science Competition",
    details: "Scanned and uploaded document",
  },
  {
    id: "log-11",
    timestamp: new Date("2026-02-11T08:30:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "publish",
    documentId: "res-2",
    documentTitle: "Resolution 2026-02 - Bypass Road",
    details: "Published resolution to public portal",
  },
  {
    id: "log-12",
    timestamp: new Date("2026-02-10T14:00:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "upload",
    documentId: "min-4",
    documentTitle: "Minutes - Feb 10 Regular Session",
    details: "Uploaded session minutes",
  },
  {
    id: "log-13",
    timestamp: new Date("2026-02-09T11:30:00"),
    userId: "user-1",
    userName: "Admin User",
    action: "edit",
    details: "Updated system settings - backup schedule",
  },
  {
    id: "log-14",
    timestamp: new Date("2026-02-08T09:00:00"),
    userId: "user-4",
    userName: "Ana Reyes",
    action: "login",
    details: "User logged in",
  },
  {
    id: "log-15",
    timestamp: new Date("2026-02-07T16:00:00"),
    userId: "user-2",
    userName: "Maria Santos",
    action: "logout",
    details: "User logged out",
  },
];

export const mockRequests: DocumentRequest[] = [
  {
    id: "req-1",
    requestor: "Brgy. Captain Jose Dela Cruz",
    documentId: "ord-5",
    documentTitle: "Ordinance 2025-12 - Annual Budget FY 2026",
    dateRequested: new Date("2026-02-10"),
    dateReleased: new Date("2026-02-12"),
    status: "released",
    processedBy: "Maria Santos",
  },
  {
    id: "req-2",
    requestor: "Ms. Patricia Lim - Tourism Office",
    documentId: "ord-1",
    documentTitle: "Ordinance 2026-01 - Tourist Transport",
    dateRequested: new Date("2026-02-14"),
    status: "submitted",
    processedBy: "Maria Santos",
  },
  {
    id: "req-3",
    requestor: "Atty. Roberto Gonzales",
    documentId: "ord-8",
    documentTitle: "Ordinance 2024-20 - Comprehensive Land Use Plan",
    dateRequested: new Date("2026-02-15"),
    dateReleased: new Date("2026-02-16"),
    status: "released",
    processedBy: "Maria Santos",
  },
  {
    id: "req-4",
    requestor: "Ms. Liza Tan - Barangay Alona",
    documentId: "res-2",
    documentTitle: "Resolution 2026-02 - Bypass Road",
    dateRequested: new Date("2026-02-18"),
    status: "approved",
    processedBy: "Maria Santos",
  },
];

const SB_MEMBER_IMAGE = "/images/sb-member-placeholder.png";

const formatCommitteePersonName = (name: string) =>
  name === "Daisy M. Delambaca"
    ? "Vice Mayor Daisy M. Delambaca"
    : `Hon. ${name}`;

export const mockSBMembers: SBMember[] = [
  {
    id: "sb-1",
    name: "Daisy M. Delambaca",
    position: "Vice Mayor",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Tourism and Cultural Heritage",
      "Committee on Women, Children and Family",
      "Committee on Human Rights",
      "Committee on Sisterhood and International Relations",
    ],
    imageUrl: "/images/sb/vm-delambaca.webp",
  },
  {
    id: "sb-2",
    name: "Francis Erick D. Delambaca",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Rules, Privileges, and Accreditation",
      "Committee on Finance, Budget and Appropriations",
      "Committee on Cultural Communities",
      "Committee on Youth and Sports Development",
      "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
      "Committee on Labor and Employment",
      "Committee on Human Rights",
      "Committee on Ways and Means",
      "Committee on Games & Amusement",
      "Committee on Laws, Resolutions, Ordinances, and Justice",
      "Committee on Information and Media Affairs",
    ],
    imageUrl: "/images/sb/delambaca.webp",
  },
  {
    id: "sb-3",
    name: "Alfonso C. Alcala",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Rules, Privileges, and Accreditation",
      "Committee on Finance, Budget and Appropriations",
      "Committee on Education",
      "Committee on Tourism and Cultural Heritage",
      "Committee on Health and Social Services",
      "Committee on Public Works, Infrastructure & Public Utilities",
      "Committee on Natural Resources & Environmental Protection",
      "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
      "Committee on Labor and Employment",
      "Committee on Trade, Commerce, and Industry",
      "Committee on Science and Technology",
      "Committee on Games & Amusement",
      "Committee on Laws, Resolutions, Ordinances, and Justice",
      "Committee on Government Organizations and Non-Government Organizations",
      "Committee on Beautification, Streets, Parks & Playgrounds",
    ],
    imageUrl: "/images/sb/alcala.webp",
  },
  {
    id: "sb-4",
    name: "Amira Alia M. Caindec",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Women, Children and Family",
      "Committee on Health and Social Services",
      "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
      "Committee on Youth and Sports Development",
      "Committee on Labor and Employment",
      "Committee on Human Rights",
      "Committee on Science and Technology",
      "Committee on Ways and Means",
      "Committee on Games & Amusement",
      "Committee on Human Settlement, Planning & Development",
      "Committee on Laws, Resolutions, Ordinances, and Justice",
      "Committee on Government Organizations and Non-Government Organizations",
      "Committee on Sisterhood and International Relations",
      "Committee on Beautification, Streets, Parks & Playgrounds",
      "Committee on Information and Media Affairs",
      "Committee on Cooperative and Livelihood",
    ],
    imageUrl: "/images/sb/caindec.webp",
  },
  {
    id: "sb-5",
    name: "Analyn H. Casane",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Rules, Privileges, and Accreditation",
      "Committee on Education",
      "Committee on Tourism and Cultural Heritage",
      "Committee on Women, Children and Family",
      "Committee on Health and Social Services",
      "Committee on Public Works, Infrastructure & Public Utilities",
      "Committee on Cultural Communities",
      "Committee on Natural Resources & Environmental Protection",
      "Committee on Youth and Sports Development",
      "Committee on Human Rights",
      "Committee on Trade, Commerce, and Industry",
      "Committee on Ways and Means",
      "Committee on Human Settlement, Planning & Development",
      "Committee on Peace & Order, and Public Safety",
      "Committee on Sisterhood and International Relations",
      "Committee on Beautification, Streets, Parks & Playgrounds",
      "Committee on Government Enterprises and Market",
      "Committee on Transportation",
    ],
    imageUrl: "/images/sb/casane.webp",
  },
  {
    id: "sb-6",
    name: "Zinon G. Labaya",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Rules, Privileges, and Accreditation",
      "Committee on Finance, Budget and Appropriations",
      "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
      "Committee on Cultural Communities",
      "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
      "Committee on Ways and Means",
      "Committee on Games & Amusement",
      "Committee on Human Settlement, Planning & Development",
      "Committee on Peace & Order, and Public Safety",
      "Committee on Information and Media Affairs",
      "Committee on Government Enterprises and Market",
      "Committee on Cooperative and Livelihood",
      "Committee on Transportation",
    ],
    imageUrl: "/images/sb/labaya.webp",
  },
  {
    id: "sb-7",
    name: "Albert G. Bompat",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Finance, Budget and Appropriations",
      "Committee on Education",
      "Committee on Tourism and Cultural Heritage",
      "Committee on Women, Children and Family",
      "Committee on Health and Social Services",
      "Committee on Public Works, Infrastructure & Public Utilities",
      "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
      "Committee on Natural Resources & Environmental Protection",
      "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
      "Committee on Trade, Commerce, and Industry",
      "Committee on Science and Technology",
      "Committee on Ways and Means",
      "Committee on Human Settlement, Planning & Development",
      "Committee on Laws, Resolutions, Ordinances, and Justice",
      "Committee on Government Organizations and Non-Government Organizations",
      "Committee on Sisterhood and International Relations",
      "Committee on Beautification, Streets, Parks & Playgrounds",
      "Committee on Information and Media Affairs",
      "Committee on Government Enterprises and Market",
      "Committee on Cooperative and Livelihood",
      "Committee on Transportation",
    ],
    imageUrl: "/images/sb/bompat.webp",
  },
  {
    id: "sb-8",
    name: "Felix M. Fudolig",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Education",
      "Committee on Tourism and Cultural Heritage",
      "Committee on Health and Social Services",
      "Committee on Cultural Communities",
      "Committee on Natural Resources & Environmental Protection",
      "Committee on Youth and Sports Development",
      "Committee on Labor and Employment",
      "Committee on Trade, Commerce, and Industry",
      "Committee on Games & Amusement",
      "Committee on Human Settlement, Planning & Development",
      "Committee on Peace & Order, and Public Safety",
      "Committee on Government Organizations and Non-Government Organizations",
      "Committee on Information and Media Affairs",
      "Committee on Government Enterprises and Market",
      "Committee on Cooperative and Livelihood",
      "Committee on Transportation",
    ],
    imageUrl: "/images/sb/fudolig.webp",
  },
  {
    id: "sb-9",
    name: "Eduard G. Mejos",
    position: "SB Member",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Public Works, Infrastructure & Public Utilities",
      "Committee on Cultural Communities",
      "Committee on Natural Resources & Environmental Protection",
      "Committee on Human Rights",
      "Committee on Science and Technology",
      "Committee on Peace & Order, and Public Safety",
      "Committee on Government Enterprises and Market",
    ],
    imageUrl: "/images/sb/mejos.webp",
  },
  {
    id: "sb-10",
    name: "Fabian A. Aranaydo",
    position: "ABC President",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Rules, Privileges, and Accreditation",
      "Committee on Finance, Budget and Appropriations",
      "Committee on Education",
      "Committee on Women, Children and Family",
      "Committee on Public Works, Infrastructure & Public Utilities",
      "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
      "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
      "Committee on Trade, Commerce, and Industry",
      "Committee on Peace & Order, and Public Safety",
      "Committee on Sisterhood and International Relations",
      "Committee on Cooperative and Livelihood",
      "Committee on Transportation",
    ],
    imageUrl: "/images/sb/aranaydo.webp",
  },
  {
    id: "sb-11",
    name: "Renel Ryan B. Mila",
    position: "SK Federation President",
    committees: [
      "Committee of the Whole / En Banc",
      "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
      "Committee on Youth and Sports Development",
      "Committee on Labor and Employment",
      "Committee on Science and Technology",
      "Committee on Government Organizations and Non-Government Organizations",
      "Committee on Beautification, Streets, Parks & Playgrounds",
    ],
    imageUrl: "/images/sb/mila.webp",
  },
  {
    id: "sb-12",
    name: "Analyn A. Apduhan",
    position: "SB Secretary",
    committees: [
      "Committee of the Whole / En Banc",
    ],
    imageUrl: "/images/sb/apduhan.webp",
  },
];

export const mockSBStaff: { id: string; name: string; position: string; imageUrl?: string }[] = [
  { id: "staff-1", name: "Staff Member 1", position: "SB Staff" },
  { id: "staff-2", name: "Staff Member 2", position: "SB Staff" },
  { id: "staff-3", name: "Staff Member 3", position: "SB Staff" },
  { id: "staff-4", name: "Staff Member 4", position: "SB Staff" },
  { id: "staff-5", name: "Staff Member 5", position: "SB Staff" },
  { id: "staff-6", name: "Staff Member 6", position: "SB Staff" },
  { id: "staff-7", name: "Staff Member 7", position: "SB Staff" },
  { id: "staff-8", name: "Staff Member 8", position: "SB Staff" },
];

export const mockCommittees: Committee[] = [
  {
    id: "com-1",
    name: "Committee of the Whole / En Banc",
    chairman: formatCommitteePersonName("Daisy M. Delambaca"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Francis Erick D. Delambaca",
      "Alfonso C. Alcala",
      "Amira Alia M. Caindec",
      "Analyn H. Casane",
      "Zinon G. Labaya",
      "Felix M. Fudolig",
      "Eduard G. Mejos",
      "Fabian A. Aranaydo",
      "Renel Ryan B. Mila",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-2",
    name: "Committee on Rules, Privileges, and Accreditation",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Zinon G. Labaya",
      "Alfonso C. Alcala",
      "Fabian A. Aranaydo",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-3",
    name: "Committee on Finance, Budget and Appropriations",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Fabian A. Aranaydo",
      "Alfonso C. Alcala",
      "Zinon G. Labaya",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-4",
    name: "Committee on Education",
    chairman: formatCommitteePersonName("Albert G. Bompat"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Alfonso C. Alcala",
      "Fabian A. Aranaydo",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-5",
    name: "Committee on Tourism and Cultural Heritage",
    chairman: formatCommitteePersonName("Daisy M. Delambaca"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Alfonso C. Alcala",
      "Albert G. Bompat",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-6",
    name: "Committee on Women, Children and Family",
    chairman: formatCommitteePersonName("Daisy M. Delambaca"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Amira Alia M. Caindec",
      "Albert G. Bompat",
      "Fabian A. Aranaydo",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-7",
    name: "Committee on Health and Social Services",
    chairman: formatCommitteePersonName("Analyn H. Casane"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Albert G. Bompat",
      "Alfonso C. Alcala",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-8",
    name: "Committee on Public Works, Infrastructure & Public Utilities",
    chairman: formatCommitteePersonName("Alfonso C. Alcala"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Eduard G. Mejos",
      "Fabian A. Aranaydo",
      "Analyn H. Casane",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-9",
    name: "Committee on Barangay Affairs, Good Government, Public Ethics & Accountability",
    chairman: formatCommitteePersonName("Fabian A. Aranaydo"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Renel Ryan B. Mila",
      "Zinon G. Labaya",
      "Amira Alia M. Caindec",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-10",
    name: "Committee on Cultural Communities",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Felix M. Fudolig",
      "Eduard G. Mejos",
      "Zinon G. Labaya",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-11",
    name: "Committee on Natural Resources & Environmental Protection",
    chairman: formatCommitteePersonName("Albert G. Bompat"),
    viceChairman: formatCommitteePersonName("Eduard G. Mejos"),
    members: [
      "Alfonso C. Alcala",
      "Analyn H. Casane",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-12",
    name: "Committee on Youth and Sports Development",
    chairman: formatCommitteePersonName("Renel Ryan B. Mila"),
    viceChairman: formatCommitteePersonName("Felix M. Fudolig"),
    members: [
      "Francis Erick D. Delambaca",
      "Amira Alia M. Caindec",
      "Analyn H. Casane",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-13",
    name: "Committee on Agriculture, Fisheries, Food and Agrarian Reforms",
    chairman: formatCommitteePersonName("Zinon G. Labaya"),
    viceChairman: formatCommitteePersonName("Fabian A. Aranaydo"),
    members: [
      "Albert G. Bompat",
      "Francis Erick D. Delambaca",
      "Alfonso C. Alcala",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-14",
    name: "Committee on Labor and Employment",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Alfonso C. Alcala"),
    members: [
      "Amira Alia M. Caindec",
      "Felix M. Fudolig",
      "Renel Ryan B. Mila",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-15",
    name: "Committee on Human Rights",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Eduard G. Mejos"),
    members: [
      "Amira Alia M. Caindec",
      "Analyn H. Casane",
      "Daisy M. Delambaca",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-16",
    name: "Committee on Trade, Commerce, and Industry",
    chairman: formatCommitteePersonName("Analyn H. Casane"),
    viceChairman: formatCommitteePersonName("Alfonso C. Alcala"),
    members: [
      "Albert G. Bompat",
      "Felix M. Fudolig",
      "Fabian A. Aranaydo",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-17",
    name: "Committee on Science and Technology",
    chairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Renel Ryan B. Mila",
      "Eduard G. Mejos",
      "Alfonso C. Alcala",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-18",
    name: "Committee on Ways and Means",
    chairman: formatCommitteePersonName("Zinon G. Labaya"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Amira Alia M. Caindec",
      "Albert G. Bompat",
      "Francis Erick D. Delambaca",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-19",
    name: "Committee on Games & Amusement",
    chairman: formatCommitteePersonName("Zinon G. Labaya"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Francis Erick D. Delambaca",
      "Alfonso C. Alcala",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-20",
    name: "Committee on Human Settlement, Planning & Development",
    chairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Felix M. Fudolig",
      "Analyn H. Casane",
      "Zinon G. Labaya",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-21",
    name: "Committee on Laws, Resolutions, Ordinances, and Justice",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Analyn H. Casane",
      "Alfonso C. Alcala",
      "Albert G. Bompat",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-22",
    name: "Committee on Peace & Order, and Public Safety",
    chairman: formatCommitteePersonName("Eduard G. Mejos"),
    viceChairman: formatCommitteePersonName("Analyn H. Casane"),
    members: [
      "Zinon G. Labaya",
      "Fabian A. Aranaydo",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-23",
    name: "Committee on Government Organizations and Non-Government Organizations",
    chairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Felix M. Fudolig",
      "Renel Ryan B. Mila",
      "Alfonso C. Alcala",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-24",
    name: "Committee on Sisterhood and International Relations",
    chairman: formatCommitteePersonName("Daisy M. Delambaca"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Analyn H. Casane",
      "Fabian A. Aranaydo",
      "Albert G. Bompat",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-25",
    name: "Committee on Beautification, Streets, Parks & Playgrounds",
    chairman: formatCommitteePersonName("Analyn H. Casane"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Alfonso C. Alcala",
      "Albert G. Bompat",
      "Renel Ryan B. Mila",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-26",
    name: "Committee on Information and Media Affairs",
    chairman: formatCommitteePersonName("Francis Erick D. Delambaca"),
    viceChairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    members: [
      "Zinon G. Labaya",
      "Albert G. Bompat",
      "Felix M. Fudolig",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-27",
    name: "Committee on Government Enterprises and Market",
    chairman: formatCommitteePersonName("Zinon G. Labaya"),
    viceChairman: formatCommitteePersonName("Felix M. Fudolig"),
    members: [
      "Analyn H. Casane",
      "Albert G. Bompat",
      "Eduard G. Mejos",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-28",
    name: "Committee on Cooperative and Livelihood",
    chairman: formatCommitteePersonName("Amira Alia M. Caindec"),
    viceChairman: formatCommitteePersonName("Albert G. Bompat"),
    members: [
      "Felix M. Fudolig",
      "Zinon G. Labaya",
      "Fabian A. Aranaydo",
    ].map(formatCommitteePersonName),
  },
  {
    id: "com-29",
    name: "Committee on Transportation",
    chairman: formatCommitteePersonName("Felix M. Fudolig"),
    viceChairman: formatCommitteePersonName("Zinon G. Labaya"),
    members: [
      "Analyn H. Casane",
      "Albert G. Bompat",
      "Fabian A. Aranaydo",
    ].map(formatCommitteePersonName),
  },
];

export const mockCSOOrganizations: CSOOrganization[] = [
  // Term: 2022-2025 (20 organizations)
  { id: "cso-1", name: "Panglao Island Fisherfolk Association", officerName: "Roberto M. Salazar", position: "President", term: "2022-2025" },
  { id: "cso-2", name: "Panglao Women's Development Council", officerName: "Maria Elena T. Cruz", position: "Chairperson", term: "2022-2025" },
  { id: "cso-3", name: "Panglao Tourism Workers Alliance", officerName: "Eduardo B. Villamor", position: "President", term: "2022-2025" },
  { id: "cso-4", name: "Dauis-Panglao Farmers Cooperative", officerName: "Juanito R. Paras", position: "Chairman", term: "2022-2025" },
  { id: "cso-5", name: "Panglao Senior Citizens Federation", officerName: "Consolacion M. Duran", position: "President", term: "2022-2025" },
  { id: "cso-6", name: "Panglao Youth Development Council", officerName: "Angela Joy S. Montero", position: "President", term: "2022-2025" },
  { id: "cso-7", name: "Panglao Island Environmental Guardians", officerName: "Fernando A. Bohol", position: "Executive Director", term: "2022-2025" },
  { id: "cso-8", name: "Panglao Persons with Disability Association", officerName: "Lilia G. Reyes", position: "President", term: "2022-2025" },
  { id: "cso-9", name: "Panglao Transport Operators & Drivers Association", officerName: "Danilo C. Escuadro", position: "President", term: "2022-2025" },
  { id: "cso-10", name: "Bolod Barangay Health Workers Association", officerName: "Rosemarie L. Tabilon", position: "President", term: "2022-2025" },
  { id: "cso-11", name: "Panglao Vendors Livelihood Association", officerName: "Gloria D. Inoc", position: "Chairperson", term: "2022-2025" },
  { id: "cso-12", name: "Panglao Dive Operators Association", officerName: "Mark Anthony P. Luna", position: "President", term: "2022-2025" },
  { id: "cso-13", name: "Tawala Mothers Club", officerName: "Erlinda F. Mahinay", position: "President", term: "2022-2025" },
  { id: "cso-14", name: "Panglao Island Heritage Preservation Society", officerName: "Atty. Noel V. Gallares", position: "Chairman", term: "2022-2025" },
  { id: "cso-15", name: "Panglao Seaweed Growers Association", officerName: "Simplicio H. Dagatan", position: "President", term: "2022-2025" },
  { id: "cso-16", name: "Danao Community Development Organization", officerName: "Rodolfo T. Amihan", position: "President", term: "2022-2025" },
  { id: "cso-17", name: "Panglao Tricycle Operators and Drivers Association", officerName: "Ernesto B. Magallanes", position: "President", term: "2022-2025" },
  { id: "cso-18", name: "Panglao Island Boat Operators Association", officerName: "Ricardo S. Dingalan", position: "Chairman", term: "2022-2025" },
  { id: "cso-19", name: "Libaong Women's Livelihood Association", officerName: "Teresita C. Mabini", position: "President", term: "2022-2025" },
  { id: "cso-20", name: "Panglao Eco-Tourism Volunteers Network", officerName: "Jonathan D. Recto", position: "Coordinator", term: "2022-2025" },

  // Term: 2019-2022 (22 organizations)
  { id: "cso-21", name: "Bil-isan Fisherfolk Cooperative", officerName: "Alfredo M. Tagalog", position: "President", term: "2019-2022" },
  { id: "cso-22", name: "Panglao Rural Women's Association", officerName: "Luzviminda B. Santos", position: "Chairperson", term: "2019-2022" },
  { id: "cso-23", name: "Panglao Island Dive Masters Guild", officerName: "Kenneth G. Rivera", position: "President", term: "2019-2022" },
  { id: "cso-24", name: "Lourdes Farmers & Irrigators Association", officerName: "Gregorio P. Daan", position: "President", term: "2019-2022" },
  { id: "cso-25", name: "Panglao Federation of Senior Citizens", officerName: "Anita R. Catubig", position: "President", term: "2019-2022" },
  { id: "cso-26", name: "Sangguniang Kabataan Federation - Panglao", officerName: "Carlo Miguel A. Tan", position: "President", term: "2019-2022" },
  { id: "cso-27", name: "Panglao Coastal Resource Management Council", officerName: "Engr. Nestor L. Boquia", position: "Chairman", term: "2019-2022" },
  { id: "cso-28", name: "Panglao PWD Support Network", officerName: "Remedios H. Castillo", position: "President", term: "2019-2022" },
  { id: "cso-29", name: "Panglao Motorized Banca Operators Association", officerName: "Vicente D. Lim", position: "President", term: "2019-2022" },
  { id: "cso-30", name: "Tangnan Health Workers Organization", officerName: "Maritess G. Ponce", position: "President", term: "2019-2022" },
  { id: "cso-31", name: "Panglao Market Vendors Alliance", officerName: "Corazon E. Basilio", position: "Chairperson", term: "2019-2022" },
  { id: "cso-32", name: "Panglao Scuba Diving Professionals Association", officerName: "James Michael T. Reyes", position: "President", term: "2019-2022" },
  { id: "cso-33", name: "Dao Parents-Teachers Community Association", officerName: "Nimfa R. Padilla", position: "President", term: "2019-2022" },
  { id: "cso-34", name: "Panglao Cultural Heritage Foundation", officerName: "Dr. Cesar V. Aumentado", position: "Executive Director", term: "2019-2022" },
  { id: "cso-35", name: "Panglao Shellcraft Producers Cooperative", officerName: "Felicitas D. Torralba", position: "Manager", term: "2019-2022" },
  { id: "cso-36", name: "Doljo Beach Tourism Council", officerName: "Roberto N. Guisando", position: "Chairman", term: "2019-2022" },
  { id: "cso-37", name: "Panglao Livelihood Enhancement Network", officerName: "Estrella L. Bagayan", position: "President", term: "2019-2022" },
  { id: "cso-38", name: "Panglao Island Clean-Up Volunteers", officerName: "Rodel M. Flores", position: "Coordinator", term: "2019-2022" },
  { id: "cso-39", name: "Tawala Coconut Farmers Association", officerName: "Pedro C. Bingcang", position: "President", term: "2019-2022" },
  { id: "cso-40", name: "Panglao Barangay Nutrition Scholars Federation", officerName: "Evelyn S. Cortes", position: "President", term: "2019-2022" },
  { id: "cso-41", name: "Panglao Island Souvenir Makers Cooperative", officerName: "Marilou T. Bernido", position: "Chairperson", term: "2019-2022" },
  { id: "cso-42", name: "Panglao Interfaith Community Council", officerName: "Rev. Fr. Antonio G. Villaruel", position: "Chairman", term: "2019-2022" },

  // Term: 2016-2019 (19 organizations)
  { id: "cso-43", name: "Panglao Fisherfolk United", officerName: "Manuel S. Ladera", position: "President", term: "2016-2019" },
  { id: "cso-44", name: "Panglao Women in Agriculture Movement", officerName: "Virginia L. Dagohoy", position: "Chairperson", term: "2016-2019" },
  { id: "cso-45", name: "Panglao Resort Workers Organization", officerName: "Dennis E. Mangubat", position: "President", term: "2016-2019" },
  { id: "cso-46", name: "Panglao Rice Farmers Cooperative", officerName: "Antonio B. Lim", position: "Chairman", term: "2016-2019" },
  { id: "cso-47", name: "Panglao Federation of Elderly", officerName: "Josefina M. Regis", position: "President", term: "2016-2019" },
  { id: "cso-48", name: "Panglao Youth for Environment Movement", officerName: "Michael John D. Cabrera", position: "President", term: "2016-2019" },
  { id: "cso-49", name: "Panglao Marine Conservation Society", officerName: "Dr. Emilio R. Torrevillas", position: "Director", term: "2016-2019" },
  { id: "cso-50", name: "Panglao Special Needs Advocacy Group", officerName: "Josefa T. Mendaros", position: "President", term: "2016-2019" },
  { id: "cso-51", name: "Panglao Jeepney & Multicab Operators Association", officerName: "Remigio L. Cuizon", position: "President", term: "2016-2019" },
  { id: "cso-52", name: "Bil-isan Barangay Health Volunteers", officerName: "Norma G. Inting", position: "President", term: "2016-2019" },
  { id: "cso-53", name: "Panglao Sari-Sari Store Owners League", officerName: "Danesa C. Pangan", position: "Chairperson", term: "2016-2019" },
  { id: "cso-54", name: "Panglao Snorkeling Guides Association", officerName: "Joselito M. Pamugas", position: "President", term: "2016-2019" },
  { id: "cso-55", name: "Libaong Parents Association", officerName: "Carmen R. Belarmino", position: "President", term: "2016-2019" },
  { id: "cso-56", name: "Panglao Historical Society", officerName: "Prof. Renato T. Abucejo", position: "Chairman", term: "2016-2019" },
  { id: "cso-57", name: "Panglao Basket Weavers Cooperative", officerName: "Clarita D. Bonghanoy", position: "Manager", term: "2016-2019" },
  { id: "cso-58", name: "Bolod Coastal Cleanup Association", officerName: "Ariel M. Palileo", position: "Coordinator", term: "2016-2019" },
  { id: "cso-59", name: "Panglao Vegetable Growers Association", officerName: "Democrito P. Gatal", position: "President", term: "2016-2019" },
  { id: "cso-60", name: "Panglao Day Care Workers Federation", officerName: "Rosalina B. Dacullo", position: "President", term: "2016-2019" },
  { id: "cso-61", name: "Panglao Handicraft Exporters Guild", officerName: "Cristina S. Mag-aso", position: "President", term: "2016-2019" },

  // Term: 2013-2016 (21 organizations)
  { id: "cso-62", name: "Panglao Deep-Sea Fishermen's League", officerName: "Salvador R. Camugao", position: "President", term: "2013-2016" },
  { id: "cso-63", name: "Panglao Mothers for Progress", officerName: "Paz G. Tomarong", position: "Chairperson", term: "2013-2016" },
  { id: "cso-64", name: "Panglao Hotel & Restaurant Workers Union", officerName: "Reynaldo S. Manatad", position: "President", term: "2013-2016" },
  { id: "cso-65", name: "Panglao Corn & Root Crop Growers Association", officerName: "Fortunato B. Calipayan", position: "Chairman", term: "2013-2016" },
  { id: "cso-66", name: "Panglao Retirees Association", officerName: "Col. (Ret.) Arturo M. Pantaleon", position: "President", term: "2013-2016" },
  { id: "cso-67", name: "Panglao Young Professionals Network", officerName: "Atty. Sarah Mae L. Dinopol", position: "President", term: "2013-2016" },
  { id: "cso-68", name: "Panglao Reef Protection Initiative", officerName: "Dr. Fidel C. Torralba", position: "Director", term: "2013-2016" },
  { id: "cso-69", name: "Panglao Alliance for Persons with Disabilities", officerName: "Ernesto V. Alicando", position: "President", term: "2013-2016" },
  { id: "cso-70", name: "Panglao Habal-Habal Drivers Federation", officerName: "Romulo D. Casipong", position: "President", term: "2013-2016" },
  { id: "cso-71", name: "Tangnan Community Health Association", officerName: "Dr. Lourdes M. Batican", position: "President", term: "2013-2016" },
  { id: "cso-72", name: "Panglao Dry Goods Traders Association", officerName: "Editha G. Masipag", position: "Chairperson", term: "2013-2016" },
  { id: "cso-73", name: "Panglao Island Divers Cooperative", officerName: "Roderick P. Tabañag", position: "President", term: "2013-2016" },
  { id: "cso-74", name: "Dao Community Education Foundation", officerName: "Prof. Wilma T. Escaño", position: "President", term: "2013-2016" },
  { id: "cso-75", name: "Panglao Heritage Arts Council", officerName: "Francisco R. Abella", position: "Chairman", term: "2013-2016" },
  { id: "cso-76", name: "Panglao Pearl Cultivators Association", officerName: "Segundino H. Sumalinog", position: "Manager", term: "2013-2016" },
  { id: "cso-77", name: "Doljo Mangrove Reforestation Society", officerName: "Ernesto L. Cagalitan", position: "Coordinator", term: "2013-2016" },
  { id: "cso-78", name: "Panglao Organic Farming Network", officerName: "Apolonio S. Diolazo", position: "President", term: "2013-2016" },
  { id: "cso-79", name: "Panglao Barangay Tanod Federation", officerName: "Guillermo B. Pizarras", position: "President", term: "2013-2016" },
  { id: "cso-80", name: "Panglao Cooperative Development Council", officerName: "Cresencia P. Alisto", position: "Chairperson", term: "2013-2016" },
  { id: "cso-81", name: "Tawala Youth Sports Development Club", officerName: "Richard M. Tomol", position: "President", term: "2013-2016" },
  { id: "cso-82", name: "Panglao Solo Parents Association", officerName: "Maricel R. Dacullo", position: "President", term: "2013-2016" },

  // Term: 2010-2013 (18 organizations)
  { id: "cso-83", name: "Panglao Municipal Fisherfolk Council", officerName: "Cecilio M. Lumactod", position: "President", term: "2010-2013" },
  { id: "cso-84", name: "Panglao Women Empowerment Alliance", officerName: "Natividad R. Camino", position: "Chairperson", term: "2010-2013" },
  { id: "cso-85", name: "Panglao Tourism Frontliners Association", officerName: "Ronaldo T. Hinoguin", position: "President", term: "2010-2013" },
  { id: "cso-86", name: "Panglao Livestock Raisers Cooperative", officerName: "Dominador B. Cahayag", position: "Chairman", term: "2010-2013" },
  { id: "cso-87", name: "Panglao Golden Age Club", officerName: "Catalina M. Supapo", position: "President", term: "2010-2013" },
  { id: "cso-88", name: "Panglao Student Leaders Assembly", officerName: "Jessa Mae C. Pollantes", position: "President", term: "2010-2013" },
  { id: "cso-89", name: "Panglao Coastal Watchers Association", officerName: "Leopoldo R. Butal", position: "Director", term: "2010-2013" },
  { id: "cso-90", name: "Panglao Differently-Abled Citizens Group", officerName: "Eugenio S. Cabriga", position: "President", term: "2010-2013" },
  { id: "cso-91", name: "Panglao Pedicab Operators Union", officerName: "Rizalino D. Bantayan", position: "President", term: "2010-2013" },
  { id: "cso-92", name: "Lourdes Health Volunteers Organization", officerName: "Melba G. Sumalinog", position: "President", term: "2010-2013" },
  { id: "cso-93", name: "Panglao Public Market Stallholders Association", officerName: "Lolita E. Mangubat", position: "Chairperson", term: "2010-2013" },
  { id: "cso-94", name: "Panglao Glass Bottom Boat Operators", officerName: "Filomeno P. Ampo", position: "President", term: "2010-2013" },
  { id: "cso-95", name: "Bolod Parents-Teachers Association", officerName: "Ligaya R. Deiparine", position: "President", term: "2010-2013" },
  { id: "cso-96", name: "Panglao Church Heritage Committee", officerName: "Msgr. Proceso V. Espacio", position: "Chairman", term: "2010-2013" },
  { id: "cso-97", name: "Panglao Mat Weavers Cooperative", officerName: "Hospicia D. Calibo", position: "Manager", term: "2010-2013" },
  { id: "cso-98", name: "Panglao Beach Cleanup Brigade", officerName: "Teodoro M. Baldoza", position: "Coordinator", term: "2010-2013" },
  { id: "cso-99", name: "Panglao Cassava Growers Association", officerName: "Victorino S. Gue", position: "President", term: "2010-2013" },
  { id: "cso-100", name: "Panglao Barangay Workers Federation", officerName: "Adelaida C. Dumogho", position: "President", term: "2010-2013" },
];

export const mockCommitteeReports: CommitteeReport[] = [
  {
    id: "cr-1",
    reportNo: "CR 54",
    subject: "Regulation of Tourist Boat Operations in Panglao Waters",
    committee: "Committee on Tourism and Cultural Heritage",
    pdfUrl: SAMPLE_PDF_SNORKELING,
  },
  {
    id: "cr-2",
    reportNo: "CR 53",
    subject: "Proposed Amendments to the Municipal Revenue Code",
    committee: "Committee on Finance, Budget and Appropriations",
    pdfUrl: SAMPLE_PDF_TRICYCLE,
  },
  {
    id: "cr-3",
    reportNo: "CR 52",
    subject: "Establishment of a Coastal Resource Management Program",
    committee: "Committee on Environment",
    pdfUrl: SAMPLE_PDF_EUF,
  },
  {
    id: "cr-4",
    reportNo: "CR 51",
    subject: "Construction of Multi-Purpose Hall in Barangay Bolod",
    committee: "Committee on Public Works, Infrastructure & Public Utilities",
    pdfUrl: SAMPLE_PDF_SNORKELING,
  },
  {
    id: "cr-5",
    reportNo: "CR 50",
    subject: "Implementation of Anti-Drug Abuse Prevention Program",
    committee: "Committee on Peace & Order and Public Safety",
    pdfUrl: SAMPLE_PDF_TRICYCLE,
  },
  {
    id: "cr-6",
    reportNo: "CR 49",
    subject: "Scholarship Grant Program for Indigent Students of Panglao",
    committee: "Committee on Education",
    pdfUrl: SAMPLE_PDF_EUF,
  },
  {
    id: "cr-7",
    reportNo: "CR 48",
    subject: "Accreditation of Panglao Island Fisherfolk Association",
    committee: "Committee on Economic Development and Social Enterprise",
    pdfUrl: SAMPLE_PDF_SNORKELING,
  },
  {
    id: "cr-8",
    reportNo: "CR 47",
    subject: "Establishment of Municipal Health and Wellness Center",
    committee: "Committee on Health and Social Services",
    pdfUrl: SAMPLE_PDF_TRICYCLE,
  },
  {
    id: "cr-9",
    reportNo: "CR 46",
    subject: "Reclassification of Agricultural Land in Barangay Tawala",
    committee: "Committee on Human Settlement, Land Use & Development",
    pdfUrl: SAMPLE_PDF_EUF,
  },
  {
    id: "cr-10",
    reportNo: "CR 45",
    subject: "Allocation of Funds for Senior Citizen Medicine Assistance",
    committee: "Committee on Health and Social Services",
    pdfUrl: SAMPLE_PDF_SNORKELING,
  },
  {
    id: "cr-11",
    reportNo: "CR 44",
    subject: "Regulation of Tricycle Fare Rates within the Municipality",
    committee: "Committee on Economic Development and Social Enterprise",
    pdfUrl: SAMPLE_PDF_TRICYCLE,
  },
  {
    id: "cr-12",
    reportNo: "CR 43",
    subject: "Installation of Street Lights along Panglao Circumferential Road",
    committee: "Committee on Public Works, Infrastructure & Public Utilities",
    pdfUrl: SAMPLE_PDF_EUF,
  },
  {
    id: "cr-13",
    reportNo: "CR 42",
    subject: "Adoption of Solid Waste Management Plan for 2026-2030",
    committee: "Committee on Environment",
    pdfUrl: SAMPLE_PDF_SNORKELING,
  },
  {
    id: "cr-14",
    reportNo: "CR 41",
    subject: "Establishment of Municipal Disaster Risk Reduction Management Office",
    committee: "Committee on Peace & Order and Public Safety",
    pdfUrl: SAMPLE_PDF_TRICYCLE,
  },
  {
    id: "cr-15",
    reportNo: "CR 40",
    subject: "Annual Appropriations Ordinance Review for Fiscal Year 2026",
    committee: "Committee on Finance, Budget and Appropriations",
    pdfUrl: SAMPLE_PDF_EUF,
  },
];
