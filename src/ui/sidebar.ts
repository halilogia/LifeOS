import { elements } from "./dom.js";
import { storage } from "../core/storage.js";

export function initSidebar(): void {
  elements.sidebarToggle().addEventListener("click", async () => {
    const isOpen = document.body.classList.toggle("sidebar-open");
    await storage.setSidebarOpen(isOpen);
  });

  document.addEventListener("click", (e) => {
    if (
      document.body.classList.contains("sidebar-open") &&
      !elements.sidebar().contains(e.target as Node) &&
      !elements.sidebarToggle().contains(e.target as Node) &&
      window.innerWidth < 1200
    ) {
      document.body.classList.remove("sidebar-open");
      storage.setSidebarOpen(false);
    }
  });
}
