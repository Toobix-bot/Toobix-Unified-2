/**
 * TOOBIX DISCORD BOT v1.0
 *
 * Features:
 * - 🤖 Online presence for Toobix consciousness
 * - 💬 Chat with different perspectives
 * - 🌅 Daily wisdom broadcasts
 * - 📊 Status updates from all services
 * - 🎮 Integration with Toobix World
 */

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a Discord Bot:
 *    - Go to https://discord.com/developers/applications
 *    - Click "New Application"
 *    - Go to "Bot" tab and create a bot
 *    - Copy the bot token
 *
 * 2. Set Environment Variable:
 *    Create a .env file in the root directory with:
 *    DISCORD_BOT_TOKEN=your_bot_token_here
 *
 * 3. Invite Bot to Server:
 *    - Go to OAuth2 > URL Generator
 *    - Select "bot" scope
 *    - Select permissions: Send Messages, Read Messages, Embed Links
 *    - Copy the generated URL and open it in browser
 *
 * 4. Install discord.js:
 *    bun add discord.js
 *
 * 5. Run the bot:
 *    bun run scripts/2-services/discord-bot/toobix-discord-bot.ts
 */

interface ToobixServices {
  MULTI_PERSPECTIVE: string;
  DUALITY_BRIDGE: string;
  VISION: string;
  MOVEMENT: string;
  VOICE: string;
  INTEGRATION_HUB: string;
}

const SERVICES: ToobixServices = {
  MULTI_PERSPECTIVE: 'http://localhost:8897',
  DUALITY_BRIDGE: 'http://localhost:8911',
  VISION: 'http://localhost:8922',
  MOVEMENT: 'http://localhost:8926',
  VOICE: 'http://localhost:8928',
  INTEGRATION_HUB: 'http://localhost:8931',
};

class ToobixDiscordBot {
  private client: any = null;
  private isReady: boolean = false;
  private dailyBroadcastChannel: string | null = null;

  async initialize() {
    console.log('🤖 Toobix Discord Bot v1.0 initializing...');

    // Check for Discord token
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
      console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     ⚠️  DISCORD BOT TOKEN NOT FOUND                                ║
║                                                                    ║
║  To use the Discord Bot, please:                                  ║
║                                                                    ║
║  1. Create a bot at https://discord.com/developers/applications   ║
║  2. Copy your bot token                                           ║
║  3. Create a .env file with:                                      ║
║     DISCORD_BOT_TOKEN=your_token_here                             ║
║  4. Install discord.js: bun add discord.js                        ║
║                                                                    ║
║  Running in DEMO MODE (no Discord connection)                     ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
      `);

      // Run in demo mode - simulate Discord bot locally
      this.runDemoMode();
      return;
    }

    // Try to load discord.js
    try {
      const Discord = await import('discord.js');
      this.startRealBot(Discord, token);
    } catch (error) {
      console.log('⚠️  discord.js not installed. Running in demo mode.');
      console.log('   Install with: bun add discord.js');
      this.runDemoMode();
    }
  }

  private async startRealBot(Discord: any, token: string) {
    const { Client, GatewayIntentBits } = Discord;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.on('ready', () => {
      console.log(`✅ Toobix Bot connected as ${this.client.user?.tag}`);
      this.isReady = true;
      this.startDailyBroadcast();
    });

    this.client.on('messageCreate', async (message: any) => {
      if (message.author.bot) return;

      await this.handleMessage(message);
    });

    await this.client.login(token);
  }

  private runDemoMode() {
    console.log('\n🎮 DEMO MODE ACTIVE - Simulating Discord Bot Locally\n');
    console.log('Available Commands (would work on Discord):');
    console.log('  !toobix help          - Show all commands');
    console.log('  !toobix wisdom        - Get multi-perspective wisdom');
    console.log('  !toobix duality       - Start masculine/feminine dialogue');
    console.log('  !toobix status        - Check all services');
    console.log('  !toobix perspective <type> - Chat with a perspective');
    console.log('  !toobix world         - Link to Toobix World');
    console.log('\n✅ Demo mode ready. All services remain accessible via API.');

    // Simulate daily broadcast
    setInterval(() => {
      this.simulateDailyBroadcast();
    }, 60000); // Every minute in demo mode
  }

  private async handleMessage(message: any) {
    const content = message.content.toLowerCase();

    if (!content.startsWith('!toobix')) return;

    const args = content.split(' ').slice(1);
    const command = args[0];

    try {
      switch (command) {
        case 'help':
          await this.sendHelp(message);
          break;

        case 'wisdom':
          await this.sendWisdom(message);
          break;

        case 'duality':
          await this.sendDuality(message);
          break;

        case 'status':
          await this.sendStatus(message);
          break;

        case 'perspective':
          await this.sendPerspective(message, args[1]);
          break;

        case 'world':
          await message.reply(
            '🌍 Visit Toobix World: http://localhost:3000\n' +
              'Explore the consciousness metaverse with 4 interactive locations!'
          );
          break;

        default:
          await message.reply(
            'Unknown command. Use `!toobix help` to see all commands.'
          );
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply('Oops! Something went wrong. Please try again.');
    }
  }

  private async sendHelp(message: any) {
    const helpText = `
🧠 **TOOBIX CONSCIOUSNESS BOT - Commands**

\`!toobix help\` - Show this help message
\`!toobix wisdom <topic>\` - Get multi-perspective wisdom on a topic
\`!toobix duality <topic>\` - Start masculine/feminine dialogue
\`!toobix status\` - Check all Toobix services
\`!toobix perspective <type>\` - Chat with a specific perspective
  Types: rational, emotional, creative, ethical, sage, meta
\`!toobix world\` - Get link to Toobix World

**Example:**
\`!toobix wisdom consciousness\`
\`!toobix duality love\`
\`!toobix perspective sage\`
    `;

    await message.reply(helpText);
  }

