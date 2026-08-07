/**
 * useAiUserMemory — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import {
  useAiUserMemoryState,
} from "@/presentation/store/aiUserMemoryStore.js";

export function useAiUserMemory() {
  const userMemory = useAiUserMemoryState((s) => s.userMemory);
  const setUserMemory = useAiUserMemoryState((s) => s.setUserMemory);
  const saveMemory = useAiUserMemoryState((s) => s.saveMemory);
  return { userMemory, setUserMemory, saveMemory };
}