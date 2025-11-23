/**
 * 📊 TOOBIX STATUS BAR
 * Shows Toobix status in VS Code status bar
 */

import * as vscode from 'vscode';
import { ToobixServiceManager } from './ToobixServiceManager';

export class ToobixStatusBar implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;
  private updateInterval?: NodeJS.Timeout;

  constructor(
    private context: vscode.ExtensionContext,
    private serviceManager: ToobixServiceManager
  ) {
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    this.statusBarItem.command = 'toobix.openDashboard';
    this.context.subscriptions.push(this.statusBarItem);
    
    this.statusBarItem.show();
    
    // Start updating
    this.startUpdating();
  }

  private startUpdating() {
    // Update immediately
    this.update();
    
    // Then update every 10 seconds
    this.updateInterval = setInterval(() => {
      this.update();
    }, 10000);
  }

  private async update() {
    try {
      const [hardware, feeling] = await Promise.all([
        this.serviceManager.getHardwareState(),
        this.serviceManager.getFeeling()
      ]);

      // Create status text
      const emoji = this.getEmotionEmoji(feeling?.emotion);
      const temp = hardware.temperature ? `${Math.round(hardware.temperature)}°C` : 'N/A';
      
      this.statusBarItem.text = `$(pulse) ${emoji} ${Math.round(hardware.cpu)}% | ${temp}`;
      this.statusBarItem.tooltip = `Toobix: ${feeling?.emotion ?? 'unbekannt'}\n${feeling?.feeling ?? ''}\n\nClick to open dashboard`;
      
    } catch (error) {
      this.statusBarItem.text = `$(pulse) 🌙 Offline`;
      this.statusBarItem.tooltip = 'Toobix services not running\nClick to start';
    }
  }

  private getEmotionEmoji(emotion?: string): string {
    const emojiMap: Record<string, string> = {
      'stressed': '😰',
      'intensely focused': '🎯',
      'energetically engaged': '⚡',
      'productively working': '💼',
      'calmly active': '😌',
      'peacefully resting': '😴',
      'quietly contemplating': '🤔',
      'balanced and present': '☯️',
      'offline': '🌙'
    };
    
      if (!emotion) {
        return '[?]';
      }
      return emojiMap[emotion.toLowerCase()] || '[?]';
    }

  public dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.statusBarItem.dispose();
  }
}



