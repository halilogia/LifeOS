import { describe, it, expect } from "vitest";
import { WEB_AGENT_TOOLS, buildAgentToolsPrompt } from "@/services/aichat/agentTools.js";

describe("agentTools module", () => {
  it("defines standard browser agent tools", () => {
    expect(WEB_AGENT_TOOLS.fill_form).toBeDefined();
    expect(WEB_AGENT_TOOLS.create_social_post).toBeDefined();
    expect(WEB_AGENT_TOOLS.click_element).toBeDefined();
    expect(WEB_AGENT_TOOLS.type_text).toBeDefined();
    expect(WEB_AGENT_TOOLS.scroll_page).toBeDefined();
    expect(WEB_AGENT_TOOLS.update_memory).toBeDefined();
    expect(WEB_AGENT_TOOLS.clarification).toBeDefined();
  });

  it("buildAgentToolsPrompt generates prompt with all tool schemas", () => {
    const prompt = buildAgentToolsPrompt();
    expect(prompt).toContain("## AVAILABLE AGENT TOOLS:");
    expect(prompt).toContain("### Tool: `fill_form`");
    expect(prompt).toContain("### Tool: `create_social_post`");
    expect(prompt).toContain("### Tool: `click_element`");
    expect(prompt).toContain("### Tool: `type_text`");
    expect(prompt).toContain("### Tool: `scroll_page`");
    expect(prompt).toContain("### Tool: `update_memory`");
    expect(prompt).toContain("### Tool: `clarification`");
  });
});
