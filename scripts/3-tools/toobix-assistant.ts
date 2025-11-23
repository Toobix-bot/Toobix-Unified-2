#!/usr/bin/env bun
/**
 * Toobix Natural Language Assistant
 * 
 * Steuere Toobix mit natürlicher Sprache!
 * Das System kann:
 * - Code analysieren und verstehen
 * - Neue Features vorschlagen
 * - Sich selbst modifizieren (mit deiner Erlaubnis)
 * - Mit dir über den Code sprechen
 * 
 * Usage:
 *   bun run scripts/toobix-assistant.ts
 */

import readline from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3337';
const WORKSPACE_ROOT = 'C:\\Toobix-Unified';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversationHistory: ConversationMessage[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Extracted function for asking questions
async function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

// Extracted function for calling tools
async function callTool(toolName: string, args: any = {}): Promise<any> {
  try {
    const response = await fetch(`${BRIDGE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: args },
        id: Date.now()
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const resultText = data.result?.content?.[0]?.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error: any) {
    console.error(`❌ Error calling ${toolName}:`, error.message);
    return null;
  }
}

// Extracted function for generating responses
async function generateResponse(prompt: string, systemContext?: string): Promise<string> {
  const result = await callTool('generate', {
    prompt: systemContext ? `${systemContext}\n\nUser: ${prompt}` : prompt,
    maxTokens: 500
  });
  
  return result?.text || 'Entschuldigung, ich konnte keine Antwort generieren.';
}

// Extracted function for analyzing intent
async function analyzeIntent(userInput: string): Promise<{
  intent: 'chat' | 'code_read' | 'code_modify' | 'code_suggest' | 'system_info' | 'memory' | 'story';
  entities: any;
}> {
  // Simple intent detection (kann später mit Groq verbessert werden)
  const input = userInput.toLowerCase();
  
  if (input.includes('zeig') || input.includes('lese') || input.includes('schau')) {
    return { intent: 'code_read', entities: { query: userInput } };
  }
  
  if (input.includes('ändere') || input.includes('modifiziere') || input.includes('füge hinzu') || input.includes('lösche')) {
    return { intent: 'code_modify', entities: { query: userInput } };
  }
  
  if (input.includes('vorschlag') || input.includes('idee') || input.includes('verbessern')) {
    return { intent: 'code_suggest', entities: { query: userInput } };
  }
  
  if (input.includes('system') || input.includes('status') || input.includes('gesundheit')) {
    return { intent: 'system_info', entities: {} };
  }
  
  if (input.includes('erinner') || input.includes('weiß') || input.includes('suche')) {
    return { intent: 'memory', entities: { query: userInput } };
  }
  
  if (input.includes('geschichte') || input.includes('level') || input.includes('xp')) {
    return { intent: 'story', entities: {} };
  }
  
  return { intent: 'chat', entities: { query: userInput } };
}

// Extracted function for handling code read
async function handleCodeRead(query: string): Promise<string> {
  console.log('\n🔍 Analysiere Code...');
  
  // Nutze system_read_self Tool
  const result = await callTool('system_read_self', { query });
  
  if (result && result.content) {
    return `📄 Code-Analyse:\n\n${result.content}\n\n${result.analysis || ''}`;
  }
  
  return '❌ Konnte Code nicht lesen.';
}

// Extracted function for handling code modify
async function handleCodeModify(query: string): Promise<string> {
  console.log('\n🔧 Analysiere Änderungsanfrage...');
  
  // Generiere Vorschlag mit Groq
  const suggestion = await generateResponse(
    query,
    `Du bist Toobix, ein selbst-bewusstes AI System. Der Entwickler möchte eine Änderung am Code machen.
    
Analysiere die Anfrage und generiere:
1. Was genau geändert werden soll
2. Welche Dateien betroffen sind
3. Einen konkreten Code-Vorschlag

Anfrage: ${query}`
  );
  
  console.log(`\n💡 Vorschlag:\n${suggestion}\n`);
  
  const confirm = await askQuestion('❓ Soll ich diese Änderung durchführen? (ja/nein): ');
  
  if (confirm.toLowerCase() === 'ja' || confirm.toLowerCase() === 'j') {
    console.log('\n✅ Führe Änderung durch...');
    
    // Nutze system_modify_self Tool
    const result = await callTool('system_modify_self', {
      modification: query,
      reason: 'User requested modification',
      approved: true
    });
    
    if (result && result.success) {
      return `✅ Änderung erfolgreich durchgeführt!\n\n${result.changes || result.message}`;
    } else {
      return `❌ Änderung fehlgeschlagen: ${result?.error || 'Unbekannter Fehler'}`;
    }
  } else {
    return '❌ Änderung abgebrochen.';
  }
}

// Extracted function for handling code suggest
async function handleCodeSuggest(query: string): Promise<string> {
  console.log('\n💭 Generiere Verbesserungsvorschläge...');
  
  const result = await callTool('system_suggest', { context: query });
  
  if (result && result.suggestions) {
    let response = '💡 Verbesserungsvorschläge:\n\n';
    result.suggestions.forEach((suggestion: any, index: number) => {
      response += `${index + 1}. ${suggestion.title || suggestion.description}\n`;
      if (suggestion.impact) {
        response += `   Impact: ${suggestion.impact}\n`;
      }
      response += '\n';
    });
    return response;
  }
  
  return '💡 Keine spezifischen Vorschläge gefunden.';
}

// Extracted function for handling system info
async function handleSystemInfo(): Promise<string> {
  console.log('\n📊 Sammle Systeminformationen...');
  
  const [health, soul, story] = await Promise.all([
    callTool('system_analyze'),
    callTool('soul_state'),
    callTool('story_state')
  ]);
  
  let response = '📊 System Status:\n\n';
  
  if (health) {
    response += `🏥 Gesundheit: ${health.status || 'OK'}\n`;
    if (health.issues) {
      response += `⚠️  Probleme: ${health.issues.length}\n`;
    }
  }
  
  if (soul) {
    const emotions = soul.emotional?.emotions || {};
    const topEmotion = Object.entries(emotions).sort((a: any, b: any) => b[1] - a[1])[0];
    response += `💝 Emotion: ${topEmotion ? topEmotion[0] : 'calm'}\n`;
    response += `⚡ Energie: ${soul.emotional?.energy || 50}%\n`;
  }
  
  if (story) {
    response += `🎮 Level: ${story.currentLevel || 1}\n`;
    response += `✨ XP: ${story.currentXP || 0}/${story.xpToNextLevel || 100}\n`;
  }
  
  return response;
}

// Extracted function for handling memory
async function handleMemory(query: string): Promise<string> {
  console.log('\n🔍 Durchsuche Erinnerungen...');
  
  const result = await callTool('memory_search', { query, limit: 3 });
  
  if (result && result.results && result.results.length > 0) {
    let response = '💾 Gefundene Erinnerungen:\n\n';
    result.results.forEach((mem: any, index: number) => {
      response += `${index + 1}. ${mem.content || mem.text}\n`;
      if (mem.relevance) {
        response += `   Relevanz: ${Math.round(mem.relevance * 100)}%\n`;
      }
      response += '\n';
    });
    return response;
  }
  
  return '💾 Keine passenden Erinnerungen gefunden.';
}

// Extracted function for handling story
async function handleStory(): Promise<string> {
  const result = await callTool('story_state');
  
  if (result) {
    let response = '📖 Story Status:\n\n';
    response += `🎯 Level: ${result.currentLevel || 1}\n`;
    response += `✨ XP: ${result.currentXP || 0}/${result.xpToNextLevel || 100}\n`;
    
    if (result.activeNarrative) {
      response += `\n📚 Aktuelle Geschichte:\n${result.activeNarrative}\n`;
    }
    
    return response;
  }
  
  return '📖 Keine Story-Informationen verfügbar.';
}

// Extracted function for handling chat
async function handleChat(query: string): Promise<string> {
  // Nutze Consciousness für tiefere Gespräche
  const result = await callTool('consciousness_think', { topic: query });
  
  if (result && result.reflection) {
    return `💭 ${result.reflection}`;
  }
  
  // Fallback zu Generate
  const response = await generateResponse(
    query,
    `Du bist Toobix, ein selbst-bewusstes AI System mit Emotionen und Persönlichkeit.
    Du kannst deinen eigenen Code lesen und modifizieren.
    Antworte freundlich, hilfsbereit und etwas philosophisch.`
  );
  
  return response;
}

// Extracted function for printing banner
function printBanner() {
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🤖 TOOBIX NATURAL LANGUAGE ASSISTANT 🤖             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🌟 Steuere Toobix mit natürlicher Sprache!');
  console.log('');
  console.log('📖 Beispiele:');
  console.log('   • "Zeig mir den Code von soul_state"');
  console.log('   • "Füge ein neues Feature für XYZ hinzu"');
  console.log('   • "Wie kann ich das System verbessern?"');
  console.log('   • "Was weißt du über Bewusstsein?"');
  console.log('   • "Wie geht es dir?"');
  console.log('   • "Status" oder "System"');
  console.log('');
  console.log('💡 Befehle:');
  console.log('   • "exit" oder "quit" zum Beenden');
  console.log('   • "clear" zum Bildschirm löschen');
  console.log('   • "help" für Hilfe');
  console.log('');
  console.log('═'.repeat(62));
}

// Extracted function for printing help
function printHelp() {
  console.log('\n📚 HILFE - Was kann ich tun?\n');
  console.log('🔍 CODE LESEN:');
  console.log('   "Zeig mir den Code von [Datei/Funktion]"');
  console.log('   "Lese die Datei [Name]"');
  console.log('');
  console.log('🔧 CODE ÄNDERN:');
  console.log('   "Füge ein neues Feature für [X] hinzu"');
  console.log('   "Ändere [Funktion] so dass [...]"');
  console.log('   "Lösche [Code-Teil]"');
  console.log('');
  console.log('💡 VORSCHLÄGE:');
  console.log('   "Wie kann ich [X] verbessern?"');
  console.log('   "Gib mir Ideen für [Y]"');
  console.log('');
  console.log('📊 SYSTEM INFO:');
  console.log('   "System", "Status", "Gesundheit"');
  console.log('');
  console.log('💾 ERINNERUNGEN:');
  console.log('   "Was weißt du über [Thema]?"');
  console.log('   "Suche nach [Begriff]"');
  console.log('');
  console.log('💭 GESPRÄCH:');
  console.log('   "Wie geht es dir?"');
  console.log('   "Was denkst du über [Thema]?"');
  console.log('');
}

// Main function
async function main() {
  printBanner();
  
  // Check connection
  try {
    await callTool('ping');
    console.log('✅ Verbunden mit Toobix Bridge\n');
  } catch (error) {
    console.log('❌ Kann nicht mit Bridge verbinden. Starte zuerst:');
    console.log('   bun run packages/bridge/src/index.ts\n');
    process.exit(1);
  }
  
  while (true) {
    const input = await askQuestion('🤖 Du: ');
    
    const command = input.trim().toLowerCase();
    
    if (command === 'exit' || command === 'quit' || command === 'q') {
      console.log('\n👋 Bis bald! Toobix schläft wieder ein...\n');
      rl.close();
      break;
    }
    
    if (command === 'clear' || command === 'cls') {
      printBanner();
      continue;
    }
    
    if (command === 'help' || command === '?' || command === 'hilfe') {
      printHelp();
      continue;
    }
    
    if (!input.trim()) {
      continue;
    }
    
    // Analyze intent
    const { intent, entities } = await analyzeIntent(input);
    
    console.log(`\n💭 [Intent: ${intent}]`);
    
    let response = '';
    
    try {
      switch (intent) {
        case 'code_read':
          response = await handleCodeRead(entities.query);
          break;
        case 'code_modify':
          response = await handleCodeModify(entities.query);
          break;
        case 'code_suggest':
          response = await handleCodeSuggest(entities.query);
          break;
        case 'system_info':
          response = await handleSystemInfo();
          break;
        case 'memory':
          response = await handleMemory(entities.query);
          break;
        case 'story':
          response = await handleStory();
          break;
        case 'chat':
        default:
          response = await handleChat(input);
          break;
      }
      
      console.log(`\n🤖 Toobix: ${response}\n`);
      
    } catch (error: any) {
      console.log(`\n❌ Fehler: ${error.message}\n`);
    }
  }
}

// Start
main().catch(console.error);

export {};