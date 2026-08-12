/**
 * useStockRules.ts
 * BIST alarm kuralları state + CRUD.
 * Alt-hook — tuval (useBist.ts) orkestrasyonu yapar.
 */

import { useCallback, useState } from "preact/hooks";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import type { StockRule } from "@/types/stock.js";

export function useStockRules(stockRepository: IStockRepository) {
  const [rules, setRules] = useState<StockRule[]>([]);

  const activeCount = rules.filter((r) => r.isActive).length;

  const saveRule = useCallback(
    async (ruleData: Omit<StockRule, "id" | "createdAt">) => {
      const fullRule: StockRule = {
        id: (ruleData as StockRule).id || `rule-${Date.now()}`,
        createdAt:
          (ruleData as StockRule).createdAt || new Date().toISOString(),
        ...ruleData,
      };
      const existingIdx = rules.findIndex((r) => r.id === fullRule.id);
      let updated: StockRule[];
      if (existingIdx >= 0) {
        updated = [...rules];
        updated[existingIdx] = fullRule;
      } else {
        updated = [...rules, fullRule];
      }
      setRules(updated);
      await stockRepository.saveRules(updated);
    },
    [rules, stockRepository],
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      const updated = rules.filter((r) => r.id !== ruleId);
      setRules(updated);
      await stockRepository.saveRules(updated);
    },
    [rules, stockRepository],
  );

  return {
    rules,
    setRules,
    activeRulesCount: activeCount,
    saveRule,
    deleteRule,
  };
}
