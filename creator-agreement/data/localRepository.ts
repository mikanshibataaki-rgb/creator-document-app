import { initialContent } from "@/domain/defaults";
import type {
  AgreementContent,
  AgreementVersion,
  GeneratedFile,
  Party,
  Project,
  PrototypeDatabase,
  Recipient,
  ShareLink,
  Signature,
  TimelineEvent,
  TimelineEventType,
} from "@/domain/schema";

const STORAGE_KEY = "creator-agreement:database:v2";

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createEvent(
  projectId: string,
  agreementVersionId: string,
  eventType: TimelineEventType,
  label: string,
  actorType: TimelineEvent["actorType"] = "system",
  eventData: Record<string, string> = {},
): TimelineEvent {
  return { id: createId("event"), projectId, agreementVersionId, eventType, label, actorType, eventData, occurredAt: nowIso() };
}

function seedDatabase(): PrototypeDatabase {
  const createdAt = nowIso();
  const projectId = createId("project");
  const versionId = createId("version");
  const project: Project = {
    id: projectId,
    projectNumber: "CA-2026-001",
    managerProjectId: initialContent.managerProjectId,
    title: initialContent.projectName,
    category: initialContent.category,
    status: "下書き",
    currentVersionId: versionId,
    versionNumber: 1,
    nextReminderAt: "2026-06-28T10:00:00+09:00",
    createdAt,
    updatedAt: createdAt,
  };
  const version: AgreementVersion = {
    id: versionId,
    projectId,
    versionNumber: 1,
    content: initialContent,
    contentHash: "",
    createdBy: "sender",
    createdAt,
    lockedAt: "",
    replacedAt: "",
  };
  return {
    projects: [project],
    parties: [],
    agreementVersions: [version],
    shareLinks: [],
    recipients: [],
    signatures: [],
    timelineEvents: [createEvent(projectId, versionId, "project_created", "案件を作成しました", "sender")],
    generatedFiles: [],
  };
}

export function loadDatabase(): PrototypeDatabase {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as PrototypeDatabase;
  } catch {}
  return seedDatabase();
}

export function saveDatabase(database: PrototypeDatabase) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function resetDatabase() {
  const database = seedDatabase();
  saveDatabase(database);
  return database;
}

export function getContent(database: PrototypeDatabase, project: Project): AgreementContent {
  return database.agreementVersions.find((version) => version.id === project.currentVersionId)?.content ?? initialContent;
}

export type DatabaseRecord = Project | Party | AgreementVersion | ShareLink | Recipient | Signature | TimelineEvent | GeneratedFile;
