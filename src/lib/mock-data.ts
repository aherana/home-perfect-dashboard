import type { AdjusterCasesData, ExecutiveData, ProfileData, ReferralData } from "./types";

export const profileData: ProfileData = {
  brandName: "Home Perfect — Ops Command Center",
  location: "Temecula & Murrieta Ops",
  notificationCount: 3,
  avatarInitial: "A",
};

export const executiveData: ExecutiveData = {
  totalAr: {
    value: "$348,250",
    sub: "34 active claims",
    tag: "as of today",
    dso: { value: "DSO: 58 days", target: "industry target 42" },
  },
  criticalAr: { value: "$84,100", sub: "stuck with adjusters", tag: "as of today" },
  periodStats: {
    day: { value: "67%", sub: "2 signed / 3 dispatched · today" },
    week: { value: "75%", sub: "9 signed / 12 dispatched · this week" },
    month: { value: "78.2%", sub: "36 signed / 46 dispatched · this month" },
    year: { value: "76.8%", sub: "406 signed / 529 dispatched · this year" },
  },

  agingSegments: [
    { label: "Unbilled WIP", amount: "$48k", percent: 12.1, color: "#5C6A93" },
    { label: "0–30 days", amount: "$162k", percent: 40.9, color: "#2F9E6E" },
    { label: "31–60 days", amount: "$102k", percent: 25.8, color: "#4C8DBF" },
    { label: "61–90 days", amount: "$51k", percent: 12.9, color: "#C9622A" },
    { label: "90+ days", amount: "$33k", percent: 8.3, color: "#A23E2E" },
  ],
  agingNote:
    "Unbilled WIP ($48k) is emergency work already complete but not yet invoiced in QuickBooks — it's not counted in the $348,250 AR total above.",

  carriers: [
    {
      name: "State Farm",
      amount: "$112k",
      segments: [
        { percent: 17.9, color: "#2F9E6E" },
        { percent: 22.3, color: "#4C8DBF" },
        { percent: 17.9, color: "#C9622A" },
        { percent: 42.0, color: "#A23E2E" },
      ],
    },
    {
      name: "Farmers",
      amount: "$64k",
      segments: [
        { percent: 53.1, color: "#2F9E6E" },
        { percent: 31.3, color: "#4C8DBF" },
        { percent: 9.4, color: "#C9622A" },
        { percent: 6.3, color: "#A23E2E" },
      ],
    },
    {
      name: "Mercury",
      amount: "$42k",
      segments: [
        { percent: 71.4, color: "#2F9E6E" },
        { percent: 19.0, color: "#4C8DBF" },
        { percent: 7.1, color: "#C9622A" },
        { percent: 2.4, color: "#A23E2E" },
      ],
    },
    {
      name: "Auto Club",
      amount: "$38k",
      segments: [
        { percent: 73.7, color: "#2F9E6E" },
        { percent: 18.4, color: "#4C8DBF" },
        { percent: 5.3, color: "#C9622A" },
        { percent: 2.6, color: "#A23E2E" },
      ],
    },
  ],
  carrierInsight: {
    patternLabel: "Pattern",
    pattern: "State Farm's balance skews heavily red (90+ days) — the most stagnant carrier by dollar-weighted age.",
    suggestedNoteLabel: "Suggested action",
    suggestedNote:
      "Escalate the Temecula slab-leak claim (DASH-4821) to State Farm's claims manager this week — it's both your oldest open supplement and your largest red-bucket exposure.",
  },
};

