/**
 * aiFeatureRegistry.ts
 * Central Extensible AI Feature Registry for LifeOS.
 * Allows any domain module (existing or future) to register context providers,
 * tool actions, and visual chat badges without modifying core AI chat logic.
 * Clean Architecture - AI Service Layer.
 */

import type {
  AiFeaturePlugin,
  AiFeatureActionDefinition,
  AiActionExecutionContext,
  AiActionResult,
} from "./types.js";
import { logger } from "@/utils/logger.js";

export class AiFeatureRegistry {
  private static instance: AiFeatureRegistry | null = null;
  private plugins: Map<string, AiFeaturePlugin> = new Map();

  public static getInstance(): AiFeatureRegistry {
    if (!AiFeatureRegistry.instance) {
      AiFeatureRegistry.instance = new AiFeatureRegistry();
    }
    return AiFeatureRegistry.instance;
  }

  /**
   * Registers a new AI feature plugin.
   * If a plugin with the same ID already exists, it is replaced with the new definition.
   */
  public registerPlugin(plugin: AiFeaturePlugin): void {
    this.plugins.set(plugin.id, plugin);
    logger.info(`[AiFeatureRegistry] Registered plugin: "${plugin.name}" (${plugin.id})`);
  }

  /**
   * Unregisters a plugin by ID.
   */
  public unregisterPlugin(id: string): boolean {
    return this.plugins.delete(id);
  }

  /**
   * Gets a registered plugin by ID.
   */
  public getPlugin(id: string): AiFeaturePlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Returns all registered plugins as an array.
   */
  public getAllPlugins(): AiFeaturePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Finds the action definition and its parent plugin by action name.
   */
  public getAction(
    actionName: string,
  ): { plugin: AiFeaturePlugin; action: AiFeatureActionDefinition } | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.actions) {
        const found = plugin.actions.find((a) => a.name === actionName);
        if (found) {
          return { plugin, action: found };
        }
      }
    }
    return undefined;
  }

  /**
   * Dispatches and executes an action dynamically using registered handlers.
   */
  public async executeAction(
    actionName: string,
    params: Record<string, unknown>,
    context: AiActionExecutionContext,
  ): Promise<AiActionResult> {
    const match = this.getAction(actionName);
    if (!match) {
      logger.warn(`[AiFeatureRegistry] No action handler found for: "${actionName}"`);
      return {
        success: false,
        message: `Bilinmeyen eylem: ${actionName}`,
      };
    }

    try {
      logger.info(
        `[AiFeatureRegistry] Executing action "${actionName}" via plugin "${match.plugin.name}"`,
      );
      const result = await match.action.execute(params, context);
      return result;
    } catch (err) {
      logger.error(`[AiFeatureRegistry] Action "${actionName}" execution failed:`, err);
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Dynamically constructs the CAPABILITIES & ACTIONS block for the system prompt
   * by introspecting all registered plugins and their actions.
   */
  public generateCapabilitiesPrompt(): string {
    const lines: string[] = [
      "CAPABILITIES & ACTIONS:",
      "1. Answering questions thoroughly, concisely, and accurately.",
    ];

    let actionIndex = 2;

    for (const plugin of this.plugins.values()) {
      if (!plugin.actions || plugin.actions.length === 0) continue;

      for (const act of plugin.actions) {
        const jsonExample = JSON.stringify(
          {
            action: act.name,
            params: act.parametersExample,
          },
          null,
          2,
        );

        lines.push(
          `${actionIndex}. ${act.description}:\n\`\`\`json\n${jsonExample}\n\`\`\``,
        );
        actionIndex++;
      }
    }

    // Clarification action is standard across all modes
    lines.push(
      `${actionIndex}. Clarification / Asking the user a question:
   When the user's request has critical ambiguity where multiple reasonable choices exist:
\`\`\`json
{
  "action": "clarification",
  "params": {
    "question": "Soru metni",
    "options": ["Seçenek 1", "Seçenek 2"],
    "allowFreeText": true,
    "context": "konu_anahtarı"
  }
}
\`\`\``,
    );

    return lines.join("\n\n");
  }

  /**
   * Asynchronously gathers live context snapshots across all registered plugins in parallel.
   */
  public async gatherAllContextSnapshots(
    context: AiActionExecutionContext,
  ): Promise<string> {
    const pluginsWithContext = Array.from(this.plugins.values()).filter(
      (p) => typeof p.getContextSnapshot === "function",
    );

    if (pluginsWithContext.length === 0) {
      return "";
    }

    const results = await Promise.allSettled(
      pluginsWithContext.map(async (p) => {
        try {
          const snapshot = await p.getContextSnapshot!(context);
          return snapshot ? snapshot.trim() : null;
        } catch (err) {
          logger.warn(
            `[AiFeatureRegistry] Error gathering snapshot from "${p.name}":`,
            err,
          );
          return null;
        }
      }),
    );

    const validSnapshots: string[] = [];
    results.forEach((res) => {
      if (res.status === "fulfilled" && res.value) {
        validSnapshots.push(res.value);
      }
    });

    if (validSnapshots.length === 0) {
      return "";
    }

    return [
      "\n--- 📊 CANLI KULLANICI & DASHBOARD SİSTEM BAĞLAMI ---",
      ...validSnapshots,
    ].join("\n\n");
  }

  /**
   * Resets registry to empty (primarily for isolated test fixtures).
   */
  public clear(): void {
    this.plugins.clear();
  }
}

export const aiFeatureRegistry = AiFeatureRegistry.getInstance();
