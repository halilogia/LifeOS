import { logger } from "@/utils/logger.js";

export function safeValidate<T>(
  data: unknown,
  _schema: unknown,
  fallback: T,
  contextName: string,
): T {
  // Simple check for existence since we removed zod for browser compatibility
  if (data !== undefined && data !== null) {
    return data as T;
  }
  logger.error(
    `[Data Integrity Error] ${contextName}: Validation failed (simple check)!`,
  );
  return fallback;
}

export function safeValidateList<T>(
  data: unknown,
  _itemSchema: unknown,
  contextName: string,
  _options: { strict?: boolean } = { strict: true },
): T[] {
  if (!Array.isArray(data)) {
    logger.error(
      `[Data Integrity Error] ${contextName}: Expected array, got ${typeof data}`,
    );
    return [];
  }

  return data as T[];
}
