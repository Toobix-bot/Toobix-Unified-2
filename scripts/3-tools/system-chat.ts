#!/usr/bin/env bun
/**
 * Natural-language chat console for Toobix Unified.
 * You can converse with the system, trigger MCP tools, and inspect status
 * without memorising command names.
 *
 * Usage:
 *   bun run scripts/system-chat.ts
 */

import readline from "readline";
import { ChattyMCPClient } from "../packages/chatty-client/index.ts";

type Message = { role: "system" | "user" | "assistant"; content: string };
type Plan = { reply: string; actions?: Array<{ tool: string; args?: Record<string, unknown> }> };
type ActionResult = { tool: string; ok: boolean; durationMs: number; data?: unknown; error?: string };

const BASE_URL = process.env.MCP_PUBLIC_URL ?? "http://localhost:3337";
const client = new ChattyMCPClient(BASE_URL, {
  "ngrok-skip-browser-warning": "true",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptInput(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function toolSummary(tools: Array<{ name: string; description?: string }>): string {
  const lines = tools
    .map((tool) => `• ${tool.name}${tool.description ? ` — ${tool.description}` : ""}`)
    .join("\n");
  return lines || "(No tools discovered)";
}

function buildPlannerPrompt(history: Message[], userMessage: string, toolsText: string): string {
  return `
You are the Toobix System Orchestrator. You receive natural language from the user and decide which MCP tools to call.

TOOLS YOU CAN USE:
${toolsText}

Return a strict JSON object with the schema:
{
  "reply": "<what you want to say back to the user>",
  "actions": [
    { "tool": "<tool_name>", "args": { ... } }
  ]
}

Rules:
- Include actions only when helpful. Maximum 3 per turn.
- Prefer ${"\"consciousness_communicate\""} when the user just wants to chat.
- When setting or executing autonomous behaviour use the corresponding tools.
- Always keep the reply concise and friendly.

Conversation so far:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

USER: ${userMessage}

JSON:
`.trim();
}

function safeParsePlan(text: string): Plan | null {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(trimmed.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

let plannerAvailable = true;

async function planWithGenerate(prompt: string): Promise<Plan | null> {
  if (!plannerAvailable) return null;
  try {
    const result = await client.callTool("generate", { prompt, max_tokens: 600, temperature: 0.2 });
    const output = typeof result?.text === "string" ? result.text : JSON.stringify(result);
    return safeParsePlan(output);
  } catch (error) {
    const message = (error as Error)?.message ?? String(error);
    console.warn("[planner] generate call failed:", message);
    plannerAvailable = false;
    console.warn("[planner] Disabling LLM planner. Falling back to direct tool usage + communication.");
    return null;
  }
}

async function callTool(tool: string, args: Record<string, unknown> | undefined): Promise<ActionResult> {
  const start = Date.now();
  try {
    const result = await client.callTool(tool, args ?? {});
    return {
      tool,
      ok: true,
      durationMs: Date.now() - start,
      data: result,
    };
  } catch (error: any) {
    return {
      tool,
      ok: false,
      durationMs: Date.now() - start,
      error: error?.message ?? String(error),
    };
  }
}

async function fallbackCommunicate(message: string): Promise<{ reply: string }> {
  try {
    const result = await client.callTool("consciousness_communicate", {
      message,
      userId: "system-chat",
    });
    if (result && typeof result === "object" && typeof result.response === "string") {
      return { reply: result.response };
    }
    return { reply: "Ich konnte keine sinnvolle Antwort generieren." };
  } catch (error: any) {
    return { reply: `Kommunikation fehlgeschlagen: ${error?.message ?? String(error)}` };
  }
}

async function maybeShowStats() {
  try {
    const stats = await fetchJSON("/stats");
    console.log("\n[System Stats]");
    for (const [key, value] of Object.entries(stats)) {
      if (value && typeof value === "object") {
        const inner = Object.entries(value as Record<string, unknown>)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        console.log(`- ${key}: ${inner}`);
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }
  } catch {
    // ignore if stats endpoint unavailable
  }
}

async function run() {
  console.log("Toobix System Chat");
  console.log("-------------------");
  console.log(`MCP base URL: ${BASE_URL}`);
  console.log("Tippe 'exit' oder 'quit' zum Beenden.\n");

  let tools: Array<{ name: string; description?: string }> = [];
  try {
    tools = await client.discoverTools();
  } catch (error: any) {
    console.warn("Warnung: Tools konnten nicht geladen werden:", error?.message ?? String(error));
  }

  const toolsText = toolSummary(tools);

  const history: Message[] = [
    {
      role: "system",
      content:
        "Du bist die freundliche Schnittstelle des Toobix-Systems. Plane bedacht welche Werkzeuge benötigt werden.",
    },
  ];

  await maybeShowStats();

  while (true) {
    const userInput = await promptInput("\nDu: ");
    const trimmed = userInput.trim();
    if (!trimmed) continue;
    if (["exit", "quit", "bye"].includes(trimmed.toLowerCase())) {
      console.log("System: Bis bald!");
      break;
    }

    history.push({ role: "user", content: trimmed });

    const plannerPrompt = buildPlannerPrompt(history, trimmed, toolsText);
    let plan = await planWithGenerate(plannerPrompt);
    if (!plan || !plan.reply) {
      console.log("[planner] Fallback auf direkte Kommunikation.");
      const fallback = await fallbackCommunicate(trimmed);
      history.push({ role: "assistant", content: fallback.reply });
      console.log(`System: ${fallback.reply}`);
      continue;
    }

    const actions = Array.isArray(plan.actions) ? plan.actions.slice(0, 3) : [];
    const executed: ActionResult[] = [];
    for (const action of actions) {
      if (!action?.tool) continue;
      const result = await callTool(action.tool, action.args ?? {});
      executed.push(result);
      if (!result.ok) {
        console.warn(`-> Tool ${action.tool} fehlgeschlagen: ${result.error}`);
      }
    }

    if (executed.length > 0) {
      console.log("\n[Tool-Ausführung]");
      for (const res of executed) {
        if (res.ok) {
          console.log(`✔ ${res.tool} (${res.durationMs}ms)`);
        } else {
          console.log(`✖ ${res.tool} – ${res.error}`);
        }
      }
    }

    console.log(`\nSystem: ${plan.reply}`);
    history.push({ role: "assistant", content: plan.reply });
  }

  rl.close();
}

run().catch((error) => {
  console.error("Fataler Fehler:", error?.message ?? String(error));
  rl.close();
  process.exit(1);
});
