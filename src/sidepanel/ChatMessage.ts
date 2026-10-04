import type {
  ChatAttachment,
  ClarificationRequest,
} from "@/services/aichat/types.js";
import type { AgentActionPayload } from "@/services/aichat/agentActionPolicy.js";

export interface PendingActionApproval {
  id: string;
  actions: AgentActionPayload[];
  targetUrl?: string;
  targetTabId?: number;
  status: "pending" | "approved" | "rejected";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  clarification?: ClarificationRequest;
  pendingActionApproval?: PendingActionApproval;
}
