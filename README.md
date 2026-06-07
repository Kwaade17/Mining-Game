# ⛏️ Underworld Miner — Cavern Chronicles

[![Game Version](https://img.shields.io/badge/Version-v2.7.0-gold.svg)](https://github.com/Kwaade17/Mining-Game)
[![Platform](https://img.shields.io/badge/Platform-Web__Browser-blue.svg)](https://github.com/Kwaade17/Mining-Game)
[![Language](https://img.shields.io/badge/Made%20With-HTML%20%7C%20CSS%20%7C%20JS-brightgreen.svg)](https://github.com/Kwaade17/Mining-Game)

Welcome to **Underworld Miner**, a lightweight, responsive, and data-driven active incremental game. Step into the boots of Miner Joe and explore rich cavern layers, manage a real-time active inventory, trade raw ores at the marketplace, convert gold to premium tokens, and unlock legendary mutated artifacts to fill your prestigious collections gallery.

---

## 📂 Project Architecture

The application is engineered on a **Data-Driven UI Framework**. The user interface acts as a clean structural "shell," while all assets, stats, and cards are rendered dynamically via JavaScript:

```text
├── index.html          # Clean, placeholder-free structural shell (loads Marked.js)
├── style.css           # Compressed stylesheet handling layout depths & animations
├── data.js            # Offline database (Caves, shop items, mutations, collections)
├── script.js          # Core game engine (Mining loops, pagination, inventory, views)
└── README.md          # Interactive, in-game manual parsed via Marked.js
```

---

## ⚙️ Game Core Calculations & Math

Underworld Miner uses a sophisticated, multi-stage calculation sequence to determine the parameters and market value of every mined ore:

```text
 [ Base Value ] [ Base Weight ]
       │              │
       ▼              ▼
 [ Roll Variant ] [ Roll Fluctuation ]
(Multiplier)     (0.8x to 1.2x)
       │              │
       ▼              ▼
  Modded Value   Actual Weight
       └──────┬───────┘
              ▼
       Sub-Total Value
              │
              ▼
       [ Roll Mutation ]
       (Multiplier)
              │
              ▼
     Base Final Value
              │
              ▼
     [ Sell Multiplier ]
    (Money Perks Upgrade)
              │
              ▼
      Total Selling Price
```

### 1. Base Value Modification (Variant Roll)
Mining an ore rolls a specific **Variant** based on defined probability rates:
* **Normal (80%):** `x1.0` value multiplier
* **Rust (10%):** `x5.0` value multiplier
* **Pure (9%):** `x20.0` value multiplier
* **Rainbow (1%):** `x50.0` value multiplier

$$\text{Modified Base Value} = \text{Ore Base Value} \times \text{Variant Multiplier}$$

### 2. Weight Variance
The physical weight of the ore fluctuates randomly between $80\%$ and $120\%$ of the cave's defined base weight:
$$\text{Actual Weight} = \text{Cave Base Weight} \times \text{Random Fluctuation (0.8 to 1.2)}$$

### 3. Sub-Total Value
$$\text{Sub-Total Value} = \lfloor \text{Modified Base Value} \times \text{Actual Weight} \rfloor$$

### 4. Mutation Modification (Final Base Value)
The engine rolls a **Mutation** (e.g., Spore, Toxic, Crystalline, Cosmic) which acts as a final multiplier on your sub-total:
* **None (80%):** `x1.0` final multiplier
* **Spore (10%):** `x1.5` final multiplier
* **Toxic (6%):** `x2.0` final multiplier
* **Crystalline (3%):** `x3.0` final multiplier
* **Cosmic (1%):** `x5.0` final multiplier

$$\text{Base Final Value} = \lfloor \text{Sub-Total Value} \times \text{Mutation Multiplier} \rfloor$$

### 5. Passive Sell Upgrades (Total Selling Price)
Lastly, any purchased upgrades from the "Money Perks" section of the shop (e.g., Merchant Badge, Golden Ring) are applied when you sell your resources:
$$\text{Total Selling Price} = \lfloor \text{Base Final Value} \times \text{Player Sell Multiplier} \rfloor$$

---

## 🚀 Release History & Changelog

### 🛠️ Version 1.8.6 (Current) — The Sequence Lock & Adrenaline Update
* **Strict Progression Sequence:** Implemented progression checks (`canBuyShopItem`) across upgrade tracks. Players must buy previous upgrade tiers (e.g., Wood Pick -> Iron Pick) before unlocking advanced items.
* **New Potions & Perks:** Added the *Vigor Elixir* (0 energy cost for 30s), the *Jackpot Potion* (3x chest drop gold), and the *Magnet Badge* (doubles chest spawn rate).
* **VIP Token Subscriptions:** Implemented passive Token pension loops that generate +1 Premium Token every 60 seconds.
* **Profile Styling Fixes:** Resolved stylesheet conflicts with the custom profile avatar circles on wider viewports.

### 🎮 Version 1.8.5 — The Responsive UI & RPG Detail Update
* **Sleek Navbar XP indicator:** Added a full-width integrated XP progress bar at the bottom edge of the top header.
* **Mobile Stats Capsule:** Detached mobile stats and displayed them in an elegant horizontal floating capsule directly below the navbar on small screens.
* **RPG Inspect Modals:** Expanded information pop-ups for inventory ores (displaying Rarity classes, Cavern origins, and descriptions) and added item preview confirmation modals to the shop.

### 🪙 Version 1.8.0 — The Premium Token Economy Update
* **Token Economy:** Shifted from simulated real-money IAPs to an in-game premium token (🎟️) exchange loop, allowing players to trade Gold Coins (🪙) for Premium Tokens (🎟️).
* **Defensive Error Handling:** Integrated try-catch wrappers around core loop engines to safely isolate save-game discrepancies and prevent black screen rendering lockups.

### ⚛️ Version 1.7.0 — The Mutation Expansions
* **Expanded Mutations:** Added 9 new progressive, high-rarity mutations including Magma, Magnetic, Radioactive, Fossilized, Abyssal, Supernova, Cosmic, Singularity, and Ethereal states.

---

### Table 1: Cavern Layers & Mining Database
*This table maps the progressive requirements, energy costs, XP yields, and loot pools across all 11 caverns.*

| Cavern Layer | Req. Level | Energy Cost | XP Reward | Standard Loot Pool (Common to Mythic) |
| :--- | :---: | :---: | :---: | :--- |
| **Abyssal Hollow** (🧗) | Lvl 1 | 5⚡ | 10 XP | Coal Ore, Sooty Shale, Peat Brick, Lignite Lump, Bituminous Ore, Anthracite Gem, Glow-Spore Fuel, Abyssal Geode |
| **Azure Sinkhole** (🌊) | Lvl 2 | 6⚡ | 15 XP | Copper Ore, Verdigris Crust, Chalcopyrite, Malachite Bead, Azurite Cluster, Bornite Peacock, Azure Crystal, Sinkhole Matrix |
| **Crystalline Chasm** (🔮) | Lvl 3 | 8⚡ | 25 XP | Iron Ore, Hematite Lump, Pyrite Nugget, Magnetite Core, Siderite Spar, Iron Rose Crystal, Chasm Geode, Void-Iron Alloy |
| **Echoing Grotto** (🔔) | Lvl 4 | 10⚡ | 40 XP | Silver Ore, Galena Chunk, Argentite Spark, Horn Silver, Sterling Cluster, Echoing Prism, Grotto Heart, Cosmic Silver |
| **Gilded Labyrinth** (👑) | Lvl 5 | 12⚡ | 60 XP | Gold Vein, Gold Dust Rock, Electrum Bar, Calaverite Spark, Nugget Cluster, Labyrinth Crown, Aureum Elixir, Gilded Relic |
| **Glacial Crevasse** (❄️) | Lvl 6 | 15⚡ | 90 XP | Emerald Gem, Beryl Shard, Aquamarine Spire, Glacial Iceberg, Heliodor Spark, Crevasse Crystal, Frozen Heart, Glacial Star |
| **The Chipped Vein** (🌋) | Lvl 7 | 18⚡ | 130 XP | Ruby Gem, Spinel Shard, Garnet Cluster, Carnelian Spar, Chipped Geode, Crimson Tear, Scarlet Core, The Chipped Heart |
| **The Ember Maw** (🔥) | Lvl 8 | 22⚡ | 180 XP | Diamond Shard, Zircon Lump, Topaz Spar, Tourmaline, Carbon Core, Ember Flame, The Maw Eye, Cosmic Diamond |
| **The Shattered Stratum** (🧱) | Lvl 9 | 30⚡ | 300 XP | Obsidian Core, Basalt Crust, Volcanic Ash, Tektite Pebble, Shattered Slate, Magma Fragment, Stratum Heart, Underworld Core |
| **The Void Rift** (🕳️) | Lvl 10 | 40⚡ | 500 XP | Void Essence, Singularity Dust, Anomalous Rock, Event Horizon, Dark Matter, Aetheric Shard, Rift Catalyst, The Void Heart |
| **Supernova Crucible** (💥) | Lvl 11 | 55⚡ | 850 XP | Stellar Dust, Stellarite Shard, Plasma Residue, Neutronium Flake, Cosmic Ember, Supernova Relic, Pulsar Crystal, Heart of the Star |

---

### Table 2: Standard Shop Items (Gold Coin 🪙 Purchases)
*This table catalogues all standard items, their costs, and exact operational stat benefits.*

| Item Category | Name & Icon | Purchase Cost | Performance & Stat Benefit |
| :--- | :--- | :---: | :--- |
| **⚡ Mining Speed** | `Wooden Pick` (🪵) | 🪙 50 | **x1.05** mining breaking speed |
| | `Iron Pick` (⛏️) | 🪙 150 | **x1.20** mining breaking speed |
| | `Drill Arm` (🔋) | 🪙 500 | **x1.50** mining breaking speed |
| | `Steam Digger` (⚙️) | 🪙 1,200 | **x1.80** mining breaking speed |
| | `Sonic Pulser` (🔊) | 🪙 2,800 | **x2.20** mining breaking speed |
| | `Plasma Cutter` (🔥) | 🪙 6,500 | **x3.00** mining breaking speed |
| | `Quantum Disintegrator` (🌀) | 🪙 15,000 | **x4.50** mining breaking speed |
| | `Void Breaker` (🧿) | 🪙 35,000 | **x6.00** mining breaking speed |
| **🎒 Bag Capacity** | `Pouch Bag` (🎒) | 🪙 80 | Increases inventory limit to **30** slots |
| | `Cargo Bag` (💼) | 🪙 300 | Increases inventory limit to **60** slots |
| | `Steel Trunk` (📦) | 🪙 800 | Increases inventory limit to **120** slots |
| | `Titanium Crate` (🧳) | 🪙 2,000 | Increases inventory limit to **250** slots |
| | `Quantum Satchel` (🎒) | 🪙 6,000 | Increases inventory limit to **600** slots |
| | `Singularity Vault` (🧿) | 🪙 15,000 | Increases inventory limit to **1,500** slots |
| **🔋 Energy Foods** | `Raw Apple` (🍏) | 🪙 10 | Instantly restores **+15⚡** energy |
| | `Stamina Brew` (🧪) | 🪙 75 | Instantly restores **+50⚡** energy |
| | `Cooked Meat` (🥩) | 🪙 180 | Instantly restores **+100⚡** energy |
| | `Golden Pie` (🥧) | 🪙 300 | Instantly restores **+150⚡** energy |
| | `Plasma Elixir` (🔋) | 🪙 550 | Instantly restores **+300⚡** energy |
| | `Aether Ambrosia` (🍶) | 🪙 900 | Instantly restores **+500⚡** energy |
| **🧪 Potions & Boosts**| `Luck Brew` (⭐) | 🪙 120 | Doubles gem roll spawn rates for **60 seconds** |
| | `Rage Elixir` (🔥) | 🪙 200 | Halves all active mining energy costs for **60 seconds** |
| | `XP Elixir` (🧪) | 🪙 150 | Doubles all gained experience points for **45 seconds** |
| | `Hyper Luck Potion` (🧪) | 🪙 250 | Doubles gem roll spawn rates for **150 seconds** |
| | `Berserker Potion` (🩸) | 🪙 450 | Halves all active mining energy costs for **150 seconds** |
| | `Master XP Potion` (⚗️) | 🪙 380 | Doubles all gained experience points for **120 seconds** |
| | `Infinity Potion` (🌌) | 🪙 600 | Doubles gem roll spawn rates for **300 seconds** |
| | `Vigor Elixir` (⚡) | 🪙 350 | Grants endless mining energy (**0⚡ cost**) for **30 seconds** |
| | `Jackpot Potion` (🎰) | 🪙 500 | Triples all Gold Coins gained from chests for **60 seconds** |

---

### Table 3: Premium Shop Items (Token 🎟️ Purchases)
*This table catalogs high-tier Upgrades, Bundles, and Subscriptions purchased with premium Tokens.*

| Item Category | Name & Icon | Token Cost | Performance & Stat Benefit |
| :--- | :--- | :---: | :--- |
| **📛 Upgrades & Badges** | `Merchant Badge` (📛) | 🎟️ 3 | **+10% gold** from selling ores (x1.10 sell multiplier) |
| | `Golden Ring` (💍) | 🎟️ 10 | **+25% gold** from selling ores (x1.25 sell multiplier) |
| | `Magnet Badge` (🧲) | 🎟️ 8 | Attracts chest drops (doubles mystery chest spawn rates) |
| **🎁 Bundles & Packs** | `Starter Bundle` (🎁) | 🎟️ 5 | One-time pack: instantly grants **500 Coins & 50 Energy** |
| | `Miner Pack` (📦) | 🎟️ 12 | One-time pack: instantly grants **2,000 Coins & 100 Energy** |
| **📅 Subscriptions** | `Miner's Pension` (📅) | 🎟️ 15 | Active subscription: generates **+5 Coins passively every second** |
| | `VIP Token Membership` (🎖️) | 🎟️ 25 | Active subscription: generates **+1 Token passively every 60s** |
| **🎫 Season Passes** | `Double XP Pass` (🎫) | 🎟️ 20 | Permanent account upgrade: **doubles all gained experience** |

---

### Table 4: Dynamic Scaling Modifiers (Variants & Mutations)
*This table displays the mathematical spawn probabilities and scaling value multipliers for item modifiers.*

| Variant State | Value Multiplier | Roll Spawn Probability | Mutation State | Value Multiplier | Roll Spawn Probability |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **Normal** | **x1.0** | 80% | **Normal (none)** | **x1.0** | 67% |
| **Rust** (🟫) | **x5.0** | 10% | **Spore** (🟢) | **x1.5** | 10% |
| **Pure** (✨) | **x20.0** | 9% | **Toxic** (🤢) | **x2.0** | 6% |
| **Rainbow** (🌈) | **x50.0** | 1% | **Crystalline** (🔮) | **x3.0** | 3% |
| | | | **Magma** (🔥) | **x2.5** | 5% |
| | | | **Magnetic** (🧲) | **x3.5** | 4% |
| | | | **Radioactive** (🤢) | **x4.5** | 2% |
| | | | **Fossilized** (🦴) | **x6.0** | 1.5% |
| | | | **Abyssal** (🦑) | **x8.0** | 0.8% |
| | | | **Supernova** (💥) | **x12.0** | 0.4% |
| | | | **Cosmic** (🌌) | **x15.0** | 0.1% |
| | | | **Singularity** (🧿) | **x25.0** | 0.1% |
| | | | **Ethereal** (👻) | **x50.0** | 0.1% |

---

## ⚙️ Local Workspace Setup

To run your development environment on a PC:
1. Open your project folder inside **VS Code**.
2. Go to your Extensions tab (`Ctrl+Shift+X`), search for **Live Server**, and install it.
3. Open `index.html` and click the **Go Live** button in your bottom-right status bar.
4. Press **`F12`** inside your browser to monitor real-time variables and inspect performance.

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
  ]
}
```

### 2. Add a Shop Upgrade (Mining Speed)
```javascript
{
  id: "titanium-pick",
  category: "mining-speed",
  name: "Titanium Pick",
  desc: "+80% break speed.",
  cost: 1500,
  icon: "🔱",
  multiplier: 1.80,
  collectionId: "titanium-col",
  versionAdded: "1.8.6",
  releaseDate: "2026-05-24"
}
```

### 3. Add a Custom Buff Potion
```javascript
{
  id: "haste-elixir",
  category: "boosts",
  name: "Haste Elixir",
  desc: "Double pickaxe efficiency for 60s.",
  cost: 600,
  icon: "🧪",
  buffType: "haste",
  buffDuration: 60,
  versionAdded: "1.8.6",
  releaseDate: "2026-05-24"
}
```

### 4. Add a Custom Subscription
```javascript
{
  id: "xp-subscription",
  category: "subscriptions",
  name: "Sages' Tithe",
  desc: "Generates +10 XP every second passively.",
  cost: 30,
  icon: "📜",
  versionAdded: "1.8.6",
  releaseDate: "2026-05-24"
}
```
---

## Comprehensive Developer's Guide

#### 1. Mining Speed Upgrades (`category: "mining-speed"`)
These items scale your pickaxe mining speed multiplier. 

* **Step 1 (`data.js`):** Add the item object to the `shopData` array. Ensure you place it **directly below the current highest pickaxe** so that the sequential progression unlock is registered correctly:
  ```javascript
  { id: "laser-drill", category: "mining-speed", name: "Laser Drill", desc: "+800% mining efficiency.", cost: 75000, icon: "⚡", multiplier: 9.00, collectionId: null, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):** **No code changes are needed!** The engine automatically registers the progression order based on the index position inside `data.js` and applies the multiplier on purchase.

---

#### 2. Bag Capacity Upgrades (`category: "bag-capacity"`)
These items expand the player's inventory count limits.

* **Step 1 (`data.js`):** Add your new bag object directly underneath your last bag item inside `shopData`:
  ```javascript
  { id: "void-pouch", category: "bag-capacity", name: "Void Pouch", desc: "Increases bag limit to 3,000.", cost: 40000, icon: "🌌", capacity: 3000, collectionId: null, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):** **No code changes are needed!** The purchase handler and sequential lock engine dynamically process the capacity property.

---

#### 3. Energy Foods & Potions (`category: "energy"`)
These are expendable resources purchased with standard Gold Coins to replenish energy.

* **Step 1 (`data.js`):** Add the food item to `shopData` with an energy value:
  ```javascript
  { id: "lava-pepper", category: "energy", name: "Lava Pepper", desc: "Restores 800 Energy.", cost: 1500, icon: "🌶️", energy: 800, collectionId: null, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):** **No code changes are needed!** The engine processes the purchase infinitely (no one-time purchase locks) and caps the restored energy against the player's maximum energy pool.

---

#### 4. Temporary Potions/Buffs (`category: "boosts"`)
You can easily scale existing buffs (Luck, Rage, XP, Vigor, Jackpot) or program a brand-new custom temporary effect.

##### Option A: Using an Existing Buff Type (No JS changes required)
* **`data.js`:** Just configure `buffType` to point to `luck`, `rage`, `xpBoost`, `vigor`, or `jackpot`, and set your custom duration:
  ```javascript
  { id: "super-vigor", category: "boosts", name: "Stamina Core", desc: "Endless energy (0 cost) for 120s.", cost: 1000, icon: "⚡", buffType: "vigor", buffDuration: 120, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```

##### Option B: Programming a New Buff Type (e.g., "Haste" Potion)
* **Step 1 (`data.js`):** Create the item with a new `buffType` property:
  ```javascript
  { id: "haste-elixir", category: "boosts", name: "Haste Elixir", desc: "Double pickaxe efficiency for 60s.", cost: 600, icon: "🧪", buffType: "haste", buffDuration: 60, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):** 
  1. Add `haste: 0` to your `playerState.buffs` object and to your `loadGame()` fallback check.
  2. Map the label text inside the background timer's **`buffLabels`** dictionary:
     ```javascript
     const buffLabels = {
         luck: "🍀 Luck",
         haste: "⚡ Haste", // <-- Add this
     ```
  3. Locate where mining-speed is executed (such as the mine button timeout speed) and scale the duration:
     ```javascript
     let speedMultiplier = playerState.activePickaxeMultiplier;
     if (playerState.buffs.haste > 0) speedMultiplier *= 2; // Doubles speed!
     ```

---

#### 5. Upgrades & Badges (`category: "money-perks"`)
This category is for premium upgrades purchased using Tokens.

##### Option A: Standard Sell Multiplier (No JS changes required)
* **`data.js`:** Add the badge directly underneath the last badge upgrade item. It will automatically apply as a sequential upgrade:
  ```javascript
  { id: "diamond-badge", category: "money-perks", name: "Diamond Badge", desc: "+50% gold from selling ores.", cost: 25, icon: "💎", multiplier: 1.50, collectionId: null, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```

##### Option B: A Custom Static Passive Perk (e.g., Passive Energy Regeneration)
* **Step 1 (`data.js`):** Define the perk. Keep the `multiplier: 1.0` so it doesn't skew your standard ore selling logic:
  ```javascript
  { id: "stamina-badge", category: "money-perks", name: "Stamina Badge", desc: "Passively regenerates +1 Energy every second.", cost: 15, icon: "🔋", multiplier: 1.0, collectionId: null, versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):** 
  1. Add `hasStaminaBadge: false` to `playerState` and to your `loadGame()` fallback checks.
  2. Map the ownership rule inside **`isShopItemOwned`**:
     ```javascript
     if (item.id === "stamina-badge") return !!playerState.hasStaminaBadge;
     ```
  3. Map the purchase action inside **`buyShopItem`**:
     ```javascript
     if (item.id === "stamina-badge") playerState.hasStaminaBadge = true;
     ```
  4. Implement the active continuous loop inside your 1-second interval background timer:
     ```javascript
     if (playerState.hasStaminaBadge) {
         playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + 1);
         changed = true;
     }
     ```

---

#### 6. Bundles & Packs (`category: "packs"`)
One-time purchases providing instant resources.

* **Step 1 (`data.js`):** Define the package in `shopData`:
  ```javascript
  { id: "royal-bundle", category: "packs", name: "Royal Bundle", desc: "One-time buy: Grants 10,000 Coins & 250 Energy.", cost: 35, icon: "👑", versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):**
  1. Add `hasRoyalBundle: false` to `playerState` and `loadGame()` checks.
  2. Map the ownership rule inside **`isShopItemOwned`**:
     ```javascript
     if (item.id === "royal-bundle") return !!playerState.hasRoyalBundle;
     ```
  3. Add the reward logic inside **`buyShopItem`**:
     ```javascript
     else if (item.id === "royal-bundle") {
         playerState.hasRoyalBundle = true;
         playerState.money += 10000;
         playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + 250);
     }
     ```

---

#### 7. Continuous Subscriptions (`category: "subscriptions"`)
Purchases that generate passive rewards inside your background timer loop.

* **Step 1 (`data.js`):** Define the subscription:
  ```javascript
  { id: "xp-subscription", category: "subscriptions", name: "Sages' Tithe", desc: "Generates +10 XP every second passively.", cost: 30, icon: "📜", versionAdded: "1.8.6", releaseDate: "2026-05-24" }
  ```
* **Step 2 (`script.js`):**
  1. Add `hasXpSub: false` to `playerState` and `loadGame()` fallback checks.
  2. Map ownership inside **`isShopItemOwned`**:
     ```javascript
     if (item.id === "xp-subscription") return !!playerState.hasXpSub;
     ```
  3. Map the purchase action inside **`buyShopItem`**:
     ```javascript
     if (item.id === "xp-subscription") playerState.hasXpSub = true;
     ```
  4. Write the passive loop inside your background interval timer:
     ```javascript
     if (playerState.hasXpSub) {
         awardXp(10); // Automatically levels up the player if limit reached
     }
     ```

---

## 📄 License & Usage

This project is open-source and licensed under the MIT License. Feel free to fork, modify, and distribute the code for educational purposes or non-commercial gameplay expansions.

---

> *Manual parsed dynamically inside the game using Marked.js. Cavern operational database active and synced.*