import type { WebSearchSource } from "../webSearchAgent.js";
import type { IAiConfigRepository } from "@/domain/repositories/IAiConfigRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";

export interface ChatAttachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document" | "code";
  mimeType: string;
  size: number;
  dataUrl?: string; // Base64 data URL for images and PDFs
  textContent?: string; // Text content for text/code/json/csv documents
  previewUrl?: string; // Thumbnail preview URL (for images)
}

export interface ClarificationOption {
  label: string;
  value: string;
  description?: string;
}

export interface ClarificationRequest {
  id: string;
  question: string;
  options?: Array<string | ClarificationOption>;
  allowFreeText?: boolean;
  context?: string;
  resolved?: boolean;
  selectedAnswer?: string;
}

export interface QueuedMessage {
  id: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface ChatSessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
  clarification?: ClarificationRequest;
}

export interface ChatSession {
  id: string;
  scope: "sidepanel" | "newtab";
  tabId?: number;
  domain?: string;
  url?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatSessionMessage[];
}

export interface AICallParams {
  userPrompt: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  enableWebSearch?: boolean;
  attachments?: ChatAttachment[];
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  onChunk?: (accumulatedText: string, delta: string) => void;
  signal?: AbortSignal;
}

export interface AIResponseData {
  reply: string;
  action?: string;
  params: Record<string, unknown> | null;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
  clarification?: ClarificationRequest;
}

export interface AiChatDependencies {
  aiConfigRepo: IAiConfigRepository;
  memoryRepo: IMemoryRepository;
  todoRepo: ITodoRepository;
  noteRepo: INoteRepository;
}

export type {
  INoteRepository,
  IMemoryRepository,
  ITodoRepository,
  IAiConfigRepository,
};
