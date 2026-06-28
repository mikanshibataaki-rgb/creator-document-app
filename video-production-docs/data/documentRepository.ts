import type { Client, ProjectDocument, SavedDocumentRecord } from "@/domain/types";

export interface DocumentRepository {
  load(): Promise<ProjectDocument | null>;
  save(document: ProjectDocument): Promise<void>;
  loadClients(): Promise<Client[]>;
  saveClients(clients: Client[]): Promise<void>;
  loadRecords(): Promise<SavedDocumentRecord[]>;
  saveRecords(records: SavedDocumentRecord[]): Promise<void>;
  clearAll(): Promise<void>;
}

const DOCUMENT_KEY = "video-docs:current:v1";
const CLIENTS_KEY = "video-docs:clients:v1";
const RECORDS_KEY = "video-docs:records:v1";

export const localDocumentRepository: DocumentRepository = {
  async load() { const value = localStorage.getItem(DOCUMENT_KEY); return value ? JSON.parse(value) : null; },
  async save(document) { localStorage.setItem(DOCUMENT_KEY, JSON.stringify(document)); },
  async loadClients() { const value = localStorage.getItem(CLIENTS_KEY); return value ? JSON.parse(value) : []; },
  async saveClients(clients) { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); },
  async loadRecords() { const value = localStorage.getItem(RECORDS_KEY); return value ? JSON.parse(value) : []; },
  async saveRecords(records) { localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); },
  async clearAll() {
    localStorage.removeItem(DOCUMENT_KEY);
    localStorage.removeItem(CLIENTS_KEY);
    localStorage.removeItem(RECORDS_KEY);
  },
};
