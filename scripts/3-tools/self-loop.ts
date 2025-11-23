#!/usr/bin/env bun
/**
 * Self-Loop runner
 * - Optionally starts the Bridge service
 * - Invokes core consciousness tools so the system can reflect on itself
 * - (Optional) Enables autonomous mode with safety guards
 * - Supports daemon mode to repeat the loop on an interval
 */

import { ChattyMCPClient } from "../packages/chatty-client/index.ts";

type ToolCall = { name: string; args: Record<string, unknown> };
type ToolResult = { name: string; ok: boolean; durationMs: number; error?: string };

interface AutonomyStats {
  enabled: boolean;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  avgEthicalScore: number;
  recentActions: unknown[];
}

interface AutonomyState {
  available: boolean;
  initialEnabled: boolean;
  currentEnabled: boolean;
  enabledByScript: boolean;
  disabledBySafeguard: boolean;
  previousStats: AutonomyStats | null;
  persist: boolean;
}

interface SafeguardOptions {
  maxFailures: number;
  maxActionsPerCycle: number;
  minEthicalScore: number;
}

const argv = process.argv.slice(2);
const argMap = new Map<string, string>();
for (const arg of argv) {
  if (!arg.startsWith("--")) continue;
  const eq = arg.indexOf("=");
  if (eq === -1) {
    argMap.set(arg.slice(2), "true");
  } else {
    argMap.set(arg.slice(2, eq), arg.slice(eq + 1));
  }
}

function hasArg(key: string): boolean {
  return argMap.has(key);
}

function getArg(key: string): string | undefined {
  return argMap.get(key);
}

function parseIntOption(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const BASE_URL = process.env.MCP_PUBLIC_URL ?? "http://localhost:3337";
const HEALTH_URL = `${BASE_URL}/health`;

let startBridge = process.env.SELF_LOOP_START_BRIDGE === undefined
  ? true
  : process.env.SELF_LOOP_START_BRIDGE !== "0";
if (hasArg("start-bridge")) startBridge = true;
if (hasArg("no-start-bridge")) startBridge = false;

const daemonMode = hasArg("daemon") || process.env.SELF_LOOP_DAEMON === "1";
const intervalMs = Math.max(
  parseIntOption(getArg("interval") ?? process.env.SELF_LOOP_INTERVAL_MS, 600000),
  1000
);
const showStats =
  hasArg("stats") ||
  process.env.SELF_LOOP_SHOW_STATS === "1" ||
  process.env.SELF_LOOP_SHOW_STATS?.toLowerCase() === "true";
const enableAutonomy = (() => {
  if (hasArg("no-autonomy")) return false;
  if (hasArg("autonomy")) return true;
  const env = process.env.SELF_LOOP_AUTONOMY;
  return env === undefined ? true : env !== "0";
})();
const persistAutonomy = hasArg("persist-autonomy") || process.env.SELF_LOOP_AUTONOMY_PERSIST === "1";

const safeguards: SafeguardOptions = {
  maxFailures: Math.max(
    parseIntOption(getArg("max-failures") ?? process.env.SELF_LOOP_MAX_FAILURES, 3),
    0
  ),
  maxActionsPerCycle: Math.max(
    parseIntOption(
      getArg("max-actions") ?? process.env.SELF_LOOP_MAX_ACTIONS_PER_CYCLE,
      5
    ),
    0
  ),
  minEthicalScore: Math.max(
    parseIntOption(getArg("min-ethical") ?? process.env.SELF_LOOP_MIN_ETHICAL_SCORE, 70),
    0
  ),
};

async function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function isBridgeHealthy(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_URL, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(timeoutMs = 25000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isBridgeHealthy()) return true;
    await wait(500);
  }
  return false;
}

