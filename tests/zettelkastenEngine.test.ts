import { describe, it, expect } from "vitest";
import {
  extractInternalLinks,
  extractTags,
  getNodeColor,
  getBacklinks,
  buildKnowledgeGraph,
} from "@/services/zettelkastenEngine.js";
import { Note } from "@/types/types.js";

describe("Zettelkasten Knowledge Graph Engine Suite", () => {
  describe("extractInternalLinks", () => {
    it("should extract [[Wikilink]] note titles from content", () => {
      const text = "Daha fazla bilgi için [[Amasya Genelgesi]] ve [[Sivas Kongresi]] sayfasına bakın.";
      const links = extractInternalLinks(text);
      expect(links).toEqual(["Amasya Genelgesi", "Sivas Kongresi"]);
    });

    it("should extract [[Link|Alias]] handling piped aliases", () => {
      const text = "Detay için [[Erzurum Kongresi|Kongre Kararları]] inceleyin.";
      const links = extractInternalLinks(text);
      expect(links).toEqual(["Erzurum Kongresi"]);
    });

    it("should deduplicate internal links", () => {
      const text = "[[Tarih]] çalış, tekrar [[Tarih]] notlarına bak.";
      const links = extractInternalLinks(text);
      expect(links).toEqual(["Tarih"]);
    });

    it("should return empty array for empty input", () => {
      expect(extractInternalLinks("")).toEqual([]);
    });
  });

  describe("extractTags", () => {
    it("should extract #hashtags from text", () => {
      const text = "Bu ders notu #kpss/tarih ve #osmanlı hakkındadır.";
      const tags = extractTags(text);
      expect(tags).toContain("kpss/tarih");
      expect(tags).toContain("osmanlı");
    });

    it("should return lowercased unique tags", () => {
      const text = "#KPSS #kpss #Tarih";
      const tags = extractTags(text);
      expect(tags).toEqual(["kpss", "tarih"]);
    });

    it("should return empty array for text without hashtags", () => {
      expect(extractTags("Etiketsiz düz metin.")).toEqual([]);
    });
  });

  describe("getNodeColor", () => {
    it("should assign subject-specific colors based on tags and title", () => {
      expect(getNodeColor(["tarih"], "Tarih")).toBe("#a855f7"); // Purple
      expect(getNodeColor(["cografya"], "Coğrafya")).toBe("#10b981"); // Emerald
      expect(getNodeColor(["vatandaslik"], "Vatandaşlık")).toBe("#3b82f6"); // Blue
      expect(getNodeColor(["turkce"], "Türkçe")).toBe("#f59e0b"); // Amber
    });
  });

  describe("getBacklinks", () => {
    it("should find all notes linking to target note title", () => {
      const noteA: Note = {
        id: "note-1",
        title: "Amasya Genelgesi",
        content: "Amasya genelgesi maddeleri...",
        createdAt: new Date().toISOString(),
      };
      const noteB: Note = {
        id: "note-2",
        title: "Kurtuluş Savaşı",
        content: "Detaylar için [[Amasya Genelgesi]] notuna bakın.",
        createdAt: new Date().toISOString(),
      };

      const backlinks = getBacklinks(noteA, [noteA, noteB]);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0].id).toBe("note-2");
    });
  });

  describe("buildKnowledgeGraph", () => {
    it("should construct nodes and wikilink edges correctly", () => {
      const note1: Note = {
        id: "n1",
        title: "Osmanlı",
        content: "Bkz [[İstanbul'un Fethi]]",
        createdAt: new Date().toISOString(),
      };
      const note2: Note = {
        id: "n2",
        title: "İstanbul'un Fethi",
        content: "1453 yılında gerçekleşti.",
        createdAt: new Date().toISOString(),
      };

      const graph = buildKnowledgeGraph([note1, note2]);
      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0].type).toBe("wikilink");
    });
  });
});
