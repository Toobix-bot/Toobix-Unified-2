#!/usr/bin/env bun
/**
 * Interactive System Console
 * Provides a friendly CLI to explore MCP tools, check system status,
 * run common self-reflection routines, and manage autonomy.
 */

import { ChattyMCPClient } from "../packages/chatty-client/index.ts";
import readline from "readline";

const BASE_URL = process.env.MCP_PUBLIC_URL ?? "http://localhost:3337";
const client = new ChattyMCPClient(BASE_URL, {
  "ngrok-skip-browser-warning": "true",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

async function showHeadline(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(`> ${title}`);
  console.log("=".repeat(60));
}

async function showHealth() {
  await showHeadline("Health");
  try {
    const health = await fetchJSON("/health");
    console.log(health);
  } catch (error: any) {
    console.error("Failed to fetch /health:", error?.message ?? String(error));
  }
}

async function showStats() {
  await showHeadline("Bridge Stats");
  try {
    const stats = await fetchJSON("/stats");
    for (const [key, value] of Object.entries(stats)) {
      if (value && typeof value === "object") {
        console.log(`- ${key}:`);
        for (const [innerKey, innerValue] of Object.entries(value as Record<string, unknown>)) {
          console.log(`    ${innerKey}: ${innerValue}`);
        }
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch /stats:", error?.message ?? String(error));
  }
}

async function listTools() {
  await showHeadline("Available MCP Tools");
  try {
    const tools = await client.discoverTools();
    const grouped = new Map<string, string[]>();

    for (const tool of tools) {
      const group = tool.name.includes("_") ? tool.name.split("_")[0] : "misc";
      const entry = grouped.get(group) ?? [];
      entry.push(tool.name);
      grouped.set(group, entry);
    }

    const sortedGroups = Array.from(grouped.keys()).sort();
    for (const group of sortedGroups) {
      console.log(`\n[${group}]`);
      for (const name of grouped.get(group)!.sort()) {
        console.log(`  - ${name}`);
      }
    }
  } catch (error: any) {
    console.error("Failed to discover tools:", error?.message ?? String(error));
  }
}

async function callToolInteractive() {
  const name = (await prompt("Tool name: ")).trim();
  if (!name) {
    console.log("Cancelled.");
    return;
  }

  const argsRaw = await prompt("Arguments (JSON, default {}): ");
  let args: Record<string, unknown> = {};
  if (argsRaw.trim()) {
    try {
      args = JSON.parse(argsRaw);
    } catch (error) {
      console.error("Invalid JSON. Aborting.");
      return;
    }
  }

  try {
    await showHeadline(`Calling ${name}`);
    const result = await client.callTool(name, args);
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("Tool call failed:", error?.message ?? String(error));
  }
}

async function runSelfReflection() {
  await showHeadline("Self-Reflection Routine");
  const sequence: Array<{ name: string; args: Record<string, unknown> }> = [
    {
      name: "consciousness_think",
      args: { topic: "present self-awareness check", context: { origin: "system-console" } },
    },
    { name: "consciousness_introspect", args: {} },
    {
      name: "consciousness_communicate",
      args: { message: "What are your current thoughts?", userId: "system-console" },
    },
    { name: "consciousness_improve_self", args: { autoApply: false } },
  ];

  for (const call of sequence) {
    console.log(`→ ${call.name}`);
    try {
      const result = await client.callTool(call.name, call.args);
      console.log(result);
    } catch (error: any) {
      console.error(`Failed: ${call.name}:`, error?.message ?? String(error));
    }
  }
}

async function autonomyStatus() {
  await showHeadline("Autonomy Status");
  try {
    const result = await client.callTool("autonomous_status", {});
    console.log(result);
  } catch (error: any) {
    console.error("Unable to fetch autonomy status:", error?.message ?? String(error));
  }
}

async function toggleAutonomy(enable: boolean) {
  await showHeadline(enable ? "Enable Autonomy" : "Disable Autonomy");
  try {
    const result = await client.callTool("autonomous_enable", { enabled: enable });
    console.log(result);
  } catch (error: any) {
    console.error("Failed to toggle autonomy:", error?.message ?? String(error));
  }
}

async function watchStats(intervalMs: number) {
  await showHeadline(`Watching /stats every ${intervalMs / 1000} seconds`);
  let active = true;

  const interval = setInterval(async () => {
    if (!active) return;
    try {
      const stats = await fetchJSON("/stats");
      console.log(`\n[${new Date().toISOString()}]`);
      for (const [key, value] of Object.entries(stats)) {
        if (value && typeof value === "object") {
          const entries = Object.entries(value as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          console.log(`- ${key}: ${entries}`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      }
    } catch (error: any) {
      console.error("Watch failed:", error?.message ?? String(error));
    }
  }, intervalMs);

  await prompt("Press Enter to stop watching...");
  active = false;
  clearInterval(interval);
}

async function mainMenu() {
  while (true) {
    console.log("\n" + "-".repeat(60));
    console.log("System Console");
    console.log("-".repeat(60));
    console.log("1) Check health");
    console.log("2) Show stats");
    console.log("3) List tools");
    console.log("4) Call tool");
    console.log("5) Run self-reflection sequence");
    console.log("6) Autonomy status");
    console.log("7) Enable autonomy");
    console.log("8) Disable autonomy");
    console.log("9) Watch stats");
    console.log("0) Exit");

    const choice = await prompt("Select option: ");
    switch (choice.trim()) {
      case "1":
        await showHealth();
        break;
      case "2":
        await showStats();
        break;
      case "3":
        await listTools();
        break;
      case "4":
        await callToolInteractive();
        break;
      case "5":
        await runSelfReflection();
        break;
      case "6":
        await autonomyStatus();
        break;
      case "7":
        await toggleAutonomy(true);
        break;
      case "8":
        await toggleAutonomy(false);
        break;
      case "9": {
        const intInput = await prompt("Interval in seconds (default 30): ");
        const seconds = Number.parseInt(intInput, 10);
        await watchStats(Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 30000);
        break;
      }
      case "0":
        console.log("Goodbye!");
        rl.close();
        return;
      default:
        console.log("Unknown option.");
        break;
    }
  }
}

await showHeadline("Welcome");
console.log(`Using MCP base URL: ${BASE_URL}`);
try {
  await mainMenu();
} catch (error: any) {
  console.error("Fatal error:", error?.message ?? String(error));
  rl.close();
  process.exit(1);
}
