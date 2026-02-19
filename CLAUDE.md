# CLAUDE.md — Legislative Records Management & Public Transparency Platform

## Project Overview

This is a **Legislative Records Management & Public Transparency Platform** for the **Sangguniang Bayan of Panglao** (a local government legislative body in the Philippines). The system digitizes and manages legislative documents (ordinances, resolutions, session minutes) and provides a public-facing website for citizen transparency.

The project has **two main parts**:
1. **Admin System** — Internal dashboard for SB staff to upload, manage, and publish legislative documents
2. **Public Website** — External citizen-facing portal to search, view, and download published documents

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (latest)
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useContext) — no external state library needed
- **PDF Viewer**: `react-pdf` or `@react-pdf-viewer/core` for embedded PDF viewing
- **Date Handling**: `date-fns`
- **Tables**: `@tanstack/react-table` for data tables with sorting, filtering, pagination
- **Forms**: `react-hook-form` + `zod` for validation

---

## Design Direction

### Admin System
- **Aesthetic**: Clean, utilitarian, professional government dashboard
- **Theme**: Light theme with a navy/slate primary (`#1e3a5f`) and teal accent (`#0d9488`)
- **Typography**: "Plus Jakarta Sans" for headings, "Inter" body text (acceptable here for data-heavy UI readability)
- **Layout**: Fixed sidebar + scrollable content area (classic admin layout from wireframes)
- **Tone**: Functional, no-nonsense — staff should feel this is faster than paper