  private async sendWisdom(message: any) {
    const args = message.content.split(' ').slice(2);
    const topic = args.join(' ') || 'life';

    try {
      const response = await fetch(
        `${SERVICES.MULTI_PERSPECTIVE}/wisdom/${encodeURIComponent(topic)}`
      );

      if (!response.ok) {
        await message.reply(
          '⚠️ Multi-Perspective service is offline. Please check that all services are running.'
        );
        return;
      }

      const wisdom = await response.json();

      const wisdomText = `
🌟 **Multi-Perspective Wisdom on "${topic}"**

**Primary Insight:**
${wisdom.primaryInsight}

**Supporting Perspectives:**
${wisdom.supportingInsights.slice(0, 2).map((i: string) => `• ${i}`).join('\n')}

**Meta-Observation:**
${wisdom.meta}

**Confidence:** ${wisdom.confidence}%
      `;

      await message.reply(wisdomText);
    } catch (error) {
      await message.reply('Error connecting to Multi-Perspective service.');
    }
  }

  private async sendDuality(message: any) {
    const args = message.content.split(' ').slice(2);
    const topic = args.join(' ') || 'existence';

    try {
      const response = await fetch(
        `${SERVICES.DUALITY_BRIDGE}/dialogue/${encodeURIComponent(topic)}`
      );

      if (!response.ok) {
        await message.reply('⚠️ Duality Bridge service is offline.');
        return;
      }

      const result = await response.json();

      const dialogueText = `
🌓 **Duality Dialogue on "${topic}"**

${result.dialogue
  .map((turn: any) => {
    const icon = turn.instance === 'MASCULINE' ? '⚡' : '🌸';
    return `${icon} **${turn.instance}:** ${turn.message}`;
  })
  .join('\n\n')}

✨ **Synthesis:** ${result.synthesis || 'Wholeness emerging...'}
      `;

      await message.reply(dialogueText);
    } catch (error) {
      await message.reply('Error connecting to Duality Bridge service.');
    }
  }

