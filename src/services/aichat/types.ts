import type { WebSearchSource } from "../webSearchAgent.js";
import type { IAiConfigRepository } from "@/domain/repositories/IAiConfigRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";

export interface AICallParams {
  userPrompt: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  enableWebSearch?: boolean;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIResponseData {
  reply: string;
  action?: string;
  params: Record<string, unknown> | null;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
}

export interface AiChatDependencies {
  aiConfigRepo: IAiConfigRepository;
  memoryRepo: IMemoryRepository;
  todoRepo: ITodoRepository;
  noteRepo: INoteRepository;
}

export type { INoteRepository, IMemoryRepository, ITodoRepository, IAiConfigRepository };
