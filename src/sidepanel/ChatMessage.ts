import type {
  ChatAttachment,
  ClarificationRequest,
} from "@/services/aichat/types.js";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  clarification?: ClarificationRequest;
}
