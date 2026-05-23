```
# ⛏️ Underworld Miner — Cavern Chronicles

[![Game Version](https://img.shields.io/badge/Version-v1.4.0-gold.svg)](https://github.com/Kwaade17/Mining-Game)
[![Platform](https://img.shields.io/badge/Platform-Web__Browser-blue.svg)](https://github.com/Kwaade17/Mining-Game)
[![Language](https://img.shields.io/badge/Made%20With-HTML%20%7C%20CSS%20%7C%20JS-brightgreen.svg)](https://github.com/Kwaade17/Mining-Game)

Welcome to **Underworld Miner**, a lightweight, responsive, and data-driven active incremental game. Step into the boots of Miner Joe and explore rich cavern layers, manage a real-time active inventory, trade raw ores at the marketplace, and unlock legendary artifacts to fill your prestigious collections gallery.

---

## 📂 Project Architecture

The application is engineered on a **Data-Driven UI Framework**. The user interface acts as a clean structural "shell," while all assets, stats, and cards are rendered dynamically via JavaScript [4.2]:

```text
├── index.html          # Clean, placeholder-free structural shell
├── style.css           # Compressed stylesheet handling layout depths & animations
├── data.js            # Offline database (Caves, shop items, mutations, collections)
├── script.js          # Core game engine (Mining loops, pagination, inventory, views)
└── Img/                # Graphics directory
    ├── Icons/
    │   ├── Shop/       # Upgrades and gear assets
    │   └── Awards/     # Trophy, badge, and mutation assets
    └── ...             # Cave background images
```

---

## ⚙️ Game Core Calculations & Math

Underworld Miner uses a sophisticated, multi-stage calculation sequence to determine the parameters and market value of every mined ore [4.2]:

```
                         [ Base Value ]             [ Base Weight ]
                                │                          │
                                ▼                          ▼
                        [ Roll Variant ]           [ Roll Fluctuation ]
                    (Base Value Multiplier)          (0.8x to 1.2x)
                                │                          │
                                ▼                          ▼
                      Modified Base Value            Actual Weight
                                └────────────┬─────────────┘
                                             ▼
                                     Sub-Total Value
                                             │
                                             ▼
                                      [ Roll Mutation ]
                                  (Final Value Multiplier)
                                             │
                                             ▼
                                     Final/Total Value
```

### 1. Base Value Modification (Variant Roll)
Mining an ore rolls a specific **Variant** based on defined probability rates (`pr`):
- **Normal (80%):** `x1.0` value multiplier
- **Rust (10%):** `x5.0` value multiplier
- **Pure (9%):** `x20.0` value multiplier
- **Rainbow (1%):** `x50.0` value multiplier

$$\text{Modified Base Value} = \text{Ore Base Value} \times \text{Variant Multiplier}$$

### 2. Weight Variance
The physical weight of the ore fluctuates dynamically around its defined base weight:
$$\text{Actual Weight} = \text{Ore Base Weight} \times \text{Random Fluctuation (0.8 to 1.2)}$$

### 3. Sub-Total Value
$$\text{Sub-Total Value} = \text{Modified Base Value} \times \text{Actual Weight}$$

### 4. Mutation Modification (Final Value)
Finally, the engine rolls a **Mutation** (e.g. Spore, Toxic, Crystalline, Cosmic) which acts as a final multiplier on your sub-total:
$$\text{Final/Total Value} = \text{Sub-Total Value} \times \text{Mutation Multiplier}$$

- **None (80%):** `x1.0` final multiplier
- **Spore (10%):** `x1.5` final multiplier
- **Toxic (6%):** `x2.0` final multiplier
- **Crystalline (3%):** `x3.0` final multiplier
- **Cosmic (1%):** `x5.0` final multiplier

*Unlocking these rare rolls instantly updates your collections gallery tab!*

---

## 🚀 Release History & Changelog (v1.4.0)

We have heavily upgraded the game with several features, optimizations, and bug fixes:

### 🎮 Gameplay Additions
- **Interactive Welcome Name Modal:** New players are greeted with a customized modal that gates gameplay until they input a display name. This updates their profile headers in real-time across the navbar and sidebar.
- **Active Inventory Tray:** Added a scrolling inventory shelf directly on the main gameplay view. You can now see your active items, their mutated qualities, and sell them instantly at the marketplace without leaving the cavern map.
- **Mystery Cavern Gifts (🎁):** Mining has a random $8\%$ chance to drop a floating gift chest. Clicking it rewards players with bonus coins.
- **Anti-Spam Tap Protections:** Tapping the mystery gift instantly locks its pointer-events, preventing multi-touch gold exploits. 
- **Defensive Mining Cooldowns:** Button triggers lock out spam clicks by showing a `"Mining..."` timer that decreases dynamically as you upgrade your pickaxe speed.
- **Real-Time Sidebar XP Bar:** Added a sleek, gold XP progress bar underneath your sidebar avatar that updates smoothly as you earn mining experience.
- **Dynamic Stats Pop-up Modal:** Clicking on any unlocked Cavern Card background or clicking "Read More" on any unlocked Collection card opens an animated frosted-glass popup showing deep lore and exact numerical stats.

### 🐛 Bug Fixes & Optimizations
- **Sidebar Depth & Click-Hijacking Fix:** Raised the absolute `.sidebar` `z-index` depth to `140`, preventing invisible boundaries in the main game area from stealing sidebar menu clicks on mobile viewports.
- **Viewport Height Scale Fix:** Re-engineered the map pagination limits using direct `window.innerWidth` programmatic evaluations. This prevents 3x3 grids from compressing into vertical columns on short screens.
- **View Caching Override:** Modified the tab switcher to write inline `display` styles directly onto HTML views, bypassing persistent browser cache bugs completely.
- **JSON Modular Database Structure:** Replaced structural string-guessing calculations with explicit `collectionId` data mappings, making additions 100% crash-free.

---

## ⚙️ Local Workspace Setup

To run your development environment on a PC:
1. Open your project folder inside **VS Code**.
2. Go to your Extensions tab (`Ctrl+Shift+X`), search for **Live Server**, and install it.
3. Open `index.html` and click the **Go Live** button in your bottom-right status bar.
4. This hosts a local development port. Every time you save any file in VS Code, your browser will instantly and automatically reload!
5. Press **`F12`** inside your browser to monitor real-time variables and inspect performance.

---

## 🛠️ Developer Extension Templates

To expand your game database, simply open `data.js` and append these templates inside their matching arrays:

### 1. Add a Cave
```javascript
{
    id: 11,
    name: "Obsidian Core",
    image: "Img/Obsidian Core.png",
    requiredLevel: 11,
    energyCost: 35,
    xpReward: 400,
    baseValue: 500,
    baseWeight: 22.5,
    oreName: "Obsidian Shard",
    oreIcon: "💥",
    collectionId: "obsidian-col"
}
```

### 2. Add a Shop Upgrade
```javascript
{
    id: "titanium-pick",
    category: "mining-speed",
    name: "Titanium Pick",
    desc: "+80% break speed.",
    cost: 1500,
    icon: "🔱",
    multiplier: 1.80,
    collectionId: "titanium-col"
}
```

### 3. Add a Collection Card
```javascript
{
    id: "titanium-col",
    category: "pickaxes",
    name: "Titanium Gear",
    desc: "A pickaxe forged from indestructible titanium alloy.",
    icon: "🔱",
    obtained: false
}
```