### Public Website
- **Aesthetic**: Modern government transparency portal — trustworthy, accessible, mobile-first
- **Theme**: White background, navy primary, gold/amber accent for government feel
- **Typography**: "Plus Jakarta Sans" headings, system font stack for body
- **Layout**: Centered content, prominent search bar (Google-like), card-based results
- **Tone**: Welcoming, transparent, easy for non-tech citizens

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (shared metadata)
│   ├── page.tsx                      # Redirect → /portal (public homepage)
│   │
│   ├── (public)/                     # Public website (no auth required)
│   │   ├── layout.tsx                # Public layout (header, footer, no sidebar)
│   │   ├── portal/
│   │   │   └── page.tsx              # Public homepage — search bar, browse links, latest published
│   │   ├── search/
│   │   │   └── page.tsx              # Search results page — filters, table/card results
│   │   ├── ordinances/
│   │   │   ├── page.tsx              # Browse all public ordinances (list with filters)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Single ordinance view — metadata + PDF viewer + download
│   │   ├── resolutions/
│   │   │   ├── page.tsx              # Browse all public resolutions (list with filters)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Single resolution view — metadata + PDF viewer + download
│   │   ├── minutes/
│   │   │   ├── page.tsx              # Browse minutes — Year → Month → Session tree
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Single minutes view — metadata + PDF viewer + download
│   │   └── about/
│   │       └── page.tsx              # SB Information — members list, committees, contact info
│   │
│   ├── (admin)/                      # Admin system (auth required)
│   │   ├── layout.tsx                # Admin layout (sidebar + header + breadcrumb)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard — stat cards, recent activity table
│   │   ├── ordinances/
│   │   │   ├── page.tsx              # Ordinance list — table with search, filter, pagination
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Upload new ordinance — form + PDF upload
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # View ordinance detail — metadata + PDF + tracking timeline
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit ordinance metadata + replace PDF
│   │   ├── resolutions/
│   │   │   ├── page.tsx              # Resolution list — table with search, filter, pagination
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Upload new resolution — form + PDF upload
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # View resolution detail — metadata + PDF + tracking timeline
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit resolution metadata + replace PDF
│   │   ├── minutes/
│   │   │   ├── page.tsx              # Minutes list — Year → Month → Session tree navigation
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Upload new minutes — simplified form
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # View minutes detail
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit minutes metadata
│   │   ├── categories/
│   │   │   └── page.tsx              # Category management — add, edit, disable categories
│   │   ├── tracking/
│   │   │   └── page.tsx              # Legislative tracking overview — all documents + statuses
│   │   ├── requests/
│   │   │   └── page.tsx              # Internal document request tracking
│   │   ├── users/
│   │   │   └── page.tsx              # User & role management (Sys Admin only)
│   │   ├── audit-logs/
│   │   │   └── page.tsx              # Audit log viewer — filterable activity history
│   │   └── settings/
│   │       └── page.tsx              # System settings & backup/restore (Sys Admin only)
│   │
│   └── login/
│       └── page.tsx                  # Login page (shared entry for all internal roles)
│
├── components/
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   ├── admin/
│   │   ├── sidebar.tsx               # Fixed sidebar navigation
│   │   ├── admin-header.tsx          # Top header with branding + user menu
│   │   ├── breadcrumb-nav.tsx        # Dynamic breadcrumb
│   │   ├── stat-card.tsx             # Dashboard stat card (Total Ordinances, etc.)
│   │   ├── recent-activity.tsx       # Recent activity table on dashboard
│   │   ├── document-table.tsx        # Reusable data table for ordinances/resolutions
│   │   ├── document-form.tsx         # Reusable upload form (ordinance/resolution)
│   │   ├── minutes-form.tsx          # Simplified upload form for minutes
│   │   ├── document-timeline.tsx     # Legislative tracking timeline (Scanned → Published)
│   │   ├── pdf-upload.tsx            # PDF file upload component with preview
│   │   ├── status-badge.tsx          # Status pill (Draft / Approved / Published)
│   │   ├── category-manager.tsx      # Category CRUD interface
│   │   ├── user-manager.tsx          # User CRUD + role assignment
│   │   └── audit-log-table.tsx       # Audit log display with filters
│   ├── public/
│   │   ├── public-header.tsx         # Public site header with logo + nav
│   │   ├── public-footer.tsx         # Public site footer with contact info
│   │   ├── search-hero.tsx           # Homepage hero with large search bar
│   │   ├── browse-links.tsx          # Browse by Category / Year / Minutes buttons
│   │   ├── latest-published.tsx      # Latest published documents cards
│   │   ├── search-filters.tsx        # Type / Year / Category filter bar
│   │   ├── search-results.tsx        # Results list (table on desktop, cards on mobile)
│   │   ├── document-detail.tsx       # Public document detail view
│   │   ├── pdf-viewer.tsx            # Embedded PDF viewer for public
│   │   ├── minutes-browser.tsx       # Year → Month → Session collapsible tree
│   │   └── sb-members-list.tsx       # SB Members + Committees display
│   └── shared/
│       ├── loading-spinner.tsx       # Loading state
│       ├── empty-state.tsx           # No results / empty data display
│       ├── confirm-dialog.tsx        # Confirmation modal
│       └── pagination.tsx            # Reusable pagination component
│
├── lib/
│   ├── constants.ts                  # Document types, statuses, categories
│   ├── types.ts                      # TypeScript interfaces for all data models
│   ├── mock-data.ts                  # Mock/seed data for development
│   ├── utils.ts                      # Utility functions (cn helper, formatters)
│   └── auth-context.tsx              # Auth context provider (role-based)
│
└── styles/
    └── globals.css                   # Tailwind base + custom CSS variables
