import type { Client, ProjectDocument } from "@/domain/types";

export interface DocumentRepository {
  load(): Promise<ProjectDocument | null>;
  save(document: ProjectDocument): Promise<void>;
  loadClients(): Promise<Client[]>;
  saveClients(clients: Client[]): Promise<void>;
}

const DOCUMENT_KEY = "video-docs:current:v1";
const CLIENTS_KEY = "video-docs:clients:v1";

export const localDocumentRepository: DocumentRepository = {
  async load() { const value = localStorage.getItem(DOCUMENT_KEY); return value ? JSON.parse(value) : null; },
  async save(document) { localStorage.setItem(DOCUMENT_KEY, JSON.stringify(document)); },
  async loadClients() { const value = localStorage.getItem(CLIENTS_KEY); return value ? JSON.parse(value) : []; },
  async saveClients(clients) { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); },
};
