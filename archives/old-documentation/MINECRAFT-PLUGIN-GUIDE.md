# Minecraft Plugin Development Guide for Toobix Bot System

**Created:** 2025-12-03
**Target Version:** Minecraft 1.20.1
**API:** Paper API (recommended over Spigot)

---

## Table of Contents
1. [Overview & Setup](#overview--setup)
2. [Paper vs Spigot Decision](#paper-vs-spigot-decision)
3. [Development Environment Setup](#development-environment-setup)
4. [Key APIs Reference](#key-apis-reference)
5. [Plugin 1: Team-Telepathy](#plugin-1-team-telepathy)
6. [Plugin 2: Shared Inventory](#plugin-2-shared-inventory)
7. [Plugin 3: Role-Abilities](#plugin-3-role-abilities)
8. [Difficulty Assessment](#difficulty-assessment)
9. [Development Roadmap](#development-roadmap)
10. [Additional Resources](#additional-resources)

---

## Overview & Setup

### Why Paper API?

**Paper is the clear winner for 2025 plugin development:**
- **Performance:** 20-50% TPS improvement over Spigot on busy servers
- **Market Share:** 10x more users than Spigot
- **API Capabilities:** Significantly more features than Spigot API
- **Backwards Compatible:** All Bukkit and Spigot plugins work on Paper
- **Active Development:** Paper hard-forked from Spigot in 2024 and applies nearly 1,600 additional patches with 130,000+ lines of code

**Recommendation:** Use Paper API for all three plugins. Paper maintains Spigot compatibility while offering superior performance and features.

### Version Target

**Target: Minecraft 1.20.1**
- Stable release with good plugin support
- Note: As of 1.20.5+, Paper uses Mojang mappings instead of Spigot mappings
- For 1.20.1, you'll use Spigot mappings (obfuscated names)

---

## Development Environment Setup

### Prerequisites
- **Java 17+** (required for Minecraft 1.20.1)
- **IntelliJ IDEA** (recommended IDE)
- **Gradle** (build system - Paper's official tool)

### Project Setup (Gradle - Kotlin DSL)

**Step 1: Create New Project**
1. In IntelliJ: File → New Project
2. Select "Gradle - Kotlin DSL"
3. Click Create

**Step 2: Configure `build.gradle.kts`**

```kotlin
plugins {
    java
    id("io.papermc.paperweight.userdev") version "1.5.5" // For NMS access if needed
}

group = "com.toobix"
version = "1.0.0"
description = "Toobix Bot System Plugins"

repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/") {
        name = "papermc"
    }
}

dependencies {
    paperweight.paperDevBundle("1.20.1-R0.1-SNAPSHOT")

    // Optional: ProtocolLib for packet manipulation
    compileOnly("com.comphenix.protocol:ProtocolLib:5.1.0")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(17))
}

tasks {
    assemble {
        dependsOn(reobfJar)
    }

    compileJava {
        options.encoding = Charsets.UTF_8.name()
        options.release.set(17)
    }

    processResources {
        filteringCharset = Charsets.UTF_8.name()
    }
}
```

**Step 3: Create `plugin.yml`**

Location: `src/main/resources/plugin.yml`

```yaml
name: ToobixTelepathy
version: '${version}'
main: com.toobix.telepathy.TeamTelepathyPlugin
api-version: '1.20'
authors: [ YourName ]
description: Direct bot-to-bot communication system
```

**Step 4: Build Your Plugin**

```bash
# Build with Gradle
./gradlew build

# Output JAR location: build/libs/your-plugin.jar
```

**Step 5: Testing**

Use the `Run-Task` Gradle plugin to automatically download and run a Paper server for testing:

```kotlin
plugins {
    id("xyz.jpenilla.run-paper") version "2.1.0"
}

tasks {
    runServer {
        minecraftVersion("1.20.1")
    }
}
```

---

## Key APIs Reference

### 1. Player Messaging API

**Basic Messaging:**
```java
Player player = Bukkit.getPlayer("BotName");
player.sendMessage("Hello, bot!");
```

**Custom Invisible Messages (ProtocolLib):**
For messages invisible to humans, use custom packets via ProtocolLib. This prevents chat spam and allows bot-specific communication.

```java
// Using ProtocolLib to send custom packets
PacketContainer packet = protocolManager.createPacket(PacketType.Play.Server.CHAT);
packet.getStrings().write(0, "{\"text\":\"Bot message\",\"color\":\"dark_gray\"}");
protocolManager.sendServerPacket(player, packet);
```

**Alternative: Plugin Messaging Channels**
Paper supports plugin messaging channels for cross-server communication:

```java
// Register channel
getServer().getMessenger().registerOutgoingPluginChannel(this, "toobix:telepathy");

// Send message
ByteArrayDataOutput out = ByteStreams.newDataOutput();
out.writeUTF("TeamChat");
out.writeUTF("Message content");
player.sendPluginMessage(this, "toobix:telepathy", out.toByteArray());
```

### 2. Inventory & Chest API

**Creating Custom Inventories:**
```java
// Create custom inventory
Inventory inv = Bukkit.createInventory(null, 54, "Team Storage");

// Custom InventoryHolder
public class TeamChestHolder implements InventoryHolder {
    private final Inventory inventory;
    private final String teamId;

    public TeamChestHolder(String teamId) {
        this.teamId = teamId;
        this.inventory = Bukkit.createInventory(this, 54, "Team Chest - " + teamId);
    }

    @Override
    public Inventory getInventory() {
        return inventory;
    }

    public String getTeamId() {
        return teamId;
    }
}
```

**Persistent Chest Metadata (PDC):**
```java
// Get chest tile entity
Chest chest = (Chest) block.getState();
PersistentDataContainer pdc = chest.getPersistentDataContainer();

// Store custom data
NamespacedKey key = new NamespacedKey(plugin, "team_id");
pdc.set(key, PersistentDataType.STRING, "team_alpha");

// Read custom data
if (pdc.has(key, PersistentDataType.STRING)) {
    String teamId = pdc.get(key, PersistentDataType.STRING);
}

// Update chest
chest.update();
```

**Inventory Events:**
```java
@EventHandler
public void onInventoryClick(InventoryClickEvent event) {
    if (event.getInventory().getHolder() instanceof TeamChestHolder) {
        TeamChestHolder holder = (TeamChestHolder) event.getInventory().getHolder();
        // Log transaction, sync with other chests, etc.
    }
}
```

### 3. Potion Effects & Attributes API

**Speed & Efficiency Bonuses:**
```java
// Speed boost
PotionEffect speed = new PotionEffect(
    PotionEffectType.SPEED,    // Effect type
    Integer.MAX_VALUE,          // Duration (infinite)
    1,                          // Amplifier (level 2)
    false,                      // Ambient (false = more visible)
    false,                      // Particles visible
    false                       // Icon visible
);
player.addPotionEffect(speed);

// Mining efficiency
PotionEffect haste = new PotionEffect(
    PotionEffectType.HASTE,
    Integer.MAX_VALUE,
    2,
    false,
    false,
    false
);
player.addPotionEffect(haste);
```

**Attribute Modifiers (Permanent):**
```java
import org.bukkit.attribute.Attribute;
import org.bukkit.attribute.AttributeInstance;
import org.bukkit.attribute.AttributeModifier;

// Get attribute instance
AttributeInstance attribute = player.getAttribute(Attribute.GENERIC_MOVEMENT_SPEED);

// Create modifier
AttributeModifier modifier = new AttributeModifier(
    UUID.randomUUID(),
    "scout_speed_bonus",
    0.2,                                    // +20% speed
    AttributeModifier.Operation.ADD_SCALAR
);

// Add modifier
attribute.addModifier(modifier);

// Remove modifier later
attribute.removeModifier(modifier);
```

### 4. Particle Effects API

**Spawning Particles:**
```java
// Spawn particles for all players
world.spawnParticle(
    Particle.VILLAGER_HAPPY,   // Particle type
    location,                   // Location
    10,                         // Count
    0.5, 0.5, 0.5,             // Offset X, Y, Z
    0.1                         // Speed/extra data
);

// Spawn particles for specific player only
player.spawnParticle(
    Particle.REDSTONE,
    location,
    5,
    new Particle.DustOptions(Color.YELLOW, 2.0f)  // Custom color & size
);

// Block highlighting (ore-finder effect)
Location oreLocation = /* ... */;
world.spawnParticle(
    Particle.WAX_ON,
    oreLocation.clone().add(0.5, 0.5, 0.5),
    20,
    0.3, 0.3, 0.3,
    0
);
```

**ParticleBuilder (Paper API - Preferred):**
```java
// Reusable particle builder
Particle.builder()
    .type(Particle.FLAME)
    .location(location)
    .count(10)
    .offset(0.5, 0.5, 0.5)
    .extra(0.05)
    .spawn();
```

### 5. Cooldown Management

**Simple HashMap Approach:**
```java
private final Map<UUID, Long> cooldowns = new HashMap<>();

public boolean hasCooldown(Player player, long cooldownMillis) {
    UUID uuid = player.getUniqueId();
    if (cooldowns.containsKey(uuid)) {
        long timeLeft = cooldowns.get(uuid) - System.currentTimeMillis();
        return timeLeft > 0;
    }
    return false;
}

public void setCooldown(Player player, long cooldownMillis) {
    cooldowns.put(player.getUniqueId(), System.currentTimeMillis() + cooldownMillis);
}

public long getCooldownRemaining(Player player) {
    UUID uuid = player.getUniqueId();
    if (cooldowns.containsKey(uuid)) {
        return Math.max(0, cooldowns.get(uuid) - System.currentTimeMillis());
    }
    return 0;
}
```

**Display Cooldown to Player:**
```java
// Action bar message
player.sendActionBar(Component.text("Ability ready in: " + seconds + "s"));

// Title message
player.showTitle(Title.title(
    Component.text("Ability on Cooldown"),
    Component.text(seconds + " seconds remaining"),
    Title.Times.times(Duration.ofMillis(0), Duration.ofSeconds(2), Duration.ofMillis(500))
));
```

### 6. Block Highlighting & Detection

**Finding Nearby Ores:**
```java
public List<Block> findNearbyOres(Location center, int radius, Material oreType) {
    List<Block> ores = new ArrayList<>();
    World world = center.getWorld();

    for (int x = -radius; x <= radius; x++) {
        for (int y = -radius; y <= radius; y++) {
            for (int z = -radius; z <= radius; z++) {
                Block block = world.getBlockAt(
                    center.getBlockX() + x,
                    center.getBlockY() + y,
                    center.getBlockZ() + z
                );

                if (block.getType() == oreType) {
                    ores.add(block);
                }
            }
        }
    }

    return ores;
}
```

**Highlighting Blocks:**
```java
// Send fake glowing blocks to player
public void highlightBlock(Player player, Block block, int durationTicks) {
    Location loc = block.getLocation().add(0.5, 0.5, 0.5);

    // Spawn continuous particles
    BukkitRunnable task = new BukkitRunnable() {
        int ticksLeft = durationTicks;

        @Override
        public void run() {
            if (ticksLeft <= 0) {
                cancel();
                return;
            }

            player.spawnParticle(Particle.WAX_ON, loc, 3, 0.3, 0.3, 0.3, 0);
            ticksLeft--;
        }
    };

    task.runTaskTimer(plugin, 0, 1); // Run every tick
}
```

---

## Plugin 1: Team-Telepathy

### Overview
Direct bot-to-bot communication without chat spam. Messages are invisible to human players and support range-based filtering.

### Key Features
1. Silent messages (invisible to humans)
2. Team-based filtering (only team members receive)
3. Range-based communication (optional proximity limit)
4. Message logging for analytics
5. Integration with bot AI systems

### Technical Approach

**Method 1: Custom Plugin Messaging Channel (Recommended)**
- Use Paper's plugin messaging API
- No chat interference
- Easy to filter by team/range
- Direct integration with bot systems

**Method 2: ProtocolLib Packets**
- Send custom chat packets
- More control over display
- Requires ProtocolLib dependency

**Method 3: Custom Events**
- Create custom `BotMessageEvent`
- Bots listen for events directly
- No network overhead
- Best for same-server bots

### Pseudocode

```java
// Main Plugin Class
public class TeamTelepathyPlugin extends JavaPlugin {
    private final Map<String, Set<UUID>> teams = new HashMap<>();
    private final String MESSAGE_CHANNEL = "toobix:telepathy";

    @Override
    public void onEnable() {
        // Register plugin messaging channel
        getServer().getMessenger().registerOutgoingPluginChannel(this, MESSAGE_CHANNEL);
        getServer().getMessenger().registerIncomingPluginChannel(this, MESSAGE_CHANNEL, new TelepathyMessageListener());

        // Register commands
        getCommand("teamchat").setExecutor(new TeamChatCommand(this));
        getCommand("jointeam").setExecutor(new JoinTeamCommand(this));
    }

    // Send message to team
    public void sendTeamMessage(Player sender, String teamId, String message, double range) {
        Set<UUID> teamMembers = teams.get(teamId);
        if (teamMembers == null) return;

        for (UUID memberId : teamMembers) {
            Player member = Bukkit.getPlayer(memberId);
            if (member == null || !member.isOnline()) continue;

            // Check range if specified
            if (range > 0) {
                double distance = sender.getLocation().distance(member.getLocation());
                if (distance > range) continue;
            }

            // Send message via plugin channel
            ByteArrayDataOutput out = ByteStreams.newDataOutput();
            out.writeUTF("TEAM_MSG");
            out.writeUTF(sender.getName());
            out.writeUTF(message);
            out.writeDouble(sender.getLocation().distance(member.getLocation()));

            member.sendPluginMessage(this, MESSAGE_CHANNEL, out.toByteArray());

            // Also send as invisible chat (only for bots)
            if (isBot(member)) {
                member.sendMessage(ChatColor.DARK_GRAY + "[TEAM] " + sender.getName() + ": " + message);
            }
        }

        // Log for analytics
        logMessage(sender, teamId, message);
    }

    private boolean isBot(Player player) {
        // Check if player is a bot (implementation depends on your bot system)
        return player.hasPermission("toobix.bot");
    }

    private void logMessage(Player sender, String teamId, String message) {
        // Store in database or file for meta-game analytics
        getLogger().info(String.format("[%s] %s: %s", teamId, sender.getName(), message));
    }
}

// Command Handler
public class TeamChatCommand implements CommandExecutor {
    private final TeamTelepathyPlugin plugin;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) return false;

        Player player = (Player) sender;
        String teamId = plugin.getPlayerTeam(player.getUniqueId());

        if (teamId == null) {
            player.sendMessage("You're not in a team!");
            return true;
        }

        String message = String.join(" ", args);
        double range = -1; // -1 = unlimited

        // Send team message
        plugin.sendTeamMessage(player, teamId, message, range);

        return true;
    }
}

// Message Listener
public class TelepathyMessageListener implements PluginMessageListener {
    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!channel.equals("toobix:telepathy")) return;

        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String type = in.readUTF();

        if (type.equals("TEAM_MSG")) {
            String senderName = in.readUTF();
            String messageContent = in.readUTF();
            double distance = in.readDouble();

            // Process message (pass to bot AI, etc.)
            processBotMessage(player, senderName, messageContent, distance);
        }
    }

    private void processBotMessage(Player bot, String sender, String message, double distance) {
        // Integration point with bot AI system
        // Example: trigger bot response based on message content

        if (message.contains("help")) {
            // Bot can respond to help requests
        } else if (message.contains("follow")) {
            // Bot can follow sender
        }
        // Add more bot AI logic here
    }
}
```

### Key APIs Used
- `PluginMessagingAPI` - Custom communication channels
- `Player.sendPluginMessage()` - Send data to specific players
- `ByteArrayDataOutput/Input` - Message serialization
- `ChatColor` - Message formatting
- `Player.hasPermission()` - Bot detection

### Hooking into Bot AI (Baritone Example)

Baritone is a client-side mod, so direct server-side integration is limited. However, you can:

1. **Command Proxy:** Send commands to bots that they execute via Baritone
```java
// Bot receives message, executes Baritone command
public void handleBotCommand(Player bot, String command) {
    if (command.startsWith("#")) {
        // Bot client would execute: #goto, #mine, etc.
        bot.sendMessage(command); // Bot's client-side mod picks this up
    }
}
```

2. **Custom Events:** Fire events that bot plugins listen for
```java
// Custom event
public class BotCommandEvent extends Event {
    private final Player bot;
    private final String command;
    // ... getters, handlers, etc.
}

// Fire event
Bukkit.getPluginManager().callEvent(new BotCommandEvent(bot, "mine diamond_ore"));
```

3. **Config Files:** Update bot configs that they read periodically
```java
// Write to bot's config
File botConfig = new File(getDataFolder(), "bots/" + bot.getUniqueId() + ".yml");
YamlConfiguration config = YamlConfiguration.loadConfiguration(botConfig);
config.set("current_task", "mining");
config.set("target_location", location.serialize());
config.save(botConfig);
```

### Difficulty Assessment: **EASY**

**Pros:**
- Well-documented APIs
- No NMS (Net Minecraft Server) code needed
- Simple message routing logic
- Standard event handling

**Cons:**
- Bot AI integration depends on bot implementation
- May need ProtocolLib for advanced features

**Estimated Time:** 8-12 hours
- Setup & basic messaging: 3 hours
- Team management: 2 hours
- Range filtering: 2 hours
- Logging & analytics: 2 hours
- Testing & polish: 3 hours

---

## Plugin 2: Shared Inventory

### Overview
Team chests that synchronize inventory across multiple locations. All team members can access the same shared storage from any linked chest.

### Key Features
1. Link multiple chests to share inventory
2. Real-time synchronization
3. Transaction logging
4. Smart item distribution
5. Access control per team
6. Persistent storage across server restarts

### Technical Approach

**Storage System:**
- Use `PersistentDataContainer` (PDC) to mark chests as team chests
- Store actual inventory in memory (HashMap)
- Save to disk on server shutdown / periodic backups
- Use custom `InventoryHolder` for team chests

**Synchronization:**
- Listen for `InventoryClickEvent`, `InventoryDragEvent`, `InventoryMoveItemEvent`
- Update in-memory inventory when changes occur
- Propagate changes to all linked chests
- Use `Bukkit.getScheduler().runTask()` to avoid async inventory access issues

### Pseudocode

```java
// Main Plugin Class
public class SharedInventoryPlugin extends JavaPlugin {
    private final Map<String, Inventory> teamInventories = new HashMap<>();
    private final Map<Location, String> chestToTeam = new HashMap<>();

    @Override
    public void onEnable() {
        // Load team inventories from disk
        loadInventories();

        // Register events
        getServer().getPluginManager().registerEvents(new ChestEventListener(this), this);

        // Register commands
        getCommand("linkchest").setExecutor(new LinkChestCommand(this));
        getCommand("unlinkchest").setExecutor(new UnlinkChestCommand(this));

        // Auto-save task (every 5 minutes)
        Bukkit.getScheduler().runTaskTimer(this, this::saveInventories, 6000L, 6000L);
    }

    @Override
    public void onDisable() {
        saveInventories();
    }

    // Get or create team inventory
    public Inventory getTeamInventory(String teamId) {
        return teamInventories.computeIfAbsent(teamId, id ->
            Bukkit.createInventory(new TeamChestHolder(id), 54, "Team Storage - " + id)
        );
    }

    // Link chest to team
    public void linkChest(Block chest, String teamId) {
        if (!(chest.getState() instanceof Chest)) return;

        Location loc = chest.getLocation();
        chestToTeam.put(loc, teamId);

        // Store in PDC
        Chest chestState = (Chest) chest.getState();
        PersistentDataContainer pdc = chestState.getPersistentDataContainer();
        NamespacedKey key = new NamespacedKey(this, "team_id");
        pdc.set(key, PersistentDataType.STRING, teamId);
        chestState.update();

        // Sync chest inventory with team inventory
        syncChestToTeam(loc, teamId);
    }

    // Sync physical chest with team inventory
    private void syncChestToTeam(Location chestLoc, String teamId) {
        Block block = chestLoc.getBlock();
        if (!(block.getState() instanceof Chest)) return;

        Chest chest = (Chest) block.getState();
        Inventory teamInv = getTeamInventory(teamId);

        // Copy team inventory to chest
        chest.getBlockInventory().setContents(teamInv.getContents());
        chest.update();
    }

    // Update team inventory when chest changes
    public void updateTeamInventory(String teamId, Inventory chestInventory) {
        Inventory teamInv = getTeamInventory(teamId);
        teamInv.setContents(chestInventory.getContents());

        // Sync all linked chests
        chestToTeam.forEach((loc, team) -> {
            if (team.equals(teamId)) {
                Bukkit.getScheduler().runTask(this, () -> syncChestToTeam(loc, teamId));
            }
        });

        // Log transaction
        logInventoryChange(teamId, chestInventory);
    }

    // Transaction logging
    private void logInventoryChange(String teamId, Inventory inventory) {
        // Count items for analytics
        Map<Material, Integer> itemCounts = new HashMap<>();
        for (ItemStack item : inventory.getContents()) {
            if (item != null) {
                itemCounts.merge(item.getType(), item.getAmount(), Integer::sum);
            }
        }

        // Log to file/database
        getLogger().info("Team " + teamId + " inventory updated: " + itemCounts);
    }

    // Persistence
    private void saveInventories() {
        File dataFile = new File(getDataFolder(), "inventories.yml");
        YamlConfiguration config = new YamlConfiguration();

        teamInventories.forEach((teamId, inventory) -> {
            List<Map<String, Object>> items = new ArrayList<>();
            for (ItemStack item : inventory.getContents()) {
                if (item != null) {
                    items.add(item.serialize());
                }
            }
            config.set("teams." + teamId + ".items", items);
        });

        // Save chest locations
        List<Map<String, Object>> chestData = new ArrayList<>();
        chestToTeam.forEach((loc, teamId) -> {
            Map<String, Object> data = new HashMap<>();
            data.put("location", loc.serialize());
            data.put("team", teamId);
            chestData.add(data);
        });
        config.set("linked_chests", chestData);

        try {
            config.save(dataFile);
        } catch (IOException e) {
            getLogger().severe("Failed to save inventories: " + e.getMessage());
        }
    }

    private void loadInventories() {
        File dataFile = new File(getDataFolder(), "inventories.yml");
        if (!dataFile.exists()) return;

        YamlConfiguration config = YamlConfiguration.loadConfiguration(dataFile);

        // Load team inventories
        ConfigurationSection teams = config.getConfigurationSection("teams");
        if (teams != null) {
            for (String teamId : teams.getKeys(false)) {
                Inventory inv = getTeamInventory(teamId);
                List<Map<?, ?>> items = teams.getMapList(teamId + ".items");

                int slot = 0;
                for (Map<?, ?> itemData : items) {
                    ItemStack item = ItemStack.deserialize((Map<String, Object>) itemData);
                    inv.setItem(slot++, item);
                }
            }
        }

        // Load linked chests
        List<Map<?, ?>> chestData = config.getMapList("linked_chests");
        for (Map<?, ?> data : chestData) {
            Location loc = Location.deserialize((Map<String, Object>) data.get("location"));
            String teamId = (String) data.get("team");
            chestToTeam.put(loc, teamId);
        }
    }
}

// Custom InventoryHolder
public class TeamChestHolder implements InventoryHolder {
    private final String teamId;
    private Inventory inventory;

    public TeamChestHolder(String teamId) {
        this.teamId = teamId;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }

    @Override
    public Inventory getInventory() {
        return inventory;
    }

    public String getTeamId() {
        return teamId;
    }
}

// Event Listener
public class ChestEventListener implements Listener {
    private final SharedInventoryPlugin plugin;

    public ChestEventListener(SharedInventoryPlugin plugin) {
        this.plugin = plugin;
    }

    // Handle chest opening
    @EventHandler
    public void onChestOpen(InventoryOpenEvent event) {
        if (!(event.getInventory().getHolder() instanceof Chest)) return;

        Chest chest = (Chest) event.getInventory().getHolder();
        Location loc = chest.getLocation();
        String teamId = plugin.getChestTeam(loc);

        if (teamId != null) {
            // Open team inventory instead
            event.setCancelled(true);
            Bukkit.getScheduler().runTask(plugin, () -> {
                event.getPlayer().openInventory(plugin.getTeamInventory(teamId));
            });
        }
    }

    // Handle inventory changes
    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getInventory().getHolder() instanceof TeamChestHolder) {
            TeamChestHolder holder = (TeamChestHolder) event.getInventory().getHolder();

            // Update after a tick to ensure inventory is modified
            Bukkit.getScheduler().runTask(plugin, () -> {
                plugin.updateTeamInventory(holder.getTeamId(), event.getInventory());
            });
        }
    }

    @EventHandler
    public void onInventoryDrag(InventoryDragEvent event) {
        if (event.getInventory().getHolder() instanceof TeamChestHolder) {
            TeamChestHolder holder = (TeamChestHolder) event.getInventory().getHolder();

            Bukkit.getScheduler().runTask(plugin, () -> {
                plugin.updateTeamInventory(holder.getTeamId(), event.getInventory());
            });
        }
    }

    // Handle hoppers and automatic item transfer
    @EventHandler
    public void onInventoryMoveItem(InventoryMoveItemEvent event) {
        // Check if destination is team chest
        if (event.getDestination().getHolder() instanceof Chest) {
            Chest chest = (Chest) event.getDestination().getHolder();
            String teamId = plugin.getChestTeam(chest.getLocation());

            if (teamId != null) {
                // Update team inventory after item moves
                Bukkit.getScheduler().runTask(plugin, () -> {
                    plugin.updateTeamInventory(teamId, plugin.getTeamInventory(teamId));
                });
            }
        }
    }
}

// Link Chest Command
public class LinkChestCommand implements CommandExecutor {
    private final SharedInventoryPlugin plugin;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) return false;

        Player player = (Player) sender;

        if (args.length < 1) {
            player.sendMessage("Usage: /linkchest <team_id>");
            return true;
        }

        String teamId = args[0];

        // Get target block
        Block target = player.getTargetBlock(null, 5);
        if (!(target.getState() instanceof Chest)) {
            player.sendMessage("You must be looking at a chest!");
            return true;
        }

        // Link chest
        plugin.linkChest(target, teamId);
        player.sendMessage("Chest linked to team: " + teamId);

        return true;
    }
}
```

### Smart Distribution (Advanced)

**Concept:** Automatically distribute items across team chests based on type.

```java
public void distributeItems(String teamId) {
    Inventory teamInv = getTeamInventory(teamId);
    Map<Material, List<ItemStack>> itemsByType = new HashMap<>();

    // Group items by material
    for (ItemStack item : teamInv.getContents()) {
        if (item != null) {
            itemsByType.computeIfAbsent(item.getType(), k -> new ArrayList<>()).add(item);
        }
    }

    // Distribute to different chests
    List<Location> chests = getTeamChests(teamId);
    int chestIndex = 0;

    for (Map.Entry<Material, List<ItemStack>> entry : itemsByType.entrySet()) {
        if (chestIndex >= chests.size()) chestIndex = 0;

        Location chestLoc = chests.get(chestIndex);
        Chest chest = (Chest) chestLoc.getBlock().getState();

        // Add items to chest
        for (ItemStack item : entry.getValue()) {
            chest.getBlockInventory().addItem(item);
        }
        chest.update();

        chestIndex++;
    }
}
```

### Key APIs Used
- `PersistentDataContainer` - Chest metadata storage
- `InventoryHolder` - Custom inventory management
- `Inventory.setContents()` / `getContents()` - Inventory synchronization
- `BukkitScheduler` - Async-safe inventory updates
- `ItemStack.serialize()` / `deserialize()` - Persistence
- `YamlConfiguration` - File storage

### Difficulty Assessment: **MEDIUM**

**Pros:**
- Standard Bukkit APIs (no NMS)
- PDC is well-documented
- Inventory API is mature

**Cons:**
- Synchronization timing can be tricky
- Must handle async issues carefully
- Persistence adds complexity

**Estimated Time:** 16-24 hours
- Basic chest linking: 4 hours
- Inventory sync logic: 6 hours
- Event handling: 4 hours
- Persistence system: 4 hours
- Transaction logging: 2 hours
- Smart distribution: 3 hours
- Testing & debugging: 5 hours

---

## Plugin 3: Role-Abilities

### Overview
Unique abilities for each bot role (Scout, Miner, Builder, etc.) with visual effects and cooldown systems.

### Key Features
1. **Scout Role:**
   - Speed boost
   - Jump boost
   - Particle trail effect

2. **Miner Role:**
   - Haste (faster mining)
   - Ore-finder ability (highlight nearby ores)
   - Mining fatigue immunity

3. **Builder Role:**
   - Reach extension (place blocks further)
   - Building efficiency
   - Blueprint visualization

4. **Guard Role:**
   - Strength bonus
   - Resistance
   - Knockback resistance

5. **Universal Features:**
   - Cooldown-based active abilities
   - Passive bonuses
   - Visual particle effects
   - Role switching

### Technical Approach

**Passive Abilities:**
- Use `PotionEffect` for speed, haste, strength
- Use `AttributeModifier` for permanent bonuses
- Apply on role assignment, remove on role change

**Active Abilities:**
- Command or item-based activation
- Cooldown management with HashMap
- Particle effects for feedback
- Area-of-effect scanning for ore-finder

**Role Management:**
- Store roles in PDC on player
- Or use permission groups
- Or use config file / database

### Pseudocode

```java
// Main Plugin Class
public class RoleAbilitiesPlugin extends JavaPlugin {
    private final Map<UUID, PlayerRole> playerRoles = new HashMap<>();
    private final Map<UUID, Map<String, Long>> cooldowns = new HashMap<>();

    @Override
    public void onEnable() {
        // Register events
        getServer().getPluginManager().registerEvents(new RoleEventListener(this), this);

        // Register commands
        getCommand("setrole").setExecutor(new SetRoleCommand(this));
        getCommand("ability").setExecutor(new AbilityCommand(this));

        // Apply passive abilities to online players
        for (Player player : Bukkit.getOnlinePlayers()) {
            loadPlayerRole(player);
            applyPassiveAbilities(player);
        }
    }

    // Set player role
    public void setRole(Player player, PlayerRole role) {
        // Remove old role abilities
        PlayerRole oldRole = playerRoles.get(player.getUniqueId());
        if (oldRole != null) {
            removePassiveAbilities(player, oldRole);
        }

        // Set new role
        playerRoles.put(player.getUniqueId(), role);

        // Apply new abilities
        applyPassiveAbilities(player);

        // Save to PDC
        PersistentDataContainer pdc = player.getPersistentDataContainer();
        NamespacedKey key = new NamespacedKey(this, "role");
        pdc.set(key, PersistentDataType.STRING, role.name());

        player.sendMessage("Your role is now: " + role.getDisplayName());
    }

    // Apply passive abilities based on role
    private void applyPassiveAbilities(Player player) {
        PlayerRole role = playerRoles.get(player.getUniqueId());
        if (role == null) return;

        switch (role) {
            case SCOUT:
                applyScoutPassives(player);
                break;
            case MINER:
                applyMinerPassives(player);
                break;
            case BUILDER:
                applyBuilderPassives(player);
                break;
            case GUARD:
                applyGuardPassives(player);
                break;
        }
    }

    private void applyScoutPassives(Player player) {
        // Speed boost
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.SPEED,
            Integer.MAX_VALUE,
            1,  // Level 2
            false, false, false
        ));

        // Jump boost
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.JUMP,
            Integer.MAX_VALUE,
            1,
            false, false, false
        ));

        // Particle trail (continuous task)
        BukkitRunnable trail = new BukkitRunnable() {
            @Override
            public void run() {
                if (!player.isOnline() || playerRoles.get(player.getUniqueId()) != PlayerRole.SCOUT) {
                    cancel();
                    return;
                }

                player.getWorld().spawnParticle(
                    Particle.CLOUD,
                    player.getLocation(),
                    5,
                    0.2, 0.1, 0.2,
                    0.01
                );
            }
        };
        trail.runTaskTimer(this, 0, 10); // Every 0.5 seconds
    }

    private void applyMinerPassives(Player player) {
        // Haste (mining speed)
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.HASTE,
            Integer.MAX_VALUE,
            2,  // Level 3
            false, false, false
        ));

        // Night vision (see in caves)
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.NIGHT_VISION,
            Integer.MAX_VALUE,
            0,
            false, false, false
        ));
    }

    private void applyBuilderPassives(Player player) {
        // No passive effects, but extended reach via attribute
        AttributeInstance reach = player.getAttribute(Attribute.PLAYER_BLOCK_INTERACTION_RANGE);
        AttributeModifier modifier = new AttributeModifier(
            UUID.nameUUIDFromBytes("builder_reach".getBytes()),
            "builder_reach_bonus",
            2.0,  // +2 blocks reach
            AttributeModifier.Operation.ADD_NUMBER
        );
        reach.addModifier(modifier);
    }

    private void applyGuardPassives(Player player) {
        // Strength
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.INCREASE_DAMAGE,
            Integer.MAX_VALUE,
            0,
            false, false, false
        ));

        // Resistance
        player.addPotionEffect(new PotionEffect(
            PotionEffectType.DAMAGE_RESISTANCE,
            Integer.MAX_VALUE,
            0,
            false, false, false
        ));

        // Knockback resistance
        AttributeInstance kb = player.getAttribute(Attribute.GENERIC_KNOCKBACK_RESISTANCE);
        AttributeModifier modifier = new AttributeModifier(
            UUID.nameUUIDFromBytes("guard_kb".getBytes()),
            "guard_kb_resistance",
            0.5,  // 50% knockback resistance
            AttributeModifier.Operation.ADD_NUMBER
        );
        kb.addModifier(modifier);
    }

    private void removePassiveAbilities(Player player, PlayerRole role) {
        // Remove all potion effects
        for (PotionEffect effect : player.getActivePotionEffects()) {
            player.removePotionEffect(effect.getType());
        }

        // Remove attribute modifiers
        for (Attribute attribute : Attribute.values()) {
            AttributeInstance instance = player.getAttribute(attribute);
            if (instance != null) {
                instance.getModifiers().forEach(instance::removeModifier);
            }
        }
    }

    // Active abilities
    public void useAbility(Player player) {
        PlayerRole role = playerRoles.get(player.getUniqueId());
        if (role == null) {
            player.sendMessage("You don't have a role!");
            return;
        }

        // Check cooldown
        if (hasCooldown(player, "active_ability")) {
            long remaining = getCooldownRemaining(player, "active_ability");
            player.sendMessage("Ability on cooldown: " + (remaining / 1000) + "s remaining");
            return;
        }

        // Use role-specific ability
        switch (role) {
            case SCOUT:
                scoutAbility(player);
                break;
            case MINER:
                minerAbility(player);
                break;
            case BUILDER:
                builderAbility(player);
                break;
            case GUARD:
                guardAbility(player);
                break;
        }
    }

    // Scout: Dash forward
    private void scoutAbility(Player player) {
        Vector direction = player.getLocation().getDirection().multiply(2);
        player.setVelocity(direction);

        // Particle effect
        player.getWorld().spawnParticle(
            Particle.EXPLOSION_LARGE,
            player.getLocation(),
            3,
            0.5, 0.5, 0.5,
            0.1
        );

        player.sendMessage("Dash ability used!");
        setCooldown(player, "active_ability", 10000); // 10 second cooldown
    }

    // Miner: Ore finder
    private void minerAbility(Player player) {
        Location center = player.getLocation();
        int radius = 15;

        List<Material> ores = Arrays.asList(
            Material.COAL_ORE, Material.DEEPSLATE_COAL_ORE,
            Material.IRON_ORE, Material.DEEPSLATE_IRON_ORE,
            Material.GOLD_ORE, Material.DEEPSLATE_GOLD_ORE,
            Material.DIAMOND_ORE, Material.DEEPSLATE_DIAMOND_ORE,
            Material.EMERALD_ORE, Material.DEEPSLATE_EMERALD_ORE,
            Material.LAPIS_ORE, Material.DEEPSLATE_LAPIS_ORE,
            Material.REDSTONE_ORE, Material.DEEPSLATE_REDSTONE_ORE
        );

        List<Block> foundOres = new ArrayList<>();

        // Scan area
        for (int x = -radius; x <= radius; x++) {
            for (int y = -radius; y <= radius; y++) {
                for (int z = -radius; z <= radius; z++) {
                    Block block = center.getWorld().getBlockAt(
                        center.getBlockX() + x,
                        center.getBlockY() + y,
                        center.getBlockZ() + z
                    );

                    if (ores.contains(block.getType())) {
                        foundOres.add(block);
                    }
                }
            }
        }

        // Highlight found ores
        if (foundOres.isEmpty()) {
            player.sendMessage("No ores found nearby!");
        } else {
            player.sendMessage("Found " + foundOres.size() + " ore blocks!");

            // Spawn particles at ore locations
            BukkitRunnable highlight = new BukkitRunnable() {
                int ticksLeft = 100; // 5 seconds

                @Override
                public void run() {
                    if (ticksLeft <= 0) {
                        cancel();
                        return;
                    }

                    for (Block ore : foundOres) {
                        Location particleLoc = ore.getLocation().clone().add(0.5, 0.5, 0.5);
                        player.spawnParticle(
                            Particle.WAX_ON,
                            particleLoc,
                            5,
                            0.3, 0.3, 0.3,
                            0
                        );
                    }

                    ticksLeft--;
                }
            };
            highlight.runTaskTimer(this, 0, 1);
        }

        setCooldown(player, "active_ability", 30000); // 30 second cooldown
    }

    // Builder: Place scaffolding
    private void builderAbility(Player player) {
        Location loc = player.getLocation();

        // Create temporary scaffolding column
        for (int i = 0; i < 5; i++) {
            Block block = loc.clone().add(0, i, 0).getBlock();
            if (block.getType() == Material.AIR) {
                block.setType(Material.SCAFFOLDING);
            }
        }

        player.sendMessage("Scaffolding created!");
        setCooldown(player, "active_ability", 5000); // 5 second cooldown
    }

    // Guard: Area protection
    private void guardAbility(Player player) {
        Location center = player.getLocation();
        int radius = 5;

        // Give resistance to nearby players
        for (Player nearby : center.getWorld().getPlayers()) {
            if (nearby.getLocation().distance(center) <= radius) {
                nearby.addPotionEffect(new PotionEffect(
                    PotionEffectType.DAMAGE_RESISTANCE,
                    100, // 5 seconds
                    2,
                    false, false, true
                ));
            }
        }

        // Visual effect
        for (int i = 0; i < 360; i += 10) {
            double radians = Math.toRadians(i);
            double x = center.getX() + radius * Math.cos(radians);
            double z = center.getZ() + radius * Math.sin(radians);

            player.getWorld().spawnParticle(
                Particle.FLAME,
                new Location(center.getWorld(), x, center.getY() + 1, z),
                1, 0, 0, 0, 0
            );
        }

        player.sendMessage("Protection field activated!");
        setCooldown(player, "active_ability", 20000); // 20 second cooldown
    }

    // Cooldown management
    private boolean hasCooldown(Player player, String ability) {
        Map<String, Long> playerCooldowns = cooldowns.get(player.getUniqueId());
        if (playerCooldowns == null) return false;

        Long cooldownEnd = playerCooldowns.get(ability);
        if (cooldownEnd == null) return false;

        return System.currentTimeMillis() < cooldownEnd;
    }

    private void setCooldown(Player player, String ability, long durationMillis) {
        cooldowns.computeIfAbsent(player.getUniqueId(), k -> new HashMap<>())
                 .put(ability, System.currentTimeMillis() + durationMillis);
    }

    private long getCooldownRemaining(Player player, String ability) {
        Map<String, Long> playerCooldowns = cooldowns.get(player.getUniqueId());
        if (playerCooldowns == null) return 0;

        Long cooldownEnd = playerCooldowns.get(ability);
        if (cooldownEnd == null) return 0;

        return Math.max(0, cooldownEnd - System.currentTimeMillis());
    }

    // Load player role from PDC
    private void loadPlayerRole(Player player) {
        PersistentDataContainer pdc = player.getPersistentDataContainer();
        NamespacedKey key = new NamespacedKey(this, "role");

        if (pdc.has(key, PersistentDataType.STRING)) {
            String roleName = pdc.get(key, PersistentDataType.STRING);
            PlayerRole role = PlayerRole.valueOf(roleName);
            playerRoles.put(player.getUniqueId(), role);
        }
    }
}

// Player Role Enum
public enum PlayerRole {
    SCOUT("Scout"),
    MINER("Miner"),
    BUILDER("Builder"),
    GUARD("Guard");

    private final String displayName;

    PlayerRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

// Event Listener
public class RoleEventListener implements Listener {
    private final RoleAbilitiesPlugin plugin;

    public RoleEventListener(RoleAbilitiesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        plugin.loadPlayerRole(player);
        plugin.applyPassiveAbilities(player);
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        // Clean up cooldowns
        plugin.cleanupPlayer(event.getPlayer().getUniqueId());
    }

    // Miner: Auto-smelt ores
    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        PlayerRole role = plugin.getPlayerRole(player.getUniqueId());

        if (role == PlayerRole.MINER) {
            Block block = event.getBlock();
            Material type = block.getType();

            // Auto-smelt
            Map<Material, Material> smeltMap = Map.of(
                Material.IRON_ORE, Material.IRON_INGOT,
                Material.DEEPSLATE_IRON_ORE, Material.IRON_INGOT,
                Material.GOLD_ORE, Material.GOLD_INGOT,
                Material.DEEPSLATE_GOLD_ORE, Material.GOLD_INGOT,
                Material.ANCIENT_DEBRIS, Material.NETHERITE_SCRAP
            );

            if (smeltMap.containsKey(type)) {
                event.setDropItems(false);
                block.getWorld().dropItemNaturally(
                    block.getLocation(),
                    new ItemStack(smeltMap.get(type))
                );

                // Particle effect
                block.getWorld().spawnParticle(
                    Particle.FLAME,
                    block.getLocation().add(0.5, 0.5, 0.5),
                    10,
                    0.3, 0.3, 0.3,
                    0.01
                );
            }
        }
    }
}

// Set Role Command
public class SetRoleCommand implements CommandExecutor {
    private final RoleAbilitiesPlugin plugin;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) return false;

        Player player = (Player) sender;

        if (args.length < 1) {
            player.sendMessage("Usage: /setrole <scout|miner|builder|guard>");
            return true;
        }

        try {
            PlayerRole role = PlayerRole.valueOf(args[0].toUpperCase());
            plugin.setRole(player, role);
        } catch (IllegalArgumentException e) {
            player.sendMessage("Invalid role! Choose: scout, miner, builder, guard");
        }

        return true;
    }
}

// Ability Command
public class AbilityCommand implements CommandExecutor {
    private final RoleAbilitiesPlugin plugin;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) return false;

        Player player = (Player) sender;
        plugin.useAbility(player);

        return true;
    }
}
```

### Key APIs Used
- `PotionEffect` - Speed, haste, strength, resistance
- `AttributeModifier` - Reach extension, knockback resistance
- `Particle` - Visual effects
- `BukkitRunnable` - Continuous effects, particle trails
- `PersistentDataContainer` - Role persistence
- `Vector` - Dash ability movement
- `Player.spawnParticle()` - Player-only particles

### Difficulty Assessment: **MEDIUM**

**Pros:**
- Well-documented potion & attribute APIs
- Particle system is straightforward
- Cooldown logic is simple

**Cons:**
- Balancing abilities requires testing
- Particle effects need performance consideration
- Complex area scanning for ore-finder

**Estimated Time:** 18-28 hours
- Role system & persistence: 4 hours
- Passive abilities: 6 hours
- Active abilities: 8 hours
- Particle effects: 3 hours
- Cooldown system: 2 hours
- Event handling: 3 hours
- Testing & balancing: 6 hours

---

## Difficulty Assessment

### Plugin Comparison Table

| Plugin | Difficulty | Time Estimate | Key Challenge | NMS Required? |
|--------|-----------|---------------|---------------|---------------|
| **Team-Telepathy** | Easy | 8-12 hours | Bot AI integration | No |
| **Shared Inventory** | Medium | 16-24 hours | Sync timing | No |
| **Role-Abilities** | Medium | 18-28 hours | Balancing & effects | No |

### Complexity Breakdown

**Team-Telepathy:**
- Simplest implementation
- Standard messaging APIs
- Main challenge: integrating with bot AI systems (depends on bot implementation)
- No custom data structures needed
- Event handling is straightforward

**Shared Inventory:**
- Mid-level complexity
- Requires careful timing to avoid race conditions
- Persistence adds development time
- Transaction logging is bonus feature
- Smart distribution is advanced but optional

**Role-Abilities:**
- Mid-level complexity
- Most code volume due to multiple abilities
- Balancing requires play-testing
- Visual effects are fun but time-consuming
- Ore-finder requires area scanning (performance consideration)

### Potential Blockers

**All Plugins:**
- Bot system architecture (if bots are client mods vs server-side)
- Version compatibility (1.20.1 vs newer versions)
- Performance on large servers (many bots)

**Team-Telepathy:**
- Bot AI integration may require custom bot plugins
- Baritone is client-side, limiting server control

**Shared Inventory:**
- Async inventory access (must use Bukkit scheduler)
- Chest breaking/placing edge cases
- Double chest handling

**Role-Abilities:**
- Balancing (abilities too strong/weak)
- Performance with many particle effects
- Ore-finder radius (scanning 15^3 = 3375 blocks)

---

## Development Roadmap

### Recommended Order

**Phase 1: Team-Telepathy (Week 1)**
- Easiest to implement
- Provides foundation for bot communication
- Can be tested immediately
- Other plugins can build on this messaging system

**Phase 2: Role-Abilities (Week 2-3)**
- Adds gameplay depth
- Gives bots distinct purposes
- Visual feedback helps with testing
- Can be developed while designing Shared Inventory

**Phase 3: Shared Inventory (Week 3-4)**
- Most complex
- Benefits from having other plugins working
- Requires more testing
- Optional features can be added incrementally

### Development Milestones

**Team-Telepathy:**
1. Basic messaging system (Day 1-2)
2. Team filtering (Day 2-3)
3. Range filtering (Day 3-4)
4. Logging & analytics (Day 4-5)
5. Testing & polish (Day 5-6)

**Role-Abilities:**
1. Role system & persistence (Day 1-2)
2. Scout abilities (Day 3-5)
3. Miner abilities (Day 6-8)
4. Builder abilities (Day 9-11)
5. Guard abilities (Day 12-14)
6. Balancing & testing (Day 15-18)

**Shared Inventory:**
1. Basic chest linking (Day 1-3)
2. Inventory sync (Day 4-7)
3. Event handling (Day 8-10)
4. Persistence (Day 11-13)
5. Transaction logging (Day 14-15)
6. Smart distribution (Day 16-18)
7. Testing & edge cases (Day 19-21)

---

## Additional Resources

### Official Documentation
- [PaperMC Documentation](https://docs.papermc.io/paper/) - Official Paper API docs
- [Spigot API Javadocs](https://hub.spigotmc.org/javadocs/spigot/) - Complete API reference
- [Paper Project Setup](https://docs.papermc.io/paper/dev/project-setup/) - Getting started guide

### Libraries & Tools
- [ProtocolLib](https://github.com/dmulloy2/ProtocolLib) - Packet manipulation for custom messaging
- [InventoryGui](https://github.com/Phoenix616/InventoryGui) - Simplified GUI creation
- [ParticleNativeAPI](https://github.com/Fierioziy/ParticleNativeAPI) - Cross-version particle effects
- [Item-NBT-API](https://github.com/tr7zw/Item-NBT-API) - NBT manipulation without NMS

### Community Resources
- [SpigotMC Forums](https://www.spigotmc.org/forums/) - Plugin development community
- [Paper Discord](https://discord.gg/papermc) - Active development support
- [Bukkit Forums](https://bukkit.org/forums/) - Legacy but still useful

### Example Plugins
- [Chests++](https://www.curseforge.com/minecraft/bukkit-plugins/chests-plus-plus) - Reference for chest linking
- [MagicAbilities](https://www.spigotmc.org/resources/magicabilities.114188/) - Reference for ability systems
- [StaffChat+](https://modrinth.com/plugin/staffchat+) - Reference for private messaging

### Bot Integration
- [Baritone](https://github.com/cabaletta/baritone) - Minecraft bot pathfinding & automation
- [Baritone API](https://github.com/cabaletta/baritone/releases) - Latest releases with API support

---

## Final Assessment

### Feasibility: HIGH

All three plugins are **completely feasible** using standard Paper/Bukkit APIs:
- No NMS (Net Minecraft Server) code required
- No version-specific hacks needed
- All features have proven implementations in existing plugins
- Well-documented APIs for all core functionality

### Risk Level: LOW

**Low-Risk Items:**
- Basic messaging, inventory management, potion effects
- Persistence with PDC
- Event handling
- Cooldown systems

**Medium-Risk Items:**
- Bot AI integration (depends on bot implementation)
- Inventory synchronization timing
- Performance with many particles
- Ore-finder area scanning performance

**High-Risk Items:**
- None identified

### Recommended Starting Point: **Team-Telepathy**

**Reasons:**
1. **Quickest to implement** (8-12 hours)
2. **Immediate value** - bots can communicate right away
3. **Foundation for other plugins** - messaging system can be reused
4. **Easy to test** - just send messages and verify receipt
5. **Low risk** - simple APIs, minimal dependencies

**Next Steps After Team-Telepathy:**
1. Implement basic bot communication
2. Test with actual bots (if available)
3. Gather feedback on what abilities would be most useful
4. Move to Role-Abilities based on bot needs
5. Finally implement Shared Inventory for resource management

---

## Concerns & Suggestions

### Concerns

1. **Bot System Architecture Unknown:**
   - Are bots client-side mods (like Baritone) or server-side?
   - If client-side, server plugins have limited control
   - May need custom bot plugins to respond to server commands

2. **Performance with Many Bots:**
   - Particle effects for 10+ bots could impact TPS
   - Ore-finder scanning 3375 blocks per use (15^3 radius)
   - Consider async processing for heavy operations

3. **Version Compatibility:**
   - Targeting 1.20.1 is good for stability
   - Newer versions (1.20.5+) use Mojang mappings
   - May need to update if moving to 1.21+

4. **Balancing Abilities:**
   - Infinite haste/speed may be too powerful
   - Ore-finder reveals all nearby ores (x-ray effect)
   - May need cooldowns on passive abilities or reduced levels

### Suggestions

1. **Start Small, Iterate Fast:**
   - Build Team-Telepathy first
   - Test with real bots
   - Add features based on actual needs
   - Don't over-engineer early

2. **Consider Configuration:**
   - Make cooldowns configurable
   - Allow ability levels to be adjusted
   - Configurable particle effects (on/off)
   - Team size limits

3. **Add Debugging Tools:**
   - `/debug team` - Show team members & locations
   - `/debug inventory` - Show sync status
   - `/debug abilities` - Show active effects & cooldowns
   - Verbose logging mode

4. **Performance Optimization:**
   - Cache team lookups
   - Limit particle density
   - Use async for area scanning
   - Batch inventory updates

5. **Future Enhancements:**
   - Web dashboard for analytics
   - Discord integration for alerts
   - Team leaderboards
   - Ability combos (multi-role teams)
   - Custom particle trails per bot

6. **Testing Strategy:**
   - Create test server with Paper 1.20.1
   - Use `Run-Task` plugin for quick iterations
   - Test with multiple fake players (use bot accounts)
   - Benchmark with 10, 50, 100 bots

---

## Conclusion

All three plugins are **highly feasible** for your Toobix bot system:

- **Team-Telepathy:** Easy implementation, immediate value, low risk
- **Shared Inventory:** Medium complexity, high utility, manageable challenges
- **Role-Abilities:** Medium complexity, engaging gameplay, requires balancing

**Recommended approach:** Start with **Team-Telepathy**, validate bot integration, then proceed to **Role-Abilities** and **Shared Inventory** based on lessons learned.

**Total estimated development time:** 42-64 hours (6-9 work days)

The guide above provides complete pseudocode, API references, and step-by-step setup instructions. You can begin development immediately using the Paper API setup process and build each plugin incrementally.

Good luck with your Toobix bot system!
