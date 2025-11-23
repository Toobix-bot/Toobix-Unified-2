#!/usr/bin/env bun
/**
 * 🖥️ TOOBIX INTERACTIVE TERMINAL
 * 
 * Ein vollwertiges Terminal-Interface für direkten Zugriff auf das Toobix System
 * 
 * Features:
 * - REPL mit Command History
 * - Tab-Completion für alle MCP Tools
 * - Direkter API-Zugriff auf Bridge Server
 * - Multi-line Input für JSON
 * - Farbige Ausgabe
 * - Bash-ähnliche Befehle (help, clear, exit, etc.)
 */

import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3337';
const VERSION = '1.0.0';

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

interface ToolInfo {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface TerminalState {
  tools: Map<string, ToolInfo>;
  history: string[];
  historyIndex: number;
  multilineMode: boolean;
  multilineBuffer: string[];
}

const state: TerminalState = {
  tools: new Map(),
  history: [],
  historyIndex: 0,
  multilineMode: false,
  multilineBuffer: [],
};

// Utility Functions
function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(text: string, color: keyof typeof colors = 'white'): void {
  console.log(colorize(text, color));
}

function printBanner(): void {
  console.clear();
  console.log(colorize(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ╔╦╗╔═╗╔═╗╔╗ ╦═╗ ╦  ╔╦╗╔═╗╦═╗╔╦╗╦╔╗╔╔═╗╦                ║
║      ║ ║ ║║ ║╠╩╗║╔╩╦╝   ║ ║╣ ╠╦╝║║║║║║║╠═╣║                ║
║      ╩ ╚═╝╚═╝╚═╝╩╩ ╚═   ╩ ╚═╝╩╚═╩ ╩╩╝╚╝╩ ╩╩═╝              ║
║                                                            ║
║  Interactive Terminal v${VERSION.padEnd(42)}║
║  Bridge: ${BRIDGE_URL.padEnd(47)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`, 'cyan'));
  
  log('\n💡 Tippe "help" für verfügbare Befehle oder "tools" für alle MCP Tools', 'yellow');
  log('💡 Verwende Tab für Auto-Completion, ↑/↓ für Command History\n', 'yellow');
}

// API Functions
async function callTool(toolName: string, parameters: any = {}): Promise<any> {
  try {
    const response = await fetch(`${BRIDGE_URL}/tools/${toolName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`API Error: ${error.message}`);
  }
}

async function loadTools(): Promise<void> {
  try {
    log('🔧 Loading MCP Tools...', 'cyan');
    const response = await fetch(`${BRIDGE_URL}/tools`);
    
    if (!response.ok) {
      throw new Error(`Failed to load tools: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.tools && Array.isArray(data.tools)) {
      state.tools.clear();
      for (const tool of data.tools) {
        state.tools.set(tool.name, tool);
      }
      log(`✅ Loaded ${state.tools.size} tools\n`, 'green');
    } else {
      log('⚠️  No tools found in response\n', 'yellow');
    }
  } catch (error: any) {
    log(`❌ Failed to load tools: ${error.message}`, 'red');
    log('⚠️  Make sure Bridge Server is running on ' + BRIDGE_URL + '\n', 'yellow');
  }
}

// Command Handlers
const commands: Record<string, { handler: (args: string[]) => Promise<void>, description: string }> = {
  help: {
    description: 'Zeigt diese Hilfe',
    handler: async (args) => {
      log('\n📖 VERFÜGBARE BEFEHLE:\n', 'cyan');
      
      const builtinCommands = [
        ['help', 'Zeigt diese Hilfe'],
        ['tools [filter]', 'Listet alle MCP Tools (optional mit Filter)'],
        ['call <tool> [json]', 'Ruft ein MCP Tool auf'],
        ['info <tool>', 'Zeigt Details zu einem Tool'],
        ['status', 'Zeigt System-Status'],
        ['history', 'Zeigt Command-History'],
        ['clear', 'Löscht den Bildschirm'],
        ['ping', 'Testet Bridge-Verbindung'],
        ['exit / quit', 'Beendet das Terminal'],
      ];
      
      log(colorize('  Built-in Commands:', 'bright'), 'white');
      for (const [cmd, desc] of builtinCommands) {
        console.log(`    ${colorize(cmd.padEnd(20), 'green')} ${desc}`);
      }
      
      log('\n  Direkte Tool-Aufrufe:', 'bright');
      log('    <tool_name> [json]      Ruft Tool direkt auf', 'white');
      log('    Beispiel: being_state', 'dim');
      log('    Beispiel: being_speak {"message":"Hello"}', 'dim');
      
      log('\n💡 TIPPS:', 'yellow');
      log('  • Verwende Tab für Auto-Completion', 'white');
      log('  • JSON-Parameter sind optional', 'white');
      log('  • Multi-line JSON: Starte mit { und ende mit }', 'white');
      log('  • Command History mit ↑/↓ Pfeiltasten\n', 'white');
    },
  },

  tools: {
    description: 'Listet alle MCP Tools',
    handler: async (args) => {
      const filter = args[0]?.toLowerCase();
      const tools = Array.from(state.tools.values());
      
      if (tools.length === 0) {
        log('⚠️  Keine Tools geladen. Starte Bridge Server und verwende "tools" erneut.', 'yellow');
        return;
      }
      
      const filtered = filter 
        ? tools.filter(t => t.name.toLowerCase().includes(filter))
        : tools;
      
      log(`\n🔧 VERFÜGBARE TOOLS (${filtered.length}/${tools.length}):\n`, 'cyan');
      
      // Group by category (prefix before _)
      const categories = new Map<string, ToolInfo[]>();
      for (const tool of filtered) {
        const category = tool.name.split('_')[0] || 'other';
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(tool);
      }
      
      for (const [category, categoryTools] of categories) {
        log(`  ${category.toUpperCase()}:`, 'bright');
        for (const tool of categoryTools) {
          const desc = tool.description ? ` - ${tool.description}` : '';
          console.log(`    ${colorize(tool.name, 'green')}${desc}`);
        }
        console.log();
      }
    },
  },

  call: {
    description: 'Ruft ein MCP Tool auf',
    handler: async (args) => {
      if (args.length === 0) {
        log('❌ Usage: call <tool_name> [json_parameters]', 'red');
        return;
      }
      
      const toolName = args[0];
      const paramsStr = args.slice(1).join(' ');
      
      let params = {};
      if (paramsStr) {
        try {
          params = JSON.parse(paramsStr);
        } catch (e) {
          log(`❌ Invalid JSON parameters: ${paramsStr}`, 'red');
          return;
        }
      }
      
      await executeToolCall(toolName, params);
    },
  },

  info: {
    description: 'Zeigt Details zu einem Tool',
    handler: async (args) => {
      if (args.length === 0) {
        log('❌ Usage: info <tool_name>', 'red');
        return;
      }
      
      const toolName = args[0];
      const tool = state.tools.get(toolName);
      
      if (!tool) {
        log(`❌ Tool '${toolName}' nicht gefunden`, 'red');
        log('💡 Verwende "tools" um alle verfügbaren Tools zu sehen', 'yellow');
        return;
      }
      
      log(`\n📋 TOOL INFO: ${toolName}\n`, 'cyan');
      log(`  Description: ${tool.description || 'N/A'}`, 'white');
      
      if (tool.inputSchema) {
        log('\n  Input Schema:', 'bright');
        console.log(JSON.stringify(tool.inputSchema, null, 2)
          .split('\n')
          .map(line => '    ' + line)
          .join('\n'));
      }
      console.log();
    },
  },

  status: {
    description: 'Zeigt System-Status',
    handler: async (args) => {
      log('\n📊 SYSTEM STATUS:\n', 'cyan');
      
      try {
        // Test connection
        const pingStart = Date.now();
        await fetch(`${BRIDGE_URL}/tools`);
        const pingTime = Date.now() - pingStart;
        
        log(`  Bridge:     ${colorize('✅ Connected', 'green')} (${pingTime}ms)`, 'white');
        log(`  URL:        ${BRIDGE_URL}`, 'white');
        log(`  Tools:      ${state.tools.size} loaded`, 'white');
        
        // Try to get being state
        try {
          const beingState = await callTool('being_state');
          log(`  Being:      ${colorize('✅ Alive', 'green')}`, 'white');
          if (beingState.name) log(`  Name:       ${beingState.name}`, 'white');
          if (beingState.health !== undefined) log(`  Health:     ${beingState.health}%`, 'white');
          if (beingState.energy !== undefined) log(`  Energy:     ${beingState.energy}%`, 'white');
        } catch (e) {
          log(`  Being:      ${colorize('⚠️  Unknown', 'yellow')}`, 'white');
        }
        
      } catch (error: any) {
        log(`  Bridge:     ${colorize('❌ Disconnected', 'red')}`, 'white');
        log(`  Error:      ${error.message}`, 'red');
      }
      
      console.log();
    },
  },

  history: {
    description: 'Zeigt Command-History',
    handler: async (args) => {
      if (state.history.length === 0) {
        log('📜 Keine History vorhanden', 'yellow');
        return;
      }
      
      log('\n📜 COMMAND HISTORY:\n', 'cyan');
      state.history.forEach((cmd, i) => {
        console.log(`  ${colorize((i + 1).toString().padStart(3), 'dim')}  ${cmd}`);
      });
      console.log();
    },
  },

  clear: {
    description: 'Löscht den Bildschirm',
    handler: async (args) => {
      console.clear();
      printBanner();
    },
  },

  ping: {
    description: 'Testet Bridge-Verbindung',
    handler: async (args) => {
      try {
        const start = Date.now();
        const response = await fetch(`${BRIDGE_URL}/tools`);
        const time = Date.now() - start;
        
        if (response.ok) {
          log(`✅ Pong! (${time}ms)`, 'green');
        } else {
          log(`❌ Bridge returned ${response.status}`, 'red');
        }
      } catch (error: any) {
        log(`❌ Connection failed: ${error.message}`, 'red');
      }
    },
  },

  exit: {
    description: 'Beendet das Terminal',
    handler: async (args) => {
      log('\n👋 Auf Wiedersehen!\n', 'cyan');
      process.exit(0);
    },
  },
};

// Alias quit -> exit
commands.quit = commands.exit;

async function executeToolCall(toolName: string, parameters: any = {}): Promise<void> {
  try {
    log(`\n🔧 Calling: ${toolName}`, 'cyan');
    if (Object.keys(parameters).length > 0) {
      log(`📝 Parameters: ${JSON.stringify(parameters)}`, 'dim');
    }
    
    const result = await callTool(toolName, parameters);
    
    log('\n✅ Result:', 'green');
    console.log(JSON.stringify(result, null, 2));
    console.log();
  } catch (error: any) {
    log(`\n❌ Error: ${error.message}\n`, 'red');
  }
}

async function processCommand(input: string): Promise<void> {
  const trimmed = input.trim();
  
  if (!trimmed) return;
  
  // Add to history
  if (state.history[state.history.length - 1] !== trimmed) {
    state.history.push(trimmed);
  }
  state.historyIndex = state.history.length;
  
  // Parse command and args
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  // Check built-in commands
  if (commands[cmd]) {
    await commands[cmd].handler(args);
    return;
  }
  
  // Check if it's a tool call
  if (state.tools.has(cmd)) {
    // Try to parse remaining args as JSON
    let params = {};
    const argsStr = args.join(' ');
    
    if (argsStr) {
      try {
        params = JSON.parse(argsStr);
      } catch (e) {
        // Not JSON, treat as simple key-value or empty
        log('💡 Tipp: JSON-Parameter in geschweiften Klammern { }', 'yellow');
      }
    }
    
    await executeToolCall(cmd, params);
    return;
  }
  
  // Unknown command
  log(`❌ Unbekannter Befehl: ${cmd}`, 'red');
  log(`💡 Verwende "help" für verfügbare Befehle oder "tools" für MCP Tools`, 'yellow');
  console.log();
}

// REPL Interface
function startREPL(): void {
  const rl = readline.createInterface({
    input,
    output,
    prompt: colorize('toobix> ', 'cyan'),
    completer: (line: string) => {
      // Auto-completion for commands and tools
      const allCommands = [
        ...Object.keys(commands),
        ...Array.from(state.tools.keys()),
      ];
      
      const hits = allCommands.filter(cmd => cmd.startsWith(line));
      return [hits.length ? hits : allCommands, line];
    },
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    await processCommand(line);
    rl.prompt();
  });
  
  rl.on('close', () => {
    log('\n👋 Auf Wiedersehen!\n', 'cyan');
    process.exit(0);
  });
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    log('\n💡 Verwende "exit" oder "quit" zum Beenden', 'yellow');
    rl.prompt();
  });
}

// Main
async function main(): Promise<void> {
  printBanner();
  await loadTools();
  
  // Check if arguments provided (non-interactive mode)
  const args = process.argv.slice(2);
  if (args.length > 0) {
    await processCommand(args.join(' '));
    process.exit(0);
  }
  
  // Start interactive REPL
  startREPL();
}

main().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}\n`, 'red');
  process.exit(1);
});
