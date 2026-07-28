/**
 * zettelkastenEngine.ts
 * Obsidian-style Zettelkasten Knowledge Graph Engine.
 * Extracts [[Internal Links]], #tags, backlinks, and computes 2D Graph View physics layout.
 */

import { Note } from "@/types/types.js";

export interface GraphNode {
  id: string;
  title: string;
  type: string; // note, cornell, diary
  tags: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  linksCount: number;
}

export interface GraphEdge {
  source: string; // node id
  target: string; // node id
  label?: string;
}

export interface ZettelkastenGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Extract all [[Internal Links]] from markdown note content.
 * e.g. "Daha fazla bilgi için [[Tarih - Amasya Genelgesi]] sayfasına bakın."
 */
export function extractInternalLinks(content: string): string[] {
  if (!content) return [];
  const regex = /\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      links.push(match[1].trim());
    }
  }
  return Array.from(new Set(links));
}

/**
 * Extract all hashtags from note content or cues/summary.
 * e.g. "#kpss/tarih", "#kpss/cografya", "#genel"
 */
export function extractTags(content: string): string[] {
  if (!content) return [];
  const regex = /(?:^|\s)#([a-zA-Z0-9_\/öçşğıüÖÇŞĞİÜ-]+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      tags.push(match[1].trim().toLowerCase());
    }
  }
  return Array.from(new Set(tags));
}

/**
 * Determine node color based on KPSS subject tags or category.
 */
export function getNodeColor(tags: string[]): string {
  const tagStr = tags.join(" ");
  if (tagStr.includes("kpss/tarih") || tagStr.includes("tarih")) return "#a855f7"; // Purple
  if (tagStr.includes("kpss/cografya") || tagStr.includes("cografya")) return "#10b981"; // Emerald
  if (tagStr.includes("kpss/vatandaslik") || tagStr.includes("vatandaslik")) return "#3b82f6"; // Blue
  if (tagStr.includes("kpss/turkce") || tagStr.includes("turkce")) return "#f59e0b"; // Amber
  if (tagStr.includes("kpss/matematik") || tagStr.includes("matematik")) return "#ef4444"; // Red
  if (tagStr.includes("kpss")) return "#8b5cf6"; // Violet
  return "#6366f1"; // Default Indigo
}

/**
 * Compute Backlinks: find all notes that link to target Note Title or ID.
 */
export function getBacklinks(targetNote: Note, allNotes: Note[]): Note[] {
  const targetTitleLower = targetNote.title.trim().toLowerCase();
  return allNotes.filter((n) => {
    if (n.id === targetNote.id) return false;
    const links = extractInternalLinks(n.content);
    return links.some((l) => l.trim().toLowerCase() === targetTitleLower);
  });
}

/**
 * Build 2D Knowledge Graph Nodes and Edges for canvas / SVG rendering.
 * Applies a deterministic circular force-directed layout simulation.
 */
export function buildKnowledgeGraph(
  notes: Note[],
  width = 800,
  height = 500,
): ZettelkastenGraph {
  if (notes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Title to ID map for link matching
  const titleToIdMap = new Map<string, string>();
  notes.forEach((n) => {
    titleToIdMap.set(n.title.trim().toLowerCase(), n.id);
  });

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Extract edges
  notes.forEach((note) => {
    const rawContent = `${note.content || ""} ${note.cues || ""} ${note.summary || ""}`;
    const internalLinks = extractInternalLinks(rawContent);

    internalLinks.forEach((linkTitle) => {
      const targetId = titleToIdMap.get(linkTitle.toLowerCase());
      if (targetId && targetId !== note.id) {
        const edgeKey = [note.id, targetId].sort().join("<->");
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({ source: note.id, target: targetId, label: linkTitle });
        }
      }
    });
  });

  // Calculate degrees (connections count) per node
  const degrees = new Map<string, number>();
  notes.forEach((n) => degrees.set(n.id, 0));
  edges.forEach((e) => {
    degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
    degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
  });

  // Initialize nodes in radial spiral
  const centerX = width / 2;
  const centerY = height / 2;
  const nodesCount = notes.length;

  const nodes: GraphNode[] = notes.map((n, idx) => {
    const angle = (idx / nodesCount) * Math.PI * 2 + (idx % 3) * 0.5;
    const radiusDist = 120 + (idx % 5) * 45;
    const rawContent = `${n.content || ""} ${n.cues || ""} ${n.summary || ""}`;
    const tags = extractTags(rawContent);
    const linkDeg = degrees.get(n.id) || 0;

    return {
      id: n.id,
      title: n.title,
      type: n.type || "note",
      tags,
      x: centerX + Math.cos(angle) * radiusDist,
      y: centerY + Math.sin(angle) * radiusDist,
      vx: 0,
      vy: 0,
      radius: Math.max(16, Math.min(32, 16 + linkDeg * 4)),
      color: getNodeColor(tags),
      linksCount: linkDeg,
    };
  });

  // Run 30 iterations of simple force attraction & repulsion layout
  for (let iter = 0; iter < 30; iter++) {
    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 180) {
          const force = (180 - dist) / dist * 1.5;
          n1.x -= dx * force * 0.1;
          n1.y -= dy * force * 0.1;
          n2.x += dx * force * 0.1;
          n2.y += dy * force * 0.1;
        }
      }
    }

    // Attraction along edges
    edges.forEach((e) => {
      const source = nodes.find((n) => n.id === e.source);
      const target = nodes.find((n) => n.id === e.target);
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.05;
        source.x += dx * force * 0.1;
        source.y += dy * force * 0.1;
        target.x -= dx * force * 0.1;
        target.y -= dy * force * 0.1;
      }
    });

    // Bound to viewport canvas area
    nodes.forEach((n) => {
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    });
  }

  return { nodes, edges };
}