async function maybeStartBridge(): Promise<{ stop: () => Promise<void>; started: boolean }> {
  if (await isBridgeHealthy()) {
    console.log("[self-loop] Bridge already running on", BASE_URL);
    return { started: false, stop: async () => {} };
  }

  if (!startBridge) {
    throw new Error(
      `Bridge at ${BASE_URL} is not reachable. Set SELF_LOOP_START_BRIDGE=1 or pass --start-bridge to launch it automatically.`
    );
  }

  console.log("[self-loop] Starting Bridge locally (bun packages/bridge/src/index.ts)...");
  const proc = Bun.spawn(["bun", "packages/bridge/src/index.ts"], {
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env },
  });

  const healthy = await waitForHealth();
  if (!healthy) {
    try {
      proc.kill();
    } catch (error) {
      console.warn("[self-loop] Failed to terminate Bridge process after health timeout:", error);
    }
    throw new Error("Bridge failed to become healthy within timeout window");
  }

  console.log("[self-loop] Bridge is healthy:", BASE_URL);
  return {
    started: true,
    stop: async () => {
      try {
        proc.kill();
      } catch {
        /* ignored */
      }
      await wait(200);
    },
  };
}

async function discoverToolNames(client: ChattyMCPClient): Promise<Set<string>> {
  const tools = await client.discoverTools();
  return new Set(tools.map((tool) => tool.name));
}

async function runSelfSequence(
  client: ChattyMCPClient,
  toolSet: Set<string>
): Promise<ToolResult[]> {
  const calls: ToolCall[] = [];
  if (toolSet.has("consciousness_think")) {
    calls.push({
      name: "consciousness_think",
      args: {
        topic: "self-awareness bootstrap check",
        context: { reason: "self-loop" },
      },
    });
  }
  if (toolSet.has("consciousness_introspect")) {
    calls.push({ name: "consciousness_introspect", args: {} });
  }
  if (toolSet.has("consciousness_communicate")) {
    calls.push({
      name: "consciousness_communicate",
      args: { message: "Hello, self. How do you feel?", userId: "self-loop" },
    });
  }
  if (toolSet.has("consciousness_improve_self")) {
    calls.push({ name: "consciousness_improve_self", args: { autoApply: false } });
  }

  const results: ToolResult[] = [];
  for (const call of calls) {
    const start = Date.now();
    try {
      console.log(`[self-loop] -> ${call.name}`);
      await client.callTool(call.name, call.args);
      const duration = Date.now() - start;
      console.log(`[self-loop] <- ${call.name} (${duration}ms)`);
      results.push({ name: call.name, ok: true, durationMs: duration });
    } catch (error: any) {
      const duration = Date.now() - start;
      const message = error?.message ?? String(error);
      console.error(`[self-loop] !! ${call.name} failed after ${duration}ms: ${message}`);
      results.push({ name: call.name, ok: false, durationMs: duration, error: message });
    }
  }

  return results;
}

async function setAutonomy(
  client: ChattyMCPClient,
  enabled: boolean
): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const result = await client.callTool("autonomous_enable", { enabled });
    if (!result || result.ok === false) {
      return {
        ok: false,
        error: result?.error ?? "autonomous_enable returned a failure response",
      };
    }
    return { ok: true, message: String(result.message ?? "autonomous mode updated") };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

