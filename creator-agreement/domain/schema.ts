export type ProjectStatus = "下書き" | "送信済み" | "閲覧済み" | "同意済み" | "期限切れ" | "取消済み";
export type OptionalClauseState = "on" | "off" | "na";
export type PortfolioPermission = "" | "可" | "不可";
export type TimelineEventType =
  | "project_created"
  | "project_imported"
  | "project_duplicated"
  | "project_updated"
  | "version_locked"
  | "sender_confirmed"
  | "share_link_created"
  | "agreement_viewed"
  | "reminder_planned"
  | "verification_requested"
  | "email_verified"
  | "agreement_accepted"
  | "pdf_generated"
  | "version_replaced";

export interface AgreementContent {
  managerProjectId: string;
  projectName: string;
  category: string;
  clientName: string;
  clientEmail: string;
  creatorName: string;
  creatorEmail: string;
  commissionedAt: string;
  workDescription: string;
  deliverables: string;
  deliveryFormat: string;
  deliveryMethod: string;
  inScope: string;
  outOfScope: string;
  fee: string;
  taxTreatment: string;
  deliveryDate: string;
  deliveryPlace: string;
  paymentDue: string;
  paymentMethod: string;
  inspectionDays: string;
  revisionCount: string;
  additionalRevisionFee: string;
  reEditingFee: string;
  copyright: string;
  usageScope: string;
  portfolioPermission: PortfolioPermission;
  portfolioTiming: string;
  creditRequired: string;
  cancellation: string;
  dataRetention: string;
  accidentReport: boolean;
  delayNotice: boolean;
  weatherPostponementState: OptionalClauseState;
  weatherPostponement: string;
  locationPermitState: OptionalClauseState;
  locationPermit: string;
  portraitRightsState: OptionalClauseState;
  portraitRights: string;
  musicRightsState: OptionalClauseState;
  musicRights: string;
  liabilityLimit: string;
}

export interface Project {
  id: string;
  projectNumber: string;
  managerProjectId: string;
  title: string;
  category: string;
  status: ProjectStatus;
  currentVersionId: string;
  versionNumber: number;
  nextReminderAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  projectId: string;
  role: "client" | "creator";
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

export interface AgreementVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  content: AgreementContent;
  contentHash: string;
  createdBy: "sender";
  createdAt: string;
  lockedAt: string;
  replacedAt: string;
}

export interface ShareLink {
  id: string;
  agreementVersionId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string;
  createdAt: string;
}

export interface Recipient {
  id: string;
  agreementVersionId: string;
  name: string;
  email: string;
  verificationStatus: "未確認" | "確認待ち" | "確認済み";
  verifiedAt: string;
}

export interface Signature {
  id: string;
  agreementVersionId: string;
  recipientId: string;
  signatureType: "name";
  signerName: string;
  signatureData: string;
  agreedAt: string;
  agreementText: string;
  ipAddress: string;
  userAgent: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  agreementVersionId: string;
  eventType: TimelineEventType;
  label: string;
  actorType: "sender" | "recipient" | "system";
  eventData: Record<string, string>;
  occurredAt: string;
}

export interface GeneratedFile {
  id: string;
  agreementVersionId: string;
  fileType: "agreement_pdf";
  storagePath: string;
  fileHash: string;
  createdAt: string;
}

export interface PrototypeDatabase {
  projects: Project[];
  parties: Party[];
  agreementVersions: AgreementVersion[];
  shareLinks: ShareLink[];
  recipients: Recipient[];
  signatures: Signature[];
  timelineEvents: TimelineEvent[];
  generatedFiles: GeneratedFile[];
}

export interface AgreementCase {
  project: Project;
  content: AgreementContent;
}
