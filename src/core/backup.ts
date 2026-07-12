import { storage } from "./storage.js";
import { state } from "./state.js";
import { translations } from "../utils/i18n.js";
import { z } from "zod";

const todoSchema = z.object({
  text: z.string(),
  completed: z.boolean(),
  repeat: z.enum(["none", "daily", "weekly", "monthly"]),
  status: z.enum(["todo", "in-progress", "done"]),
  category: z.string().optional().default("general"),
  lastCompletedDate: z.string().optional().default(""),
});

const todoListSchema = z.array(todoSchema);

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
      const parsed = JSON.parse(ev.target?.result as string);
      const validation = todoListSchema.safeParse(parsed);

      if (validation.success) {
        await storage.setTodos(validation.data);
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
