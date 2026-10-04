/**
 * agentActionPolicy.test.ts
 * Comprehensive unit tests for Browser Agent Security & Action Policy Engine.
 */

import { describe, it, expect } from "vitest";
import {
  classifyAction,
  evaluateActionProposal,
  validateTabBinding,
  isElementEditable,
} from "@/services/aichat/agentActionPolicy.js";

describe("Agent Action Policy & Security Engine", () => {
  describe("classifyAction", () => {
    it("classifies click and type as MUTATING_SIDE_EFFECT", () => {
      expect(classifyAction("click")).toBe("MUTATING_SIDE_EFFECT");
      expect(classifyAction("type")).toBe("MUTATING_SIDE_EFFECT");
    });

    it("classifies scroll, extract, and highlight as READ_ONLY", () => {
      expect(classifyAction("scroll")).toBe("READ_ONLY");
      expect(classifyAction("extract")).toBe("READ_ONLY");
      expect(classifyAction("highlight")).toBe("READ_ONLY");
    });
  });

  describe("evaluateActionProposal", () => {
    it("requires user confirmation for mutating side effects (click/type)", () => {
      const proposal = [
        {
          actionType: "type",
          selector: "input[name='email']",
          textValue: "test@example.com",
        },
      ];

      const res = evaluateActionProposal(proposal);
      expect(res.allowed).toBe(true);
      expect(res.classification).toBe("MUTATING_SIDE_EFFECT");
      expect(res.requiresUserConfirmation).toBe(true);
      expect(res.sanitizedActions).toHaveLength(1);
    });

    it("allows read-only proposals without user confirmation", () => {
      const proposal = [
        {
          actionType: "scroll",
          direction: "down",
        },
        {
          actionType: "extract",
        },
      ];

      const res = evaluateActionProposal(proposal);
      expect(res.allowed).toBe(true);
      expect(res.classification).toBe("READ_ONLY");
      expect(res.requiresUserConfirmation).toBe(false);
      expect(res.sanitizedActions).toHaveLength(2);
    });

    it("rejects dangerous pseudo-protocols in selectors (e.g. javascript:)", () => {
      const proposal = [
        {
          actionType: "click",
          selector: "a[href='javascript:alert(1)']",
        },
      ];

      const res = evaluateActionProposal(proposal);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("Dangerous pseudo-protocol");
    });

    it("rejects proposals exceeding max action count (max 5)", () => {
      const proposal = Array(6).fill({
        actionType: "scroll",
        direction: "down",
      });

      const res = evaluateActionProposal(proposal);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("Maximum 5 actions allowed");
    });

    it("rejects unknown action types", () => {
      const proposal = [
        {
          actionType: "eval_script",
          selector: "body",
        },
      ];

      const res = evaluateActionProposal(proposal);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("Action validation failed");
    });
  });

  describe("validateTabBinding", () => {
    it("passes when tabs and URLs match or are undefined", () => {
      expect(validateTabBinding()).toEqual({ valid: true });
      expect(
        validateTabBinding({
          expectedTabId: 101,
          actualTabId: 101,
          expectedUrl: "https://example.com/checkout",
          actualUrl: "https://example.com/checkout",
        }),
      ).toEqual({ valid: true });
    });

    it("allows same-origin different-path only when exact URL is NOT required", () => {
      // Read-only default: origin match is sufficient
      expect(
        validateTabBinding({
          expectedTabId: 101,
          actualTabId: 101,
          expectedUrl: "https://example.com/checkout",
          actualUrl: "https://example.com/confirmation",
        }),
      ).toEqual({ valid: true });
    });

    it("rejects same-origin navigation when exact URL is required (mutating actions)", () => {
      const res = validateTabBinding(
        {
          expectedTabId: 101,
          actualTabId: 101,
          expectedUrl: "https://example.com/checkout",
          actualUrl: "https://example.com/confirmation",
        },
        { requireExactUrl: true },
      );
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("URL mismatch");
    });

    it("ignores hash fragments when comparing exact URLs", () => {
      expect(
        validateTabBinding(
          {
            expectedTabId: 101,
            actualTabId: 101,
            expectedUrl: "https://example.com/page#section-a",
            actualUrl: "https://example.com/page#section-b",
          },
          { requireExactUrl: true },
        ),
      ).toEqual({ valid: true });
    });

    it("fails when active tab ID changes", () => {
      const res = validateTabBinding({
        expectedTabId: 101,
        actualTabId: 102,
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Tab mismatch");
    });

    it("fails when origin changes across tabs", () => {
      const res = validateTabBinding({
        expectedTabId: 101,
        actualTabId: 101,
        expectedUrl: "https://trusted-site.com/profile",
        actualUrl: "https://malicious-site.com/login",
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Origin mismatch");
    });
  });

  describe("isElementEditable", () => {
    it("identifies legitimate input and textarea elements", () => {
      const input = { tagName: "input", type: "text" };
      expect(isElementEditable(input)).toBe(true);

      const textarea = { tagName: "TEXTAREA" };
      expect(isElementEditable(textarea)).toBe(true);

      const contentEditable = {
        tagName: "div",
        isContentEditable: true,
        getAttribute: (attr: string) => (attr === "contenteditable" ? "true" : null),
      };
      expect(isElementEditable(contentEditable)).toBe(true);

      const ariaTextbox = {
        tagName: "div",
        getAttribute: (attr: string) => (attr === "role" ? "textbox" : null),
      };
      expect(isElementEditable(ariaTextbox)).toBe(true);

      const quillEditor = {
        tagName: "div",
        classList: { contains: (cls: string) => cls === "ql-editor" },
      };
      expect(isElementEditable(quillEditor)).toBe(true);
    });

    it("rejects arbitrary div, p, span, and non-text inputs", () => {
      expect(isElementEditable(null)).toBe(false);
      expect(isElementEditable({})).toBe(false);

      const div = { tagName: "div" };
      expect(isElementEditable(div)).toBe(false);

      const p = { tagName: "p" };
      expect(isElementEditable(p)).toBe(false);

      const button = { tagName: "input", type: "button" };
      expect(isElementEditable(button)).toBe(false);

      const submit = { tagName: "input", type: "submit" };
      expect(isElementEditable(submit)).toBe(false);
    });
  });
});
