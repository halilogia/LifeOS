/**
 * kpssDataRegistry.ts
 * Lazy-loadable KPSS past exam question data registry.
 * Uses dynamic imports to keep 2.8MB JSON out of the main JS bundle.
 * Data files live in: src/services/kpss/data/
 */

const YEAR_FILES: Record<string, () => Promise<Record<string, unknown[]>>> = {
  "2021": () =>
    import("./exam2021.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2020": () =>
    import("./exam2020.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2019": () =>
    import("./exam2019.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2018": () =>
    import("./exam2018.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2017": () =>
    import("./exam2017.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2015": () =>
    import("./exam2015.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2014": () =>
    import("./exam2014.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2013": () =>
    import("./exam2013.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2012": () =>
    import("./exam2012.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2011": () =>
    import("./exam2011.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2010": () =>
    import("./exam2010.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
  "2009": () =>
    import("./exam2009.json").then(
      (m) => (m as { default: Record<string, unknown[]> }).default,
    ),
};

/** Available exam year keys (static, ~200 bytes — no JSON loaded). */
export const AVAILABLE_EXAM_YEARS = Object.keys(YEAR_FILES);

/**
 * Lazy-loads a single exam year's question data.
 * Each call triggers a dynamic import() — Vite code-splits each JSON into its own chunk.
 */
export async function loadExamYearData(
  year: string,
): Promise<Record<string, unknown[]>> {
  const loader = YEAR_FILES[year];
  if (!loader) {
    throw new Error(`Unknown exam year: ${year}`);
  }
  return loader();
}

/**
 * Lazy-loads ALL exam year data at once.
 * Use sparingly — only when you truly need every year.
 */
export async function loadAllExamData(): Promise<
  Record<string, Record<string, unknown[]>>
> {
  const entries = await Promise.all(
    Object.entries(YEAR_FILES).map(async ([year, loader]) => [
      year,
      await loader(),
    ]),
  );
  return Object.fromEntries(entries);
}
