/**
 * index.ts
 * Barrel export & initializer for the Extensible AI Feature Registry.
 * Clean Architecture - AI Service Layer.
 */

import { aiFeatureRegistry } from "./aiFeatureRegistry.js";
import type {
  AiFeaturePlugin,
  AiFeatureActionDefinition,
  AiActionExecutionContext,
  AiActionResult,
  AiBadgeRenderInfo,
} from "./types.js";

import { navigationPlugin } from "./plugins/navigationPlugin.js";
import { tasksPlugin } from "./plugins/tasksPlugin.js";
import { mediaVaultPlugin } from "./plugins/mediaVaultPlugin.js";
import { pomodoroPlugin } from "./plugins/pomodoroPlugin.js";
import { routinesPlugin } from "./plugins/routinesPlugin.js";
import { bistPlugin } from "./plugins/bistPlugin.js";
import { prayerPlugin } from "./plugins/prayerPlugin.js";
import { kpssPlugin } from "./plugins/kpssPlugin.js";
import { notesPlugin } from "./plugins/notesPlugin.js";
import { memoryPlugin } from "./plugins/memoryPlugin.js";

export * from "./types.js";
export { aiFeatureRegistry } from "./aiFeatureRegistry.js";

/**
 * Public developer-friendly helper to register any new LifeOS feature into the AI ecosystem.
 * When called, the feature automatically gains:
 * 1. AI System Prompt capability and schema exposure
 * 2. Live Dashboard context injection
 * 3. Dynamic action dispatching
 * 4. Visual execution badges in chat
 */
export function registerAiFeature(plugin: AiFeaturePlugin): void {
  aiFeatureRegistry.registerPlugin(plugin);
}

/**
 * Registers all core built-in LifeOS plugins into the AI feature registry.
 */
export function initDefaultAiPlugins(): void {
  registerAiFeature(navigationPlugin);
  registerAiFeature(tasksPlugin);
  registerAiFeature(mediaVaultPlugin);
  registerAiFeature(pomodoroPlugin);
  registerAiFeature(routinesPlugin);
  registerAiFeature(bistPlugin);
  registerAiFeature(prayerPlugin);
  registerAiFeature(kpssPlugin);
  registerAiFeature(notesPlugin);
  registerAiFeature(memoryPlugin);
}

// Auto-bootstrap defaults on initial module evaluation
initDefaultAiPlugins();