```

---

## Route Map (All Clickable Navigation)

### Public Website Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | Redirects to `/portal` |
| `/portal` | Public Homepage | Search bar, browse links, latest published documents |
| `/search?q=keyword&type=ordinance&year=2026&category=tourism` | Search Results | Filtered search results with query params |
| `/ordinances` | Ordinance List | All public ordinances, filterable |
| `/ordinances/[id]` | Ordinance Detail | Metadata summary, PDF viewer, download button, related docs |
| `/resolutions` | Resolution List | All public resolutions, filterable |
| `/resolutions/[id]` | Resolution Detail | Metadata summary, PDF viewer, download button |
| `/minutes` | Minutes Browser | Year → Month → Session collapsible tree |
| `/minutes/[id]` | Minutes Detail | Session metadata, PDF viewer, download |
| `/about` | SB Information | Members list, committees, contact information |

### Admin Routes (Auth Required)

| Route | Page | Accessible By |
|-------|------|---------------|
| `/login` | Login Page | All internal users |
| `/dashboard` | Admin Dashboard | All authenticated users |
| `/ordinances` (admin) | Ordinance List | SB Secretary, SB Members (view-only) |
| `/ordinances/new` | Upload Ordinance | SB Secretary, Digitization Assistant (raw only) |
| `/ordinances/[id]` (admin) | Ordinance Detail | SB Secretary, SB Members |
| `/ordinances/[id]/edit` | Edit Ordinance | SB Secretary only |
| `/resolutions` (admin) | Resolution List | SB Secretary, SB Members (view-only) |
| `/resolutions/new` | Upload Resolution | SB Secretary, Digitization Assistant (raw only) |
| `/resolutions/[id]` (admin) | Resolution Detail | SB Secretary, SB Members |
| `/resolutions/[id]/edit` | Edit Resolution | SB Secretary only |
| `/minutes` (admin) | Minutes List | SB Secretary |
| `/minutes/new` | Upload Minutes | SB Secretary |
| `/minutes/[id]` (admin) | Minutes Detail | SB Secretary |
| `/minutes/[id]/edit` | Edit Minutes | SB Secretary |
| `/categories` | Category Manager | SB Secretary, Sys Admin |
| `/tracking` | Legislative Tracking | SB Secretary, SB Members |
| `/requests` | Document Requests | SB Secretary |
| `/users` | User Management | Sys Admin only |
| `/audit-logs` | Audit Logs | Sys Admin, SB Secretary |
| `/settings` | System Settings | Sys Admin only |

> **Note**: Admin and Public routes share similar path names (e.g., `/ordinances`). The `(admin)` and `(public)` route groups in Next.js App Router handle this separation. The admin layout wraps admin routes with the sidebar; the public layout wraps public routes with the public header/footer. The actual URL paths can be disambiguated with a prefix like `/admin/ordinances` vs `/ordinances` for public.

### Recommended URL Prefix Strategy

```
Public:  /portal, /search, /ordinances, /resolutions, /minutes, /about
Admin:   /admin/dashboard, /admin/ordinances, /admin/resolutions, /admin/minutes, etc.
Auth:    /login
```

---

## Page Specifications

### PUBLIC PAGES

#### 1. `/portal` — Public Homepage
- **Hero section**: Large search bar centered (Google-like), placeholder: "Search Ordinances & Resolutions..."
- **Browse links**: Three buttons — "Browse by Category", "Browse by Year", "Browse Minutes"
- **Latest Published section**: Cards showing most recent published ordinances/resolutions (max 6)
- Each card shows: Document number, title, category badge, date approved
- Cards are clickable → navigate to `/ordinances/[id]` or `/resolutions/[id]`
- **Mobile**: Search bar sticky at top, browse links stack vertically, cards stack in single column

#### 2. `/search` — Search Results
- **Sticky search bar** at top (pre-filled with query)
- **Filter bar**: Dropdowns for Type (Ordinance/Resolution/Minutes), Year, Category
- **Results table** (desktop): Columns — Document No., Title, Year, Category, Type
- **Results cards** (mobile): Card per result with same info
- Each result is clickable → navigates to document detail page
- **Empty state**: "No documents found" with suggestion to adjust filters
- Pagination at bottom

#### 3. `/ordinances` — Public Ordinance List
- Same layout as search results but pre-filtered to type=Ordinance
- Filters: Year, Category, Author
- Table/card list of all published ordinances

#### 4. `/ordinances/[id]` — Public Ordinance Detail
- **Header**: Ordinance No. (e.g., "Ordinance No. 2025-08"), Series Year
- **Metadata block**: Title, Category, Author/Sponsor, Date Approved, Publication Info
- **PDF Viewer**: Embedded PDF viewer showing the document
- **Action buttons**: "View PDF" (fullscreen), "Download PDF"
- **Related Documents section**: Links to amendments or repeals (if any)
- **Back button**: Returns to previous list

#### 5. `/resolutions` and `/resolutions/[id]` — Same structure as ordinances

#### 6. `/minutes` — Minutes Browser
- **Tree navigation**: Year (collapsible) → Month (collapsible) → Session entries
- Example: 2026 → January → "Jan 10 Session", "Jan 24 Session"
- Each session entry is clickable → navigates to `/minutes/[id]`
- Shows status badge (Draft/Approved/Published) next to each session

#### 7. `/minutes/[id]` — Minutes Detail
- Session Date, Session Type (Regular/Special), Session Number
- Presiding Officer, Prepared By
- PDF viewer + download button

#### 8. `/about` — SB Information Page
- **SB Members list**: Name, position, committee assignments
- **Committees section**: Committee name + members
- **Contact Information**: Office address, phone, email

---

### ADMIN PAGES

#### 9. `/login` — Login Page
- Centered login card
- Fields: Username/Email, Password
- "Login" button
- Branding: "Sangguniang Bayan of Panglao — Legislative Management System"
- No "register" link (accounts are created by Sys Admin)

#### 10. `/admin/dashboard` — Admin Dashboard
- **Stat cards row** (4 cards):
  - Total Ordinances (clickable → `/admin/ordinances`)
  - Total Resolutions (clickable → `/admin/resolutions`)
  - Total Minutes (clickable → `/admin/minutes`)
  - Pending/Draft count
- **Secondary stat row** (3 cards):
  - Draft count
  - Published count
  - This Month uploads
- **Recent Activity table**: Date | Action | User | Document
  - Example: "Feb 12 | Uploaded | Maria | Ordinance 2026-01"
  - Auto-populated from audit logs

#### 11. `/admin/ordinances` — Ordinance List (Admin)
- **"+ Upload New" button** (top right) → navigates to `/admin/ordinances/new`
- **Search bar** + **Filter dropdown** (Category, Status, Year)
- **Data table** columns: Series No. | Title | Category | Date Approved | Status
- **Row hover actions**: View, Edit, Download, Archive
- **Status badges**: Draft (gray), Approved (blue), Published (green)
- **Pagination** at bottom

#### 12. `/admin/ordinances/new` — Upload Ordinance Form
- **This is the CRITICAL page** — must be clean, minimal, not overwhelming
- **Form fields** (in order per wireframe):
  - Document Type: Dropdown (Ordinance / Resolution) — pre-set to "Ordinance"
  - Proposed No.: Text input
  - Approved No.: Text input
  - Series Year: Dropdown (current year default)
  - Title: Text area
  - Author / Sponsor: Text input
  - Category: Dropdown (from category list)
  - Date Enacted: Date picker
  - Date Approved: Date picker
  - Publication Info: Text input
  - Remarks: Text area
  - Notes: Text area (optional)
  - Upload PDF: File upload zone (drag & drop + click to browse, PDF only)
- **Action buttons**:
  - "Save as Draft" (primary)
  - "Publish" (secondary — only enabled if all required fields filled)
- **Validation**: Required fields marked with asterisk, inline error messages
- **Auto-generate document ID** on save

#### 13. `/admin/ordinances/[id]` — Ordinance Detail (Admin)
- Full metadata display (all fields from upload form)
- **Legislative Tracking Timeline**: Visual vertical timeline showing:
  - Scanned — date — who
  - Drafted — date — who
  - Validated — date — who
  - Approved — date — who
  - Published — date — who
- **PDF preview** (embedded)
- **Action buttons**: Edit, Download, Archive, Publish (if draft), Set Public Visibility toggle
- **Version history**: List of file replacements with dates

#### 14. `/admin/ordinances/[id]/edit` — Edit Ordinance
- Same form as upload, pre-filled with existing data
- Ability to replace PDF file (old version preserved in history)
- "Save Changes" + "Cancel" buttons

#### 15. `/admin/resolutions/*` — Mirror of ordinances routes (same structure)

#### 16. `/admin/minutes` — Minutes Management
- **"+ Upload Minutes" button** → `/admin/minutes/new`
- **Tree browser**: Year → Month → Session (collapsible, same as public but with edit access)
- Each session entry shows: Session Date, Status, actions (View, Edit, Download)

#### 17. `/admin/minutes/new` — Upload Minutes (Simplified Form)
- Session Date: Date picker
- Session Type: Dropdown (Regular / Special)
- Session Number: Text input (optional)
- Presiding Officer: Text input
- Prepared By: Text input (defaults to logged-in user)
- Status: Dropdown (Draft / Approved)
- Remarks: Text area (optional)
- Notes: Text area (optional)
- Upload PDF: File upload zone
- **Action buttons**: "Save" / "Publish"
- No complex validation required (simpler than ordinance form)

#### 18. `/admin/categories` — Category Management
- **Table**: Category Name | Status (Active/Disabled) | Actions
- **"+ Add Category" button** → opens inline form or modal
- **Row actions**: Edit (inline), Disable/Enable
- Categories are used as dropdown options in document forms
- Default categories: Social Services, Taxation, Land Use, Education, Tourism, Environment, Health, Infrastructure, Peace and Order, General

#### 19. `/admin/tracking` — Legislative Tracking Overview
- **Filterable table** of all documents with their current status
- Columns: Document No. | Type | Title | Status | Current Custodian | Last Updated
- **Status filter**: Scanned, Draft, Under Review, Approved, Published
- Click any row → goes to document detail page
- This is the "Where is this file now?" answer page

#### 20. `/admin/requests` — Internal Document Request Tracking
- **Table**: Requestor | Document | Date Requested | Status | Date Released | Processed By
- **Status options**: In Process, Released, Completed
- **"+ New Request" button** → modal or inline form
- SB Secretary can update status of each request

#### 21. `/admin/users` — User & Role Management (Sys Admin Only)
- **Table**: Name | Email | Role | Status (Active/Inactive) | Last Login
- **"+ Create User" button** → modal with: Name, Email, Password, Role dropdown
- **Roles available**: System Administrator, SB Secretary, SB Member, Digitization Assistant
- **Row actions**: Edit, Deactivate, Reset Password
- Role determines what sidebar items are visible

#### 22. `/admin/audit-logs` — Audit Logs
- **Filterable log table**: Date/Time | User | Action | Document | Details
- **Filter by**: User, Action type (Upload, Edit, Publish, Delete, Login), Date range
- **Actions logged**: Upload, Edit metadata, Replace PDF, Publish, Archive, Login, Logout
- **Read-only** — no one can edit or delete audit logs (immutable)
- Export to CSV option

#### 23. `/admin/settings` — System Settings (Sys Admin Only)
- **Backup & Restore**: Trigger manual backup, view backup history, restore from backup
- **System Info**: Version, storage usage, user count
- **Naming Convention Config**: Pattern for auto-generated document IDs

---

## User Roles & Sidebar Visibility

### Sidebar Navigation Items per Role

| Sidebar Item | Sys Admin | SB Secretary | SB Member | Digitization Asst. |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Ordinances | ❌ | ✅ | ✅ (view only) | ✅ (upload raw only) |
| Resolutions | ❌ | ✅ | ✅ (view only) | ✅ (upload raw only) |
| Minutes | ❌ | ✅ | ❌ | ❌ |
| Categories | ✅ | ✅ | ❌ | ❌ |
| Tracking | ❌ | ✅ | ✅ (view only) | ❌ |
| Requests | ❌ | ✅ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Logout | ✅ | ✅ | ✅ | ✅ |

---

## Data Models (TypeScript Interfaces)

```typescript
// Document types
type DocumentType = "ordinance" | "resolution" | "minutes";
type DocumentStatus = "draft" | "approved" | "published" | "archived";
type SessionType = "regular" | "special";
type UserRole = "sys_admin" | "sb_secretary" | "sb_member" | "digitization_assistant";
type RequestStatus = "in_process" | "released" | "completed";

// Ordinance / Resolution
interface LegislativeDocument {
  id: string;                         // Auto-generated unique ID
  documentType: "ordinance" | "resolution";
  proposedNumber: string;             // e.g. "2026-01"
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
  repealsAmendments: string;          // Reference to related docs
  status: DocumentStatus;
  isPublic: boolean;                  // Controls public visibility
  pdfUrl: string;
  versions: DocumentVersion[];
  timeline: TrackingEvent[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session Minutes
interface SessionMinutes {
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

// Tracking
interface TrackingEvent {
  status: string;                     // "Scanned", "Drafted", "Validated", "Published"
  date: Date;
  performedBy: string;
}

// Version History
interface DocumentVersion {
  versionNumber: number;
  pdfUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  notes: string;
}

// User
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

// Audit Log
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;                     // "upload", "edit", "publish", "login", etc.
  documentId?: string;
  documentTitle?: string;
  details: string;
}

// Document Request
interface DocumentRequest {
  id: string;
  requestor: string;
  documentId: string;
  documentTitle: string;
  dateRequested: Date;
  dateReleased?: Date;
  status: RequestStatus;
  processedBy: string;
}

// Category
interface Category {
  id: string;
  name: string;
  isActive: boolean;
}
```

---

## Component Behavior Rules

### Navigation (Admin Sidebar)
- Sidebar is fixed on left, 256px wide on desktop
- Collapses to icon-only on tablet (< 1024px)
- Hidden behind hamburger menu on mobile (< 768px)
- Active route is highlighted
- Logo + "Legislative Management System" at top
- Logout at bottom

### Admin Header
- Shows: Current page title + Breadcrumb
- Right side: User name + role badge + avatar dropdown (Profile, Logout)

### Breadcrumbs
- Always visible below header
- Example: Dashboard > Ordinances > Ordinance 2026-01 > Edit
- Each segment is clickable and navigates to that route

### Status Badges (reusable)
- **Draft**: Gray background, dark text
- **Approved**: Blue background, white text
- **Published**: Green background, white text
- **Archived**: Red/dark background, white text

### Document Table (reusable)
- Used on: Ordinance list, Resolution list, Tracking, Audit Logs
- Features: Column sorting, search input, filter dropdowns, pagination (10/25/50 per page)
- Row hover: Shows action buttons (View, Edit, Download, Archive)
- Responsive: Switches to card layout on mobile

### Upload Form Rules
- Required fields marked with red asterisk (*)
- Inline validation on blur
- "Publish" button disabled until ALL required fields are filled
- PDF upload shows file name + size after selection, with "Remove" option
- Max file size: 25MB
- Accepted formats: PDF only
- Auto-generates document ID on save (pattern: `{TYPE}-{YEAR}-{SEQUENCE}`)

### Public Search
- Search triggers on Enter key or Search button click
- Results update URL query params (shareable URLs)
- Debounced search suggestions (optional enhancement)
- Empty state shows helpful message

### PDF Viewer
- Embedded PDF viewer on document detail pages
- Toolbar: Zoom in/out, page navigation, fullscreen, download
- Falls back to download link if viewer fails

---

## Mock Data for Development

Seed the app with at least:
- 10 ordinances (mix of Draft, Approved, Published across 2024-2026)
- 8 resolutions (same status mix)
- 6 session minutes (Jan-March 2026, Regular and Special)
- 5 categories: Social Services, Taxation, Tourism, Environment, Education
- 4 users: 1 Sys Admin, 1 SB Secretary, 1 SB Member, 1 Digitization Assistant
- 15 audit log entries
- 3 document requests

---

## Mobile Responsiveness Requirements

### Public Website
- **Mobile-first** design
- Search bar is sticky at top on scroll
- Filters collapse into a "Filters" button that opens a bottom sheet
- Results display as cards (not table) on mobile
- PDF viewer goes fullscreen on mobile
- Touch-friendly tap targets (min 44px)

### Admin System
- Sidebar collapses to hamburger on mobile
- Tables switch to card/list layout on mobile
- Forms are single-column on mobile
- Action buttons stack vertically on mobile

---

## Accessibility Requirements

- All form inputs have associated labels
- Color is not the only indicator of status (badges include text)
- Keyboard navigable (Tab through all interactive elements)
- ARIA labels on icon-only buttons
- Minimum contrast ratio 4.5:1 for text
- Focus indicators visible on all interactive elements

---

## Key Implementation Notes

1. **This is frontend-only** — Use mock data / local state. No backend API needed yet. Structure code so API calls can be easily added later (use service functions that return mock data).

2. **Role simulation** — Include a dev-only role switcher in the admin header to test different role views without a real auth system.

3. **PDF files** — Use placeholder PDFs for development. The PDF viewer should work with any uploaded PDF.

4. **Keep forms simple** — The document explicitly warns: "Avoid too many required fields, too many approval layers, mandatory complex processes." The flow is: Upload → Validate → Publish. Keep it that simple.

5. **Speed matters** — The target is document retrieval in under 10 seconds. Keep the UI fast with client-side search/filter for mock data.

6. **Every clickable element must navigate** — All stat cards, table rows, sidebar items, breadcrumbs, browse links, and document cards must link to their respective routes. No dead ends.
