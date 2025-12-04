/**
 * Electron Preload Script
 * Sichere Brücke zwischen Renderer und Main Process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('toobix', {
  // Service management
  startServices: () => ipcRenderer.invoke('start-services'),
  stopServices: () => ipcRenderer.invoke('stop-services'),
  getServiceStatus: () => ipcRenderer.invoke('get-service-status'),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Event listeners
  onServiceLog: (callback) => ipcRenderer.on('service-log', (_, data) => callback(data)),
  onServiceError: (callback) => ipcRenderer.on('service-error', (_, data) => callback(data)),
  onServicesStarted: (callback) => ipcRenderer.on('services-started', callback),
  onServicesStopped: (callback) => ipcRenderer.on('services-stopped', (_, code) => callback(code)),
  
  // System info
  platform: process.platform,
  version: process.versions.electron
});
