/**
 * types.ts
 * Type contracts for the Extensible AI Feature Registry.
 * Clean Architecture - Pure domain & application interfaces.
 * Zero 'any' policy strictly enforced.
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import type { IKpssRepository } from "@/domain/repositories/IKpssRepository.js";
import type { ComponentChildren } from "preact";

export interface AiActionExecutionContext {
  lang: string;
  todoRepo: ITodoRepository;
  noteRepo: INoteRepository;
  memoryRepo: IMemoryRepository;
  mediaRepo?: IMediaRepository;
  kpssRepo?: IKpssRepository;
  onManualSync?: () => Promise<void>;
}

export interface AiActionResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export interface AiBadgeRenderInfo {
  iconSvg?: ComponentChildren;
  label: string;
}

export interface AiFeatureActionDefinition {
  /** Unique action identifier matched in AI response JSON (e.g. "navigate_view", "control_pomodoro") */
  readonly name: string;
  /** Human & model readable description of what this action accomplishes */
  readonly description: string;
  /** JSON example schema to inject into the system prompt capabilities block */
  readonly parametersExample: Record<string, unknown>;
  /** Asynchronous execution handler */
  readonly execute: (
    params: Record<string, unknown>,
    context: AiActionExecutionContext,
  ) => Promise<AiActionResult>;
  /** Optional custom visual badge rendering for AI Chat message items */
  readonly renderBadge?: (
    params: Record<string, unknown>,
    t: Record<string, string>,
  ) => AiBadgeRenderInfo;
}

export interface AiFeaturePlugin {
  /** Unique plugin identifier (e.g. "pomodoro", "bist", "routines", "navigation") */
  readonly id: string;
  /** Human-readable title of the module */
  readonly name: string;
  /** Optional description */
  readonly description?: string;
  /** Asynchronously queries the module's state to provide a concise live dashboard context */
  readonly getContextSnapshot?: (
    context: AiActionExecutionContext,
  ) => Promise<string | null>;
  /** List of tool actions exposed by this plugin to the AI */
  readonly actions?: AiFeatureActionDefinition[];
}
