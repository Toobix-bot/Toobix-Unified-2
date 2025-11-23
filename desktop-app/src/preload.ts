/**
 * TOOBIX UNIFIED - PRELOAD SCRIPT
 * 
 * Sichere Bridge zwischen Electron und React
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Service Management
  getServices: () => ipcRenderer.invoke('get-services'),
  startService: (serviceId: string) => ipcRenderer.invoke('start-service', serviceId),
  stopService: (serviceId: string) => ipcRenderer.invoke('stop-service', serviceId),
  restartService: (serviceId: string) => ipcRenderer.invoke('restart-service', serviceId),
  getServiceStatus: (serviceId: string) => ipcRenderer.invoke('get-service-status', serviceId),
  getAllServiceStatus: () => ipcRenderer.invoke('get-all-service-status'),
  
  // Groq API
  chatWithGroq: (message: string, context?: any) => ipcRenderer.invoke('chat-with-groq', message, context),
  setGroqApiKey: (apiKey: string) => ipcRenderer.invoke('set-groq-api-key', apiKey),
  getGroqApiKey: () => ipcRenderer.invoke('get-groq-api-key'),
  
  // Hybrid AI
  getAIState: () => ipcRenderer.invoke('get-ai-state'),
  analyzeWithAI: (input: string, context?: any) => ipcRenderer.invoke('analyze-with-ai', input, context),
  trainNetwork: (networkId: string, trainingData: any, epochs?: number) => ipcRenderer.invoke('train-network', networkId, trainingData, epochs),
  evolveAI: () => ipcRenderer.invoke('evolve-ai'),
  makePrediction: (type: string, data: any) => ipcRenderer.invoke('make-prediction', type, data),
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Life-Domain Chat
  getLifeDomains: () => ipcRenderer.invoke('get-life-domains'),
  lifeDomainChat: (domainId: string, message: string) => ipcRenderer.invoke('life-domain-chat', domainId, message),
  getDomainHistory: (domainId: string) => ipcRenderer.invoke('get-domain-history', domainId),
  getCrossDomainInsights: (domains: string[]) => ipcRenderer.invoke('get-cross-domain-insights', domains),

  // Event Listeners
  onServiceLog: (callback: (event: any) => void) => {
    ipcRenderer.on('service-log', (_, data) => callback(data));
  },
  onServiceStatusChanged: (callback: (event: any) => void) => {
    ipcRenderer.on('service-status-changed', (_, data) => callback(data));
  },
  onUpdateAvailable: (callback: (event: any) => void) => {
    ipcRenderer.on('update-available', (_, data) => callback(data));
  }
});

// Type definitions for TypeScript
export interface ElectronAPI {
  getServices: () => Promise<any[]>;
  startService: (serviceId: string) => Promise<boolean>;
  stopService: (serviceId: string) => Promise<boolean>;
  restartService: (serviceId: string) => Promise<boolean>;
  getServiceStatus: (serviceId: string) => Promise<string>;
  getAllServiceStatus: () => Promise<Record<string, string>>;
  chatWithGroq: (message: string, context?: any) => Promise<string>;
  setGroqApiKey: (apiKey: string) => Promise<boolean>;
  getGroqApiKey: () => Promise<string>;
  getAIState: () => Promise<any>;
  analyzeWithAI: (input: string, context?: any) => Promise<any>;
  trainNetwork: (networkId: string, trainingData: any, epochs?: number) => Promise<any>;
  evolveAI: () => Promise<any>;
  makePrediction: (type: string, data: any) => Promise<any>;
  checkOllama: () => Promise<any>;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  getLifeDomains: () => Promise<any>;
  lifeDomainChat: (domainId: string, message: string) => Promise<any>;
  getDomainHistory: (domainId: string) => Promise<any>;
  getCrossDomainInsights: (domains: string[]) => Promise<any>;
  onServiceLog: (callback: (event: any) => void) => void;
  onServiceStatusChanged: (callback: (event: any) => void) => void;
  onUpdateAvailable: (callback: (event: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
