"use strict";
/**
 * 📊 TOOBIX STATUS BAR
 * Shows Toobix status in VS Code status bar
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToobixStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class ToobixStatusBar {
    constructor(context, serviceManager) {
        this.context = context;
        this.serviceManager = serviceManager;
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'toobix.openDashboard';
        this.context.subscriptions.push(this.statusBarItem);
        this.statusBarItem.show();
        // Start updating
        this.startUpdating();
    }
    startUpdating() {
        // Update immediately
        this.update();
        // Then update every 10 seconds
        this.updateInterval = setInterval(() => {
            this.update();
        }, 10000);
    }
    async update() {
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
        }
        catch (error) {
            this.statusBarItem.text = `$(pulse) 🌙 Offline`;
            this.statusBarItem.tooltip = 'Toobix services not running\nClick to start';
        }
    }
    getEmotionEmoji(emotion) {
        const emojiMap = {
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
    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.statusBarItem.dispose();
    }
}
exports.ToobixStatusBar = ToobixStatusBar;
//# sourceMappingURL=ToobixStatusBar.js.map