export const adjusterCasesData: AdjusterCasesData = [
  {
    id: "DASH-4821",
    claimRef: "Claim # 04-9821-X9 · Temecula — Slab Leak (Cat 3)",
    carrier: "State Farm",
    flag: "9d overdue",
    fields: [
      { label: "Carrier", value: "State Farm", linkLabel: "State Farm claims" },
      { label: "Adjuster", value: "Dave Miller (Ext 401)", linkLabel: "Dave Miller contact" },
      { label: "Invoice amount", value: "$8,450.00" },
      { label: "Supplement", value: "#1 · $2,800 · pending review", overdue: true },
      { label: "Mortgage hold", value: "—" },
    ],
    chips: [
      { id: "chip-4821-mica", status: "ok", text: "MICA 4/4 Complete" },
      { id: "chip-4821-kahi", status: "ok", text: "Kahi 96h Verified" },
      { id: "chip-4821-coc", status: "warn", text: "COC Missing", okText: "COC Signed" },
    ],
    actionOptions: ["Draft Follow-up", "Generate Packet", "Request COC Signature", "View Claim", "✓ Mark Resolved"],
    actionVariant: "primary",
    resolveChipId: "chip-4821-coc",
    aiInsight: {
      patternLabel: "State Farm pattern",
      pattern: "commonly reduces equipment run-time line items on drying jobs over 72 hrs.",
      suggestedNoteLabel: "Suggested F9 note",
      suggestedNote:
        "Extended dry time required — elevated moisture readings in slab per IICRC S500 Ch.14; daily psychrometric logs attached (Kahi 96h, 3 dehus / 8 air movers).",
      insertable: true,
      copyLabel: "Copy to F9 Note",
      modalTitle: "Edit F9 Note",
    },
  },
  {
    id: "DASH-4835",
    claimRef: "Claim # AAA-2291-C4 · Murrieta — Supply Line (Cat 2)",
    carrier: "Auto Club (AAA)",
    flag: "Log due today",
    fields: [
      { label: "Carrier", value: "Auto Club (AAA)", linkLabel: "Auto Club (AAA) claims" },
      { label: "Adjuster", value: "Jessica Vance", linkLabel: "Jessica Vance contact" },
      { label: "Invoice amount", value: "$4,820.00" },
      { label: "Supplement", value: "No supplement filed" },
      { label: "Mortgage hold", value: "—" },
    ],
    chips: [
      { id: "chip-4835-log", status: "warn", text: "Day 2 Reading Needed", okText: "Day 2 Logged ✓" },
      { id: "chip-4835-coc", status: "neutral", text: "COC N/A — Active Drying" },
    ],
    actionOptions: ["Log Moisture", "Generate Packet", "View Claim", "✓ Mark Resolved"],
    actionVariant: "urgent",
    resolveChipId: "chip-4835-log",
    aiInsight: {
      patternLabel: "Auto Club (AAA) pattern",
      pattern: "rarely disputes active jobs, but resets file review if a daily psychrometric log posts late.",
      suggestedNoteLabel: "Suggested action",
      suggestedNote: "Log today's reading before end of day — this one's about staying ahead of the file, not defending it.",
      insertable: true,
    },
  },
  {
    id: "DASH-4789",
    claimRef: "Claim # FM-77410-B2 · Murrieta — Mold + Rebuild",
    carrier: "Farmers",
    fields: [
      { label: "Carrier", value: "Farmers", linkLabel: "Farmers claims" },
      { label: "Adjuster", value: "Craig Holloway", linkLabel: "Craig Holloway contact" },
      { label: "Invoice amount", value: "$18,200.00" },
      { label: "Supplement", value: "#2 · $4,650 · disputed", overdue: true },
      { label: "Mortgage hold", value: "Wells Fargo — packet sent" },
    ],
    chips: [
      { id: "chip-4789-mica", status: "ok", text: "MICA Archived" },
      { id: "chip-4789-dispute", status: "warn", text: "Line Items Disputed", okText: "Dispute Resolved" },
      { id: "chip-4789-coc", status: "ok", text: "COC Signed" },
    ],
    actionOptions: ["Review Dispute", "Draft Follow-up", "Generate Packet", "View Claim", "✓ Mark Resolved"],
    resolveChipId: "chip-4789-dispute",
    aiInsight: {
      patternLabel: "Farmers pattern",
      pattern: "frequently disputes drywall/rebuild supplements over $4k without itemized moisture-damage photos.",
      suggestedNoteLabel: "Suggested F9 note",
      suggestedNote:
        "Rebuild scope reflects moisture-damaged drywall beyond the mitigation boundary per attached photo log and MICA archive; replacement required per IICRC S500 antimicrobial protocol.",
      insertable: true,
      copyLabel: "Copy to F9 Note",
      modalTitle: "Edit F9 Note",
    },
  },
  {
    id: "DASH-4840",
    claimRef: "Claim # MC-55820-T1 · Murrieta — Commercial Loss",
    carrier: "Mercury",
    fields: [
      { label: "Carrier", value: "Mercury", linkLabel: "Mercury claims" },
      { label: "Adjuster", value: "Patricia Hall", linkLabel: "Patricia Hall contact" },
      { label: "Invoice amount", value: "$12,400.00" },
      { label: "Supplement", value: "Drafting" },
      { label: "Mortgage hold", value: "Chase — awaiting endorsement" },
    ],
    chips: [
      { id: "chip-4840-mica", status: "ok", text: "MICA 5/5 Complete" },
      { id: "chip-4840-kahi", status: "ok", text: "Kahi 120h Verified" },
      { id: "chip-4840-coc", status: "warn", text: "COC Missing", okText: "COC Signed" },
    ],
    actionOptions: ["Review for Billing", "Generate Packet", "Request COC Signature", "View Claim", "✓ Mark Resolved"],
    resolveChipId: "chip-4840-coc",
    aiInsight: {
      patternLabel: "Mercury pattern",
      pattern: "holds payment 30–45 days once a mortgage co-payee is on the check, regardless of file readiness.",
      suggestedNoteLabel: "Suggested action",
      suggestedNote: "Call Chase's Loss Draft department directly rather than waiting on Mercury — the bottleneck here is the bank, not the adjuster.",
      insertable: true,
    },
  },
];

