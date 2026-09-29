export type ChipStatus = "ok" | "warn" | "neutral" | "info";

export type Period = "day" | "week" | "month" | "year";
export type PeriodSelection = Period | "custom";

export interface PeriodStat {
  value: string;
  sub: string;
}

export interface AgingSegment {
  label: string;
  amount: string;
  percent: number;
  color: string;
}

export interface CarrierAging {
  name: string;
  amount: string;
  segments: { percent: number; color: string }[];
}

export interface FieldRowData {
  label: string;
  value: string;
  overdue?: boolean;
  linkLabel?: string;
}

export interface CaseChip {
  id: string;
  status: ChipStatus;
  text: string;
  okText?: string;
}

export interface AiInsight {
  patternLabel: string;
  pattern: string;
  suggestedNoteLabel: string;
  suggestedNote: string;
  insertable?: boolean;
  /** Button text before copying, e.g. "Copy to F9 Note". Defaults to "Copy to Clipboard". */
  copyLabel?: string;
  /** Edit-modal heading, e.g. "Edit F9 Note". Defaults to "Edit Note". */
  modalTitle?: string;
}

export interface AdjusterCase {
  id: string;
  claimRef: string;
  carrier: string;
  flag?: string;
  fields: FieldRowData[];
  chips: CaseChip[];
  actionOptions: string[];
  actionVariant?: "urgent" | "primary" | "default";
  resolveChipId?: string;
  aiInsight?: AiInsight;
}

export type AdjusterStatusFilter = "all" | "open" | "resolved";

export interface ReferralPartner {
  id: string;
  name: string;
  rank: number;
  fields: FieldRowData[];
  feeStatus: "pending" | "paid";
  pendingAmount?: number;
  checkRef?: string;
}

/** Served by GET /api/profile */
export interface ProfileData {
  brandName: string;
  location: string;
  notificationCount: number;
  avatarInitial: string;
}

/** Served by GET /api/executive */
export interface ExecutiveData {
  totalAr: { value: string; sub: string; tag?: string; dso: { value: string; target: string } };
  criticalAr: { value: string; sub: string; tag?: string };
  periodStats: Record<Period, PeriodStat>;
  agingSegments: AgingSegment[];
  agingNote: string;
  carriers: CarrierAging[];
  carrierInsight?: AiInsight;
}

/** Served by GET /api/adjuster-cases */
export type AdjusterCasesData = AdjusterCase[];

/** Served by GET /api/referral-partners */
export interface ReferralData {
  partners: ReferralPartner[];
  referralInsight?: AiInsight;
}

/** Served by GET /api/health */
export interface HealthStatus {
  status: "ok" | "down";
  timestamp: string;
  uptimeSeconds: number;
}

/** Served by GET and POST /api/toggle — the mock API's on/off kill switch */
export interface ApiToggleState {
  enabled: boolean;
}

/** The assembled shape DashboardShell renders — combined client-side from the four API responses above. */
export interface DashboardData extends ProfileData, ExecutiveData, ReferralData {
  cases: AdjusterCase[];
}
