import { storage } from "./storage.js";
import { state } from "./state.js";
import { translations } from "../utils/i18n.js";

export async function handleBackup(): Promise<void> {
  const todos = await storage.getTodos();
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

export async function handleRestore(
  e: Event,
  reloadTodos: () => void,
): Promise<void> {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }
  const r = new FileReader();
  r.onload = async (ev) => {
    try {
      const t = JSON.parse(ev.target?.result as string);
      if (Array.isArray(t)) {
        await storage.setTodos(t);
        reloadTodos();
        alert(translations[state.currentLang].alert_restore_success);
      } else {
        alert(translations[state.currentLang].alert_restore_invalid);
      }
    } catch {
      alert(translations[state.currentLang].alert_restore_error);
    }
    input.value = "";
  };
  r.readAsText(input.files[0]);
}