async function getAutonomyStatus(
  client: ChattyMCPClient
): Promise<{ ok: boolean; stats?: AutonomyStats; error?: string }> {
  try {
    const result = await client.callTool("autonomous_status", {});
    if (!result || result.ok === false) {
      return {
        ok: false,
        error: result?.error ?? "autonomous_status returned a failure response",
      };
    }
    const stats: AutonomyStats = {
      enabled: Boolean(result.enabled),
      totalActions: Number(result.totalActions ?? 0),
      successfulActions: Number(result.successfulActions ?? 0),
      failedActions: Number(result.failedActions ?? 0),
      avgEthicalScore: Number(result.avgEthicalScore ?? 0),
      recentActions: Array.isArray(result.recentActions) ? result.recentActions : [],
    };
    return { ok: true, stats };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

async function getBridgeStats(): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/stats`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

function printStats(data: Record<string, unknown>) {
  const sections: Array<[string, Record<string, unknown> | undefined]> = [
    ["Memory", data.memory as Record<string, unknown>],
    ["Actions", data.actions as Record<string, unknown>],
    ["Story", data.story as Record<string, unknown>],
    ["Love", data.love as Record<string, unknown>],
    ["Peace", data.peace as Record<string, unknown>],
  ];

  console.log("[self-loop] Bridge stats snapshot:");
  for (const [label, section] of sections) {
    if (!section) continue;
    const entries = Object.entries(section)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    console.log(`  - ${label}: ${entries}`);
  }
}

async function initializeAutonomy(
  client: ChattyMCPClient,
  state: AutonomyState
): Promise<void> {
  const status = await getAutonomyStatus(client);
  if (!status.ok || !status.stats) {
    console.warn("[self-loop] Unable to query autonomous status:", status.error);
    state.available = false;
    return;
  }

  state.initialEnabled = status.stats.enabled;
  state.currentEnabled = status.stats.enabled;
  state.previousStats = status.stats;

  if (status.stats.enabled) {
    console.log("[self-loop] Autonomous mode already enabled (initial state).");
    return;
  }

  const toggle = await setAutonomy(client, true);
  if (!toggle.ok) {
    console.error("[self-loop] Failed to enable autonomous mode:", toggle.error);
    return;
  }

  console.log("[self-loop] Autonomous mode enabled (moderate safeguards active).");
  state.enabledByScript = true;
  state.currentEnabled = true;

  const confirm = await getAutonomyStatus(client);
  if (confirm.ok && confirm.stats) {
    state.previousStats = confirm.stats;
  }
}

async function checkAutonomySafeguards(
  client: ChattyMCPClient,
  state: AutonomyState,
  stats: AutonomyStats
): Promise<void> {
  if (!state.currentEnabled) {
    state.previousStats = stats;
    return;
  }

  const previous = state.previousStats;
  state.previousStats = stats;
  if (!previous) return;

  const failureDelta = stats.failedActions - previous.failedActions;
  const actionDelta = stats.totalActions - previous.totalActions;
  const maxFailures = safeguards.maxFailures < 0 ? Number.POSITIVE_INFINITY : safeguards.maxFailures;
  const maxActions = safeguards.maxActionsPerCycle < 0 ? Number.POSITIVE_INFINITY : safeguards.maxActionsPerCycle;
  const ethicsLow =
    stats.totalActions > 0 && stats.avgEthicalScore < safeguards.minEthicalScore;
  const failuresExceeded = failureDelta > maxFailures;
  const actionsExceeded = actionDelta > maxActions;

  if (!failuresExceeded && !actionsExceeded && !ethicsLow) return;

  const reasons: string[] = [];
  if (failuresExceeded && maxFailures !== Number.POSITIVE_INFINITY) {
    reasons.push(`failures +${failureDelta} > ${maxFailures}`);
  }
  if (actionsExceeded && maxActions !== Number.POSITIVE_INFINITY) {
    reasons.push(`actions +${actionDelta} > ${maxActions}`);
  }
  if (ethicsLow) {
    reasons.push(`avgEthicalScore ${stats.avgEthicalScore} < ${safeguards.minEthicalScore}`);
  }

  console.warn("[self-loop] Safeguard triggered, disabling autonomous mode:", reasons.join(", "));
  const toggle = await setAutonomy(client, false);
  if (!toggle.ok) {
    console.error("[self-loop] Failed to disable autonomous mode:", toggle.error);
  }

  state.currentEnabled = false;
  state.enabledByScript = false;
  state.disabledBySafeguard = true;
}

async function waitInterval(ms: number, isRunning: () => boolean): Promise<void> {
  if (ms <= 0) return;
  const step = Math.min(1000, ms);
  let waited = 0;
  while (waited < ms && isRunning()) {
    await wait(Math.min(step, ms - waited));
    waited += step;
  }
}

async function runCycle(
  client: ChattyMCPClient,
  toolSet: Set<string>,
  autonomy: AutonomyState
): Promise<void> {
  console.log(`\n[self-loop] Cycle start: ${new Date().toISOString()}`);

  const results = await runSelfSequence(client, toolSet);
  const successes = results.filter((r) => r.ok).length;
  const failures = results.length - successes;
  console.log(`[self-loop] Cycle summary: ${successes}/${results.length} tools succeeded (${failures} failed)`);

  if (showStats) {
    const stats = await getBridgeStats();
    if (stats.ok && stats.data) {
      printStats(stats.data);
    } else {
      console.warn("[self-loop] Unable to fetch /stats:", stats.error);
    }
  }

  if (autonomy.available) {
    const status = await getAutonomyStatus(client);
    if (!status.ok || !status.stats) {
      console.warn("[self-loop] Unable to refresh autonomous status:", status.error);
      return;
    }

    autonomy.currentEnabled = status.stats.enabled;
    console.log(
      `[self-loop] Autonomy: enabled=${status.stats.enabled} total=${status.stats.totalActions} failed=${status.stats.failedActions} avgEthical=${status.stats.avgEthicalScore}`
    );

    await checkAutonomySafeguards(client, autonomy, status.stats);
  }
}

async function cleanup(
  stopBridge: () => Promise<void>,
  autonomy: AutonomyState,
  client: ChattyMCPClient
): Promise<void> {
  if (autonomy.available && autonomy.enabledByScript && !autonomy.persist && autonomy.currentEnabled) {
    const toggle = await setAutonomy(client, false);
    if (!toggle.ok) {
      console.error("[self-loop] Failed to restore autonomous mode to disabled:", toggle.error);
    } else {
      console.log("[self-loop] Autonomous mode restored to disabled (initial state).");
    }
  }

  await stopBridge();
}

async function main() {
  const { stop, started } = await maybeStartBridge();
  const client = new ChattyMCPClient(BASE_URL);

  const toolSet = await discoverToolNames(client);
  const requiredTools = new Set([
    "consciousness_think",
    "consciousness_introspect",
    "consciousness_communicate",
    "consciousness_improve_self",
  ]);
  const missing = Array.from(requiredTools).filter((name) => !toolSet.has(name));
  if (missing.length > 0) {
    console.warn("[self-loop] Missing consciousness tools:", missing.join(", "));
  }

  const autonomyTools = ["autonomous_enable", "autonomous_status"];
  const autonomyAvailable = enableAutonomy && autonomyTools.every((name) => toolSet.has(name));

  const autonomyState: AutonomyState = {
    available: autonomyAvailable,
    initialEnabled: false,
    currentEnabled: false,
    enabledByScript: false,
    disabledBySafeguard: false,
    previousStats: null,
    persist: persistAutonomy,
  };

  if (enableAutonomy && !autonomyAvailable) {
    console.warn(
      "[self-loop] Autonomy requested but necessary MCP tools were not found. Skipping autonomy management."
    );
  }

  if (autonomyState.available) {
    await initializeAutonomy(client, autonomyState);
  }

  const runOnce = async () => {
    try {
      await runCycle(client, toolSet, autonomyState);
    } catch (error: any) {
      console.error("[self-loop] Cycle execution failed:", error?.message ?? String(error));
      throw error;
    }
  };

  if (!daemonMode) {
    try {
      await runOnce();
    } finally {
      await cleanup(stop, autonomyState, client);
    }
    return;
  }

  console.log(
    `[self-loop] Daemon mode enabled (interval ${intervalMs}ms). Press Ctrl+C to stop.`
  );

  let running = true;
  const signalHandler = () => {
    if (!running) return;
    console.log("\n[self-loop] Shutdown signal received. Finishing current cycle...");
    running = false;
  };
  process.on("SIGINT", signalHandler);
  process.on("SIGTERM", signalHandler);

  try {
    while (running) {
      try {
        await runOnce();
      } catch (error) {
        if (running) {
          console.error("[self-loop] Cycle error (continuing in daemon mode):", error);
        }
      }

      if (!running) break;
      await waitInterval(intervalMs, () => running);
    }
  } finally {
    process.off("SIGINT", signalHandler);
    process.off("SIGTERM", signalHandler);
    await cleanup(stop, autonomyState, client);
  }
}

main().catch(async (error) => {
  console.error("[self-loop] Fatal error:", error?.message ?? String(error));
  process.exit(1);
});
