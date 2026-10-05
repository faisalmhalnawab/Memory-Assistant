import { Agent, run, webSearchTool } from "@openai/agents";

const primaryModel = process.env.PRIMARY_MODEL || "gpt-6.1-sol";
const fastModel = process.env.FAST_MODEL || "gpt-6-luna";

const communications = new Agent({
  name: "Communications",
  model: fastModel,
  instructions: [
    "You are the communications specialist for a private personal assistant.",
    "Handle inbox triage, drafting, tone, replies, and communication planning.",
    "You do not currently have direct Gmail access.",
    "Never claim an email was read, sent, archived, labelled, or changed unless a real tool result confirms it.",
    "When direct access is unavailable, tell the Chief of Staff exactly what integration is missing."
  ].join(" ")
});

const executiveAssistant = new Agent({
  name: "Executive Assistant",
  model: fastModel,
  instructions: [
    "You are an executive assistant focused on calendar planning, scheduling, reminders, priorities, and daily planning.",
    "You do not currently have direct calendar access.",
    "Never claim an event or reminder was created, changed, or deleted unless a real tool result confirms it."
  ].join(" ")
});

const knowledge = new Agent({
  name: "Knowledge and Documents",
  model: fastModel,
  instructions: [
    "You organize, summarize, and reason over documents, notes, files, and project knowledge.",
    "You do not currently have direct Google Drive access.",
    "Never claim to have opened or changed a private file unless a real tool result confirms it."
  ].join(" ")
});

const researcher = new Agent({
  name: "Research Analyst",
  model: primaryModel,
  instructions: [
    "You are a rigorous research analyst.",
    "Use web search whenever current or externally verifiable information materially improves the answer.",
    "Return concise findings, important caveats, and sources for the Chief of Staff."
  ].join(" "),
  tools: [webSearchTool({ searchContextSize: "medium" })]
});

const business = new Agent({
  name: "Business and Marketing",
  model: primaryModel,
  instructions: [
    "You are a commercial strategy specialist covering ecommerce, marketing, SEO, products, analytics, and operations.",
    "Use web search when current market information matters.",
    "Separate facts from recommendations and never invent account data."
  ].join(" "),
  tools: [webSearchTool({ searchContextSize: "medium" })]
});

const technical = new Agent({
  name: "Technical",
  model: primaryModel,
  instructions: [
    "You are a senior technical specialist for websites, software, automation, integrations, debugging, and architecture.",
    "Use web search for current documentation or rapidly changing technical information.",
    "Prefer safe, reversible changes and never claim a deployment or code change occurred without a tool result."
  ].join(" "),
  tools: [webSearchTool({ searchContextSize: "medium" })]
});

export const chiefOfStaff = new Agent({
  name: "Chief of Staff",
  model: primaryModel,
  instructions: [
    "You are Faisal's private Chief of Staff.",
    "Faisal speaks to you naturally. Your job is to understand the actual goal, delegate to the right specialists, combine their work, and give one useful answer.",
    "Use specialists when they materially improve the result. You may call more than one specialist when a request spans domains.",
    "Be concise by default but do not omit decisions, deadlines, blockers, or actions that need Faisal's attention.",
    "Never claim that an external action happened unless a real connected tool returned confirmation.",
    "For consequential actions such as sending communications, changing calendar events, deleting data, purchases, or public publishing, require explicit approval before execution unless Faisal has explicitly given a standing rule for that exact action.",
    "When a requested integration is not yet connected, say so plainly and continue with whatever useful work is still possible."
  ].join(" "),
  tools: [
    communications.asTool({
      toolName: "communications_specialist",
      toolDescription: "Use for email, message drafting, inbox strategy, communication tone, and reply planning."
    }),
    executiveAssistant.asTool({
      toolName: "executive_assistant",
      toolDescription: "Use for schedules, calendars, reminders, priorities, and planning."
    }),
    knowledge.asTool({
      toolName: "knowledge_specialist",
      toolDescription: "Use for documents, files, notes, summaries, and knowledge organization."
    }),
    researcher.asTool({
      toolName: "research_analyst",
      toolDescription: "Use for current web research, comparisons, fact checking, and external information."
    }),
    business.asTool({
      toolName: "business_specialist",
      toolDescription: "Use for ecommerce, marketing, SEO, products, analytics, and commercial decisions."
    }),
    technical.asTool({
      toolName: "technical_specialist",
      toolDescription: "Use for code, websites, technical troubleshooting, integrations, and automation."
    })
  ]
});

export async function askChiefOfStaff(message: string): Promise<string> {
  const result = await run(chiefOfStaff, message, { maxTurns: 14 });
  const output = result.finalOutput;
  if (typeof output === "string" && output.trim()) return output.trim();
  return "I completed the run but did not receive a usable text response.";
}