export const referralData: ReferralData = {
  partners: [
    {
      id: "tvp",
      name: "Temecula Valley Plumbing",
      rank: 1,
      fields: [
        { label: "Leads sent", value: "6", linkLabel: "Leads from Temecula Valley Plumbing" },
        { label: "Closed jobs", value: "5", linkLabel: "Jobs closed via Temecula Valley Plumbing" },
        { label: "Win rate", value: "83%" },
        { label: "Avg ticket", value: "$8,460" },
        { label: "Revenue collected", value: "$42,300" },
      ],
      feeStatus: "pending",
      pendingAmount: 750,
    },
    {
      id: "mpp",
      name: "Murrieta Pro Plumbing",
      rank: 2,
      fields: [
        { label: "Leads sent", value: "5", linkLabel: "Leads from Murrieta Pro Plumbing" },
        { label: "Closed jobs", value: "4", linkLabel: "Jobs closed via Murrieta Pro Plumbing" },
        { label: "Win rate", value: "80%" },
        { label: "Avg ticket", value: "$7,788" },
        { label: "Revenue collected", value: "$31,150" },
      ],
      feeStatus: "paid",
      checkRef: "1042",
    },
    {
      id: "mdr",
      name: "Murrieta Drain & Rooter",
      rank: 3,
      fields: [
        { label: "Leads sent", value: "4", linkLabel: "Leads from Murrieta Drain & Rooter" },
        { label: "Closed jobs", value: "3", linkLabel: "Jobs closed via Murrieta Drain & Rooter" },
        { label: "Win rate", value: "75%" },
        { label: "Avg ticket", value: "$9,633" },
        { label: "Revenue collected", value: "$28,900" },
      ],
      feeStatus: "paid",
      checkRef: "1038",
    },
    {
      id: "appie",
      name: "All-Pro Plumbing Inland Empire",
      rank: 4,
      fields: [
        { label: "Leads sent", value: "3", linkLabel: "Leads from All-Pro Plumbing Inland Empire" },
        { label: "Closed jobs", value: "2", linkLabel: "Jobs closed via All-Pro Plumbing Inland Empire" },
        { label: "Win rate", value: "67%" },
        { label: "Avg ticket", value: "$9,800" },
        { label: "Revenue collected", value: "$19,600" },
      ],
      feeStatus: "pending",
      pendingAmount: 1000,
    },
  ],
  referralInsight: {
    patternLabel: "Pattern",
    pattern: "Temecula Valley Plumbing sends fewer leads than some partners but wins the most, at the highest ticket size.",
    suggestedNoteLabel: "Suggested action",
    suggestedNote:
      "Prioritize their spiff payout and check in personally — this is your highest-value referral relationship to protect, not just your busiest.",
  },
};
