/**
 * IAiConfigRepository Interface
 * Repository pattern for AI configuration persistence.
 * Covers sync + local storage fallback for provider, API key, model, endpoint settings.
 * Domain layer — pure interface.
 */

export interface AiConfig {
  readonly aiProvider: string;
  readonly aiApiKey: string;
  readonly aiModel: string;
  readonly aiEndpoint: string;
  readonly aiShowThinking: boolean;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  aiProvider: "openrouter",
  aiApiKey: "",
  aiModel: "free",
  aiEndpoint: "http://localhost:20128/v1",
  aiShowThinking: true,
};

export interface IAiConfigRepository {
  /** Load AI config with fallback: tries sync, then local, then defaults. */
  getConfig(): Promise<AiConfig>;
}
