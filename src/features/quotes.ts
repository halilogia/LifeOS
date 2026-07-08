import { storage } from "@/core/storage.js";
import { elements } from "@/ui/dom.js";

export function initQuotes(): void {
  elements.addQuoteBtn().addEventListener("click", () => {
    openQuoteModal();
  });

  elements.quoteModalClose().addEventListener("click", () => {
    closeQuoteModal();
  });

  elements.saveQuoteBtn().addEventListener("click", async () => {
    await saveQuote();
  });

  elements.quoteModal().addEventListener("click", (e) => {
    if (e.target === elements.quoteModal()) {
      closeQuoteModal();
    }
  });
}

function openQuoteModal(): void {
  const modal = elements.quoteModal();
  elements.quoteContentInput().value = "";
  elements.quoteAuthorInput().value = "";
  modal.classList.add("active");
  elements.quoteContentInput().focus();
}

function closeQuoteModal(): void {
  elements.quoteModal().classList.remove("active");
}

async function saveQuote(): Promise<void> {
  const text = elements.quoteContentInput().value.trim();
  const author = elements.quoteAuthorInput().value.trim();

  if (!text) {
    closeQuoteModal();
    return;
  }

  const quotes = await storage.getCustomQuotes();
  quotes.push({
    text,
    author: author || undefined
  });

  await storage.setCustomQuotes(quotes);
  closeQuoteModal();
  
  // Show a small toast or feedback if possible, or just close
  // For now just close.
}
