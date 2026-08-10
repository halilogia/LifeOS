/**
 * history/index.ts
 * Tarih haritası ve ünitelerinin merkezi dışa aktarım modülü.
 */

import type { HistoryUnit } from "./types.js";
import { SELCUKLU_UNIT } from "./selcukluUnit.js";
import { OSMANLI_KURULUS_UNIT } from "./osmanliKurulusUnit.js";
import { OSMANLI_YUKSELME_UNIT } from "./osmanliYukselmeUnit.js";
import { OSMANLI_DURAKLAMA_UNIT } from "./osmanliDuraklamaUnit.js";
import { OSMANLI_GERILEME_UNIT } from "./osmanliGerilemeUnit.js";
import { OSMANLI_DAGILMA_UNIT } from "./osmanliDagilmaUnit.js";
import { OSMANLI_TESKILAT_UNIT, SELCUKLU_TESKILAT_UNIT } from "./osmanliTeskilatUnit.js";
import { EKONOMI_UNIT, KULTUR_UNIT } from "./ekonomiKulturUnit.js";
import { BEYLIKLER_UNIT } from "./beyliklerUnit.js";

export * from "./types.js";
export * from "./selcukluUnit.js";
export * from "./osmanliKurulusUnit.js";
export * from "./osmanliYukselmeUnit.js";
export * from "./osmanliDuraklamaUnit.js";
export * from "./osmanliGerilemeUnit.js";
export * from "./osmanliDagilmaUnit.js";
export * from "./osmanliTeskilatUnit.js";
export * from "./ekonomiKulturUnit.js";
export * from "./beyliklerUnit.js";

export const HISTORY_UNITS: HistoryUnit[] = [
  SELCUKLU_UNIT,
  OSMANLI_KURULUS_UNIT,
  OSMANLI_YUKSELME_UNIT,
  OSMANLI_DURAKLAMA_UNIT,
  OSMANLI_GERILEME_UNIT,
  OSMANLI_DAGILMA_UNIT,
  OSMANLI_TESKILAT_UNIT,
  SELCUKLU_TESKILAT_UNIT,
  EKONOMI_UNIT,
  KULTUR_UNIT,
  BEYLIKLER_UNIT,
];
