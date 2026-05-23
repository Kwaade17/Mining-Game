# ⛏️ Underworld Miner — Cavern Chronicles

[![Game Version](https://img.shields.io/badge/Version-v1.6.0-gold.svg)](https://github.com/Kwaade17/Mining-Game)
[![Platform](https://img.shields.io/badge/Platform-Web__Browser-blue.svg)](https://github.com/Kwaade17/Mining-Game)
[![Language](https://img.shields.io/badge/Made%20With-HTML%20%7C%20CSS%20%7C%20JS-brightgreen.svg)](https://github.com/Kwaade17/Mining-Game)

Welcome to **Underworld Miner**, a lightweight, responsive, and data-driven active incremental game. Step into the boots of Miner Joe and explore rich cavern layers, manage a real-time active inventory, trade raw ores at the marketplace, and unlock legendary artifacts to fill your prestigious collections gallery.

---

## 📂 Project Architecture

The application is engineered on a **Data-Driven UI Framework**. The user interface acts as a clean structural "shell," while all assets, stats, and cards are rendered dynamically via JavaScript [4.2]:

```text
├── index.html          # Clean, placeholder-free structural shell (loads Marked.js)
├── style.css           # Compressed stylesheet handling layout depths & animations
├── data.js            # Offline database (Caves, shop items, mutations, collections)
├── script.js          # Core game engine (Mining loops, pagination, inventory, views)
└── Img/                # Graphics directory
    ├── Icons/
    │   ├── Shop/       # Upgrade and weapon icons
    │   └── Awards/     # Trophy, badge, and mutation icons
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
The physical weight of the ore fluctuates randomly between $80\%$ and $120\%$ of the cave's defined base weight:
$$\text{Actual Weight} = \text{Cave Base Weight} \times \text{Random Fluctuation (0.8 to 1.2)}$$

### 3. Sub-Total Value
$$\text{Sub-Total Value} = \text{Modified Base Value} \times \text{Actual Weight}$$

### 4. Mutation Modification (Final Value)
Lastly, the engine rolls a **Mutation** (e.g. Spore, Toxic, Crystalline, Cosmic) which acts as a final multiplier on your sub-total:
$$\text{Final/Total Value} = \text{Sub-Total Value} \times \text{Mutation Multiplier}$$

- **None (80%):** `x1.0` final multiplier
- **Spore (10%):** `x1.5` final multiplier
- **Toxic (6%):** `x2.0` final multiplier
- **Crystalline (3%):** `x3.0` final multiplier
- **Cosmic (1%):** `x5.0` final multiplier

*Unlocking these rare rolls instantly updates your collections gallery tab!*

---

## 🚀 Release History & Changelog (v1.6.0)

We have heavily upgraded the game with several features, optimizations, and bug fixes:

### 🎮 Gameplay Additions
- **Starting Username Input Overlay:** New players are greeted with a customized modal that gates gameplay until they input a display name [4.2].
- **Live-Service Shop Badges:** Store cards now dynamically display a custom **`NEW`** corner-fold ribbon badge. It automatically checks if the item was added in the current major game version or released within the last 72 hours [4.2].
- **Dynamic Cave Loot Pools:** Caves no longer have only one static drop. Every cave now features its own weighted, 8-ore randomized loot pool table.
- **Variant Card Skins:** Unlocking rare ore variants (Rust, Pure, Rainbow) styles their cards inside your active inventory tray with custom glowing borders, shadows, and animated gradients [4.2].
- **Inventory Info Modal Popups:** Tapping any mined ore card inside your horizontal tray opens a detail modal displaying its exact weight, variant, and sub-total values [4.2].
- **Custom Account Profile Stats:** Clicking **Account** inside your profile dropdown now opens a detailed spec sheet summarizing your career mining statistics [4.2].
- **Custom Sign Out Dialogue:** Clicking **Sign Out** triggers an styled, in-game confirmation modal (replacing the standard browser popup) to reset your progress [4.2].
- **Real-Time Sidebar XP Bar:** Added a sleek, gold XP progress bar underneath your sidebar avatar that updates smoothly as you earn mining experience [4.2].
- **Double-Multiplier Math Engine:** Rewrote the ore generation formula to cleanly separate Variant multipliers (on base values) and Mutation multipliers (on final values).
- **Anti-Spam Tap Protections:** Tapping the mystery gift instantly locks its pointer-events, preventing multi-touch gold exploits. 
- **Offline Retro Sound Synth:** Built an offline synthesized Audio Engine using the HTML5 Web Audio API, generating retro clinks, chimes, and buzzes on user gestures [4.2].
- **Global Scrollbar Styles:** Replaced default browser scrollbars with custom, thin, rounded gold-hover bars matching our game theme.
- **Integrated Game Manual View:** Added a custom separated tab in your sidebar navigation that dynamically fetches, compiles, and renders this local `README.md` file using Marked.js [4.2].
- **Physics-Based Particle Splashes (v1.6.0):** Mining any cave now triggers a burst of 6 individual, randomized gravity-simulated ore debris particles falling off-screen [4.2].
- **Active Countdown Timers (v1.6.0):** Purchasing Luck Brews or Rage Elixirs displays real-time, pulsing progress badges above your cavern maps, actively doubling rare rolls and halving energy costs [4.2].
- **Settings Mute Toggle (v1.6.0):** Tapping "Mute Sounds" in your profile menu now smoothly silences all game audio nodes in real-time, saving your preferences to local storage [4.2].

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
    collectionId: "obsidian-col",
    lootPool: [
        { name: "Raw Obsidian", rarity: "common", baseValue: 200, baseWeight: 10.0, icon: "🖤" }
        // Add up to 13 ores inside this array!
    ]
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

### 3. Add an Award Badge
```javascript
{ 
    id: "wealthy-miner", 
    category: "awards", 
    subCategory: "badges", 
    name: "Wealthy Miner", 
    desc: "Accumulate 1,000 Gold Coins.", 
    icon: "💰", 
    obtained: false,
    conditionType: "money", 
    conditionValue: 1000 
}
```