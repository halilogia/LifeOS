/**
 * agentTools.ts
 * Declarative Agent Tool Definitions & Registry for Life OS Web Copilot & Browser Agent.
 * Single Responsibility: Defines available browser and assistant tools with strict schemas,
 * descriptions, and system prompt generation.
 */

export interface AgentToolParam {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, AgentToolParam>;
  exampleUsage: string;
}

export const WEB_AGENT_TOOLS: Record<string, AgentToolDefinition> = {
  fill_form: {
    name: "fill_form",
    description:
      "Fills form input fields on the active web page using user's personal memory (memory.md) or specific values.",
    parameters: {
      actions: {
        type: "array",
        description: "Array of type actions targeting input/textarea/select elements.",
        required: true,
      },
    },
    exampleUsage: `\`\`\`json
[
  {
    "actionType": "type",
    "selector": "input[name='email']",
    "targetText": "Email",
    "textValue": "halilemrekuyupinar@proton.me"
  }
]
\`\`\``,
  },

  create_social_post: {
    name: "create_social_post",
    description:
      "Drafts and injects a post into social media post composers (LinkedIn, Twitter / X, Facebook, Reddit).",
    parameters: {
      actions: {
        type: "array",
        description:
          "Array of sequential actions to click the post trigger and type into the rich contenteditable editor.",
        required: true,
      },
    },
    exampleUsage: `\`\`\`json
[
  {
    "actionType": "click",
    "targetText": "Gönderi başlat",
    "selector": "button.share-box-feed-entry__trigger, button[aria-label*='gönderi'], button[aria-label*='post']"
  },
  {
    "actionType": "type",
    "selector": "div[contenteditable='true'], div[role='textbox'], .ql-editor",
    "targetText": "Ne hakkında konuşmak istiyorsunuz?",
    "textValue": "<GENERATED_POST_TEXT>"
  }
]
\`\`\``,
  },

  click_element: {
    name: "click_element",
    description: "Clicks a button, link, or interactive element on the active web page.",
    parameters: {
      selector: {
        type: "string",
        description: "CSS selector of the element.",
      },
      targetText: {
        type: "string",
        description: "Visible text or aria-label of the element.",
      },
    },
    exampleUsage: `\`\`\`json
[
  {
    "actionType": "click",
    "targetText": "Devam Et",
    "selector": "button.submit-btn"
  }
]
\`\`\``,
  },

  type_text: {
    name: "type_text",
    description: "Types text into an input box, textarea, or contenteditable rich text editor.",
    parameters: {
      selector: {
        type: "string",
        description: "CSS selector of the target input.",
      },
      targetText: {
        type: "string",
        description: "Placeholder or label.",
      },
      textValue: {
        type: "string",
        description: "The text to insert.",
        required: true,
      },
    },
    exampleUsage: `\`\`\`json
[
  {
    "actionType": "type",
    "selector": "input[name='search']",
    "targetText": "Ara",
    "textValue": "Yapay zeka haberleri"
  }
]
\`\`\``,
  },

  scroll_page: {
    name: "scroll_page",
    description: "Scrolls the active web page up or down.",
    parameters: {
      direction: {
        type: "string",
        enum: ["up", "down"],
        description: "Direction to scroll.",
        required: true,
      },
    },
    exampleUsage: `\`\`\`json
[
  {
    "actionType": "scroll",
    "direction": "down"
  }
]
\`\`\``,
  },

  update_memory: {
    name: "update_memory",
    description: "Saves a permanent fact or detail to the user's personal memory (memory.md).",
    parameters: {
      memory_fact: {
        type: "string",
        description: "The fact to remember.",
        required: true,
      },
    },
    exampleUsage: `\`\`\`json
{
  "action": "update_memory",
  "memory_fact": "E-posta: halilemrekuyupinar@proton.me"
}
\`\`\``,
  },

  clarification: {
    name: "clarification",
    description: "Pauses task execution to ask the user a multiple-choice or free-text clarifying question.",
    parameters: {
      question: { type: "string", description: "The clarifying question", required: true },
      options: { type: "array", description: "List of options or { label, value }" },
      allowFreeText: { type: "boolean", description: "Allow custom user write-in" },
    },
    exampleUsage: `\`\`\`json
{
  "action": "clarification",
  "params": {
    "question": "Hangi formatta paylaşmak istersiniz?",
    "options": ["Kısa Özet", "Detaylı Rapor", "Hikaye Formatı"],
    "allowFreeText": true
  }
}
\`\`\``,
  },
};

/**
 * Builds a clean, structured tools prompt string for injecting into system instructions.
 */
export function buildAgentToolsPrompt(): string {
  const toolDescriptions = Object.values(WEB_AGENT_TOOLS)
    .map((tool) => {
      return `### Tool: \`${tool.name}\`
${tool.description}
Output Schema:
${tool.exampleUsage}`;
    })
    .join("\n\n");

  return `## AVAILABLE AGENT TOOLS:
When the user asks you to interact with the web page, post content, fill forms, update memory, or ask for clarification, return the tool invocation in a markdown JSON block at the very end of your reply.

${toolDescriptions}`;
}