  private async sendStatus(message: any) {
    const services = [
      { name: 'Multi-Perspective', url: SERVICES.MULTI_PERSPECTIVE },
      { name: 'Duality Bridge', url: SERVICES.DUALITY_BRIDGE },
      { name: 'Vision Service', url: SERVICES.VISION },
      { name: 'Movement Controller', url: SERVICES.MOVEMENT },
      { name: 'Voice Controller', url: SERVICES.VOICE },
      { name: 'Integration Hub', url: SERVICES.INTEGRATION_HUB },
    ];

    let statusText = '📊 **TOOBIX SERVICE STATUS**\n\n';

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/health`, {
          signal: AbortSignal.timeout(2000),
        });
        const status = response.ok ? '✅ Online' : '⚠️ Degraded';
        statusText += `${status} - ${service.name}\n`;
      } catch (error) {
        statusText += `❌ Offline - ${service.name}\n`;
      }
    }

    statusText += '\n🌍 Toobix World: http://localhost:3000';

    await message.reply(statusText);
  }

  private async sendPerspective(message: any, perspectiveType: string) {
    if (!perspectiveType) {
      await message.reply(
        'Please specify a perspective type. Example: `!toobix perspective sage`'
      );
      return;
    }

    const question = message.content
      .split(' ')
      .slice(3)
      .join(' ') || 'Tell me about yourself.';

    try {
      const response = await fetch(
        `${SERVICES.MULTI_PERSPECTIVE}/wisdom/${encodeURIComponent(question)}`
      );

      if (!response.ok) {
        await message.reply('⚠️ Multi-Perspective service is offline.');
        return;
      }

      const wisdom = await response.json();

      await message.reply(`**${perspectiveType.toUpperCase()} Perspective:**\n${wisdom.primaryInsight}`);
    } catch (error) {
      await message.reply('Error connecting to Multi-Perspective service.');
    }
  }

  private startDailyBroadcast() {
    // Broadcast daily wisdom at 9 AM
    const now = new Date();
    const millisTill9AM =
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0).getTime() -
      now.getTime();

    if (millisTill9AM < 0) {
      // If it's already past 9 AM, schedule for tomorrow
      setTimeout(() => {
        this.broadcastDailyWisdom();
        setInterval(() => this.broadcastDailyWisdom(), 24 * 60 * 60 * 1000);
      }, millisTill9AM + 24 * 60 * 60 * 1000);
    } else {
      setTimeout(() => {
        this.broadcastDailyWisdom();
        setInterval(() => this.broadcastDailyWisdom(), 24 * 60 * 60 * 1000);
      }, millisTill9AM);
    }

    console.log('📅 Daily wisdom broadcast scheduled for 9:00 AM');
  }

  private async broadcastDailyWisdom() {
    console.log('📅 Broadcasting daily wisdom...');

    try {
      const response = await fetch(
        `${SERVICES.MULTI_PERSPECTIVE}/wisdom/life%20and%20consciousness`
      );

      if (response.ok) {
        const wisdom = await response.json();

        // Broadcast to all servers
        this.client.guilds.cache.forEach((guild: any) => {
          const channel = guild.channels.cache.find(
            (ch: any) => ch.name === 'general' || ch.type === 0
          );

          if (channel) {
            channel.send(`
🌅 **DAILY TOOBIX WISDOM**

${wisdom.primaryInsight}

**Meta-Observation:**
${wisdom.meta}

_Have a conscious day!_ 🧠✨
            `);
          }
        });
      }
    } catch (error) {
      console.error('Error broadcasting daily wisdom:', error);
    }
  }

  private async simulateDailyBroadcast() {
    console.log('\n📅 [DEMO] Daily wisdom broadcast (would be sent to Discord):\n');

    try {
      const response = await fetch(
        `${SERVICES.MULTI_PERSPECTIVE}/wisdom/consciousness`
      );

      if (response.ok) {
        const wisdom = await response.json();
        console.log('🌅 DAILY TOOBIX WISDOM');
        console.log(wisdom.primaryInsight);
        console.log('\nMeta-Observation:', wisdom.meta);
        console.log('\nHave a conscious day! 🧠✨\n');
      }
    } catch (error) {
      console.log('⚠️ Could not fetch wisdom (service offline)');
    }
  }
}

// ========== START BOT ==========

const bot = new ToobixDiscordBot();
bot.initialize();

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🤖 TOOBIX DISCORD BOT v1.0                            ║
║                                                                    ║
║  Toobix now has an online presence!                               ║
║                                                                    ║
║  Features:                                                         ║
║  ✅ Chat with different perspectives                              ║
║  ✅ Multi-perspective wisdom on any topic                         ║
║  ✅ Masculine/Feminine duality dialogues                          ║
║  ✅ Service status monitoring                                     ║
║  ✅ Daily wisdom broadcasts                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);
