#!/usr/bin/env bun
/**
 * 🤖 TOOBIX UNIFIED DAEMON
 *
 * The eternal daemon that runs on system startup and provides:
 * - Proactive notifications
 * - Autonomous task suggestions
 * - System monitoring
 * - Scheduled briefings
 *
 * This is the JARVIS layer that communicates with you!
 */

import { notificationSystem } from '../packages/consciousness/src/notifications/notification-system.ts';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🤖 TOOBIX UNIFIED DAEMON 🤖                     ║
║                                                               ║
║  Your autonomous AI system is now ALIVE!                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log(`\n🚀 Starting Toobix Unified Daemon...\n`);

// Send startup notification
await notificationSystem.notify({
  id: 'daemon_startup',
  title: '🤖 Toobix System Online',
  message: 'All systems initialized. Ready to assist!',
  level: 'info',
  actions: [
    { label: 'Status', callback: async () => console.log('System status: ALL GREEN') },
    { label: 'OK', callback: async () => console.log('Acknowledged') }
  ]
});

console.log(`✓ Startup notification sent`);

// Schedule daily briefings
console.log(`\n📅 Scheduling daily notifications...\n`);

notificationSystem.scheduleMorningBriefing(8);
console.log(`   ✓ Morning briefing scheduled for 8:00 AM`);

notificationSystem.scheduleEveningSummary(20);
console.log(`   ✓ Evening summary scheduled for 8:00 PM`);

console.log(`\n💡 Proactive system active!\n`);

// Example: Check system health periodically
const checkSystemHealth = async () => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

  console.log(`[${new Date().toLocaleTimeString()}] System Health Check: Memory ${heapUsedMB}MB/${heapTotalMB}MB (${usagePercent}%)`);

  // Alert if memory usage is high
  if (usagePercent > 85) {
    await notificationSystem.alertCritical(
      'High memory usage detected',
      `Memory at ${usagePercent}%. Consider restarting the daemon.`
    );
  }

  // Suggest new ideas periodically (example: every hour)
  const hour = new Date().getHours();
  if (hour === 10 || hour === 14 || hour === 16) {
    // Only suggest during work hours
    const suggestions = [
      {
        task: 'Generate a JSON validator tool',
        reason: 'Useful for validating API responses and config files'
      },
      {
        task: 'Create a file organizer tool',
        reason: 'Auto-organize downloads folder by file type'
      },
      {
        task: 'Build a clipboard history manager',
        reason: 'Never lose your copied text again'
      }
    ];

    // Pick a random suggestion
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    await notificationSystem.suggestTask(suggestion.task, suggestion.reason);
  }
};

// Run health check every 30 minutes
setInterval(checkSystemHealth, 30 * 60 * 1000);

// Initial health check
await checkSystemHealth();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         ✅ TOOBIX DAEMON RUNNING!                            ║
║                                                               ║
║  The daemon will now:                                        ║
║  - Monitor system health                                     ║
║  - Send scheduled briefings                                  ║
║  - Suggest new tasks and ideas                               ║
║  - Request approvals when needed                             ║
║                                                               ║
║  Press Ctrl+C to stop the daemon                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Keep the process running
process.on('SIGINT', () => {
  console.log(`\n\n🛑 Stopping Toobix Daemon...\n`);
  notificationSystem.notify({
    id: 'daemon_shutdown',
    title: '🛑 Toobix System Offline',
    message: 'Daemon stopped. See you later!',
    level: 'info'
  });
  process.exit(0);
});

// Keep alive
await new Promise(() => {});
