import { z } from 'zod';
export function safeValidate<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  fallback: T,
  contextName: string,
): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }
  const sample =
    typeof data === 'object' && data !== null
      ? JSON.stringify(data).substring(0, 200)
      : String(data).substring(0, 200);
  console.error(`[Data Integrity Error] ${contextName}: Validation failed!`, {
    errors: result.error.format(),
    dataSample: sample,
  });
  return fallback;
}
export function safeValidateList<T>(
  data: unknown,
  itemSchema: z.ZodSchema<T>,
  contextName: string,
  options: { strict?: boolean } = { strict: true },
): T[] {
  if (!Array.isArray(data)) {
    console.error(`[Data Integrity Error] ${contextName}: Expected array, got ${typeof data}`);
    return [];
  }

  // Performance Optimization: Skip full validation in production for non-strict contexts
  const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
  if (isProd && !options.strict) {
    return data as T[];
  }

  const validItems: T[] = [];
  let invalidCount = 0;

  data.forEach((item, index) => {
    const result = itemSchema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    } else {
      invalidCount++;
      if (invalidCount <= 3) {
        console.warn(
          `[Data Integrity Warn] ${contextName}[${index}]: Item invalid.`,
          result.error.format(),
        );
      }
    }
  });

  if (invalidCount > 0) {
    console.error(`[Data Integrity Summary] ${contextName}: ${invalidCount} invalid items purged.`);
  }

  return validItems;
}
