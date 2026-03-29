import {
  Clock,
  Users,
  Building2,
  ScrollText,
  FileCheck,
  ListChecks,
} from "lucide-react";

interface ServiceStep {
  step: number;
  clientAction: string;
  agencyAction: string;
  fees: string;
  time: string;
  responsible: string;
}

interface ServiceData {
  number: number;
  title: string;
  description: string;
  classification: string;
  transactionType: string;
  whoMayAvail: string;
  requirements: string[];
  totalTime: string;
  totalFees: string;
  steps: ServiceStep[];
}

const externalServices: ServiceData[] = [
  {
    number: 1,
    title:
      "Provision of Copies of Approved Ordinances, Resolutions, Minutes, Committee Reports, and Other Documents",
    description:
      "The Secretary keeps all approved legislative records. These are open to the public and can be requested.",
    classification: "Simple",
    transactionType: "G2B, G2C, G2G",
    whoMayAvail: "All",
    requirements: ["Request Form (1 copy)"],
    totalTime: "10 minutes",
    totalFees: "Php 3–5/page (hard); Certified: Php 5/page; Soft copy: Free",
    steps: [
      {
        step: 1,
        clientAction: "Fill out request form",
        agencyAction: "Verify availability & issue billing",
        fees: "None",
        time: "5 min",
        responsible: "Geraldine S. Silmaro / Assigned staff",
      },
      {
        step: 2,
        clientAction: "Pay at Treasurer's Office",
        agencyAction: "Process payment",
        fees: "Php 3–5/page (hard copy); Certified: Php 5/page; Soft copy: Free",
        time: "3 min",
        responsible: "Treasurer's Office staff",
      },
      {
        step: 3,
        clientAction: "Present official receipt",
        agencyAction: "Verify receipt & release document",
        fees: "None",
        time: "1 min",
        responsible: "Geraldine S. Silmaro",
      },
      {
        step: 4,
        clientAction: "Sign the logbook",
        agencyAction: "Log release of document",
        fees: "None",
        time: "1 min",
        responsible: "Geraldine S. Silmaro",
      },
    ],
  },
  {
    number: 2,
    title:
      "Copies of Journal, Transcriptions, Recordings, and Proceedings",
    description:
      "Includes session records, hearings, and consultations. Requires Vice Mayor approval.",
    classification: "Simple",
    transactionType: "G2C",
    whoMayAvail: "All",
    requirements: ["Request Letter", "Request Form", "Valid ID"],
    totalTime: "17 minutes",
    totalFees: "Php 2/page (hard); Certified: Php 5/page; Soft copy: Free",
    steps: [
      {
        step: 1,
        clientAction: "Submit request letter & form",
        agencyAction: "Receive & verify request",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for Vice Mayor approval",
        agencyAction: "Forward to Vice Mayor for approval",
        fees: "None",
        time: "5 min",
        responsible: "Vice Mayor's Office",
      },
      {
        step: 3,
        clientAction: "Pay at Treasurer's Office",
        agencyAction: "Process payment",
        fees: "Php 2/page (hard); Certified: Php 5/page; Soft copy: Free",
        time: "3 min",
        responsible: "Treasurer's Office staff",
      },
      {
        step: 4,
        clientAction: "Present receipt & claim document",
        agencyAction: "Verify receipt & release document",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
      {
        step: 5,
        clientAction: "Sign the logbook",
        agencyAction: "Log release",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
    ],
  },
  {
    number: 3,
    title: "Legislative Tracking Services",
    description: "Track status of legislative documents.",
    classification: "Simple",
    transactionType: "G2C",
    whoMayAvail: "All",
    requirements: ["Request Form"],
    totalTime: "10 minutes",
    totalFees: "Php 2/page (if printing); otherwise Free",
    steps: [
      {
        step: 1,
        clientAction: "Submit request form",
        agencyAction: "Receive & log request",
        fees: "None",
        time: "2 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for status check",
        agencyAction: "Check system for document status",
        fees: "None",
        time: "5 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Receive update or printed document",
        agencyAction: "Provide status update / print if needed",
        fees: "Php 2/page (if printing)",
        time: "3 min",
        responsible: "Assigned staff",
      },
    ],
  },
  {
    number: 4,
    title: "Receiving Documents for Agenda (Petitions, Requests, etc.)",
    description:
      "Documents are recorded and scheduled for legislative action.",
    classification: "Simple",
    transactionType: "G2C",
    whoMayAvail: "All",
    requirements: ["2 original copies of document"],
    totalTime: "5 minutes",
    totalFees: "None",
    steps: [
      {
        step: 1,
        clientAction: "Submit document (2 copies)",
        agencyAction: "Receive & verify completeness",
        fees: "None",
        time: "2 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for logging",
        agencyAction: "Log & assign reference number",
        fees: "None",
        time: "2 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Receive stamped copy",
        agencyAction: "Calendar for next session",
        fees: "None",
        time: "1 min",
        responsible: "Assigned staff",
      },
    ],
  },
  {
    number: 5,
    title: "Certification Services",
    description:
      "Issuance of certifications (publication, posting, etc.)",
    classification: "Simple",
    transactionType: "G2C",
    whoMayAvail: "All",
    requirements: ["Request Form or Letter"],
    totalTime: "17 minutes",
    totalFees: "Php 100 per certification",
    steps: [
      {
        step: 1,
        clientAction: "Submit request form / letter",
        agencyAction: "Receive & verify request",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for preparation",
        agencyAction: "Prepare certification document",
        fees: "None",
        time: "5 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Pay at Treasurer's Office",
        agencyAction: "Process payment",
        fees: "Php 100/certification",
        time: "5 min",
        responsible: "Treasurer's Office staff",
      },
      {
        step: 4,
        clientAction: "Present receipt & claim certification",
        agencyAction: "Release signed certification",
        fees: "None",
        time: "4 min",
        responsible: "Assigned staff",
      },
    ],
  },
  {
    number: 6,
    title: "Receiving Administrative Complaints",
    description: "Legal Basis: Local Government Code of 1991",
    classification: "Simple",
    transactionType: "G2C",
    whoMayAvail: "All",
    requirements: ["Verified complaint", "Supporting documents"],
    totalTime: "18 minutes",
    totalFees: "Filing Fee: Php 200; Summon Fee: Php 100/respondent",
    steps: [
      {
        step: 1,
        clientAction: "Submit verified complaint & documents",
        agencyAction: "Receive & verify completeness",
        fees: "None",
        time: "5 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for review",
        agencyAction: "Review complaint for sufficiency",
        fees: "None",
        time: "5 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Pay fees at Treasurer's Office",
        agencyAction: "Process payment",
        fees: "Php 200 (filing) + Php 100/respondent (summon)",
        time: "5 min",
        responsible: "Treasurer's Office staff",
      },
      {
        step: 4,
        clientAction: "Present receipt",
        agencyAction: "Attach receipt & docket complaint",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
    ],
  },
];

const internalServices: ServiceData[] = [
  {
    number: 1,
    title: "Receiving Committee Reports & Proposed Ordinances",
    description:
      "Submission of committee reports and proposed ordinances for legislative action.",
    classification: "Simple",
    transactionType: "Internal",
    whoMayAvail: "SP Members",
    requirements: ["3 copies of reports/ordinances"],
    totalTime: "11 minutes",
    totalFees: "None",
    steps: [
      {
        step: 1,
        clientAction: "Submit 3 copies of documents",
        agencyAction: "Receive & verify completeness",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for recording",
        agencyAction: "Record & assign number",
        fees: "None",
        time: "5 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Receive stamped copy",
        agencyAction: "Return acknowledged copy",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
    ],
  },
  {
    number: 2,
    title: "Use of Sandugo SP Session Hall",
    description:
      "Reservation of the Sandugo SP Session Hall for official purposes.",
    classification: "Simple",
    transactionType: "Internal",
    whoMayAvail: "City Hall staff",
    requirements: ["Reservation Slip (2 copies)"],
    totalTime: "10 minutes",
    totalFees: "None",
    steps: [
      {
        step: 1,
        clientAction: "Submit reservation slip (2 copies)",
        agencyAction: "Receive reservation request",
        fees: "None",
        time: "2 min",
        responsible: "Assigned staff",
      },
      {
        step: 2,
        clientAction: "Wait for availability check",
        agencyAction: "Check hall availability",
        fees: "None",
        time: "3 min",
        responsible: "Assigned staff",
      },
      {
        step: 3,
        clientAction: "Wait for approval",
        agencyAction: "SP Secretary approves/denies",
        fees: "None",
        time: "3 min",
        responsible: "SP Secretary",
      },
      {
        step: 4,
        clientAction: "Receive approved form",
        agencyAction: "Release approved reservation",
        fees: "None",
        time: "2 min",
        responsible: "Assigned staff",
      },
    ],
  },
];

export default function CitizensCharterPage() {
  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-light/80 to-navy" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm sm:mb-5 sm:h-14 sm:w-14">
            <ScrollText className="h-6 w-6 text-gold sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            SP Citizen&apos;s Charter
            <span className="mt-1 block text-[#cbab53]">January 2026</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-white/60 sm:mt-4 sm:text-base">
            Office of the Sangguniang Panlungsod Secretary
          </p>
        </div>
      </section>

      {/* External Services */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15">
              <Users className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                External Services
              </h2>
              <p className="text-sm text-muted-foreground">
                Services available to the general public
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {externalServices.map((service) => (
              <ServiceTable key={service.number} service={service} variant="external" />
            ))}
          </div>
        </div>
      </section>

      {/* Internal Services */}
      <section className="bg-amber-50/60 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Building2 className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Internal Services
              </h2>
              <p className="text-sm text-muted-foreground">
                Services for SP Members and City Hall staff
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {internalServices.map((service) => (
              <ServiceTable key={service.number} service={service} variant="internal" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceTable({
  service,
  variant,
}: Readonly<{
  service: ServiceData;
  variant: "external" | "internal";
}>) {
  const headerBg =
    variant === "external"
      ? "bg-[#162133] text-white"
      : "bg-[#5c4a1e] text-white";

  const metaBg =
    variant === "external"
      ? "bg-teal-50 border-teal-200"
      : "bg-amber-50 border-amber-200";

  const metaLabelColor =
    variant === "external" ? "text-teal-800" : "text-amber-800";

  const metaValueColor =
    variant === "external" ? "text-teal-700" : "text-amber-700";

  const stepHeaderBg =
    variant === "external"
      ? "bg-slate-100 text-slate-700"
      : "bg-amber-100/80 text-amber-900";

  const stripedEven =
    variant === "external" ? "even:bg-blue-50/50" : "even:bg-amber-50/40";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Service Title Header */}
      <div className={`px-5 py-4 sm:px-6 ${headerBg}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
            {service.number}
          </div>
          <div>
            <h3 className="text-base font-semibold sm:text-lg leading-snug">
              {service.title}
            </h3>
            <p className="mt-1 text-sm opacity-75">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Service Info Grid */}
      <div className={`grid grid-cols-2 gap-px border-b sm:grid-cols-4 ${metaBg}`}>
        <div className="bg-white px-4 py-3 sm:px-5">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${metaLabelColor}`}>
            Classification
          </p>
          <p className={`mt-0.5 text-sm font-medium ${metaValueColor}`}>
            {service.classification}
          </p>
        </div>
        <div className="bg-white px-4 py-3 sm:px-5">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${metaLabelColor}`}>
            Type of Transaction
          </p>
          <p className={`mt-0.5 text-sm font-medium ${metaValueColor}`}>
            {service.transactionType}
          </p>
        </div>
        <div className="bg-white px-4 py-3 sm:px-5">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${metaLabelColor}`}>
            Who May Avail
          </p>
          <p className={`mt-0.5 text-sm font-medium ${metaValueColor}`}>
            {service.whoMayAvail}
          </p>
        </div>
        <div className="bg-white px-4 py-3 sm:px-5">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${metaLabelColor}`}>
            Total Processing Time
          </p>
          <div className={`mt-0.5 flex items-center gap-1 text-sm font-medium ${metaValueColor}`}>
            <Clock className="h-3.5 w-3.5" />
            {service.totalTime}
          </div>
        </div>
      </div>

      {/* Requirements & Fees */}
      <div className="grid gap-px border-b border-slate-200 sm:grid-cols-2 bg-slate-100">
        <div className="bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileCheck className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Requirements
            </p>
          </div>
          <ul className="space-y-0.5">
            {service.requirements.map((req) => (
              <li key={req} className="flex items-start gap-1.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {req}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ListChecks className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Fees
            </p>
          </div>
          <p className="text-sm text-slate-700">{service.totalFees}</p>
        </div>
      </div>

      {/* Steps Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={stepHeaderBg}>
              <th className="w-14 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Step
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Client Action
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Agency Action
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Fees
              </th>
              <th className="w-16 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                Responsible Person
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {service.steps.map((step) => (
              <tr key={step.step} className={`${stripedEven} hover:bg-slate-50 transition-colors`}>
                <td className="px-4 py-3 text-center font-semibold text-slate-900">
                  {step.step}
                </td>
                <td className="px-4 py-3 text-slate-700">{step.clientAction}</td>
                <td className="px-4 py-3 text-slate-600">{step.agencyAction}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{step.fees}</td>
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  {step.time}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{step.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
