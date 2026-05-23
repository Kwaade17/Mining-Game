# ⛏️ Underworld Miner — Development Guide

Welcome to **Underworld Miner**, a lightweight, responsive, data-driven web-based idle mining game. This guide explains the code structure, the gameplay systems, and how to extend the project.

---

## 📂 Project Structure

The project is organized into a small set of files plus an image folder:

```text
index.html    # Main layout and page structure
style.css     # Responsive styling and layout rules
data.js       # Game data: caves, shop items, variants, mutations, collections
script.js     # Game logic, rendering, event handling, and UI updates
Img/          # Graphics directory for background and icon assets
```

### File responsibilities

- `index.html`: base markup and named view containers for the main game, shop, and collections.
- `style.css`: responsive layout, sidebar styling, card designs, and mobile behavior.
- `data.js`: defines the game world and editable content.
- `script.js`: handles UI rendering, mining calculations, inventory management, shop purchases, and navigation.

---

## ⚙️ Local Setup

This is a static web project, so you can run it directly from the file system or through a simple local server.

### Option 1: Open directly
1. Open `index.html` in a browser.
2. If images or scripts do not load, use a local server instead.

### Option 2: Run a local server (recommended)
If you have Python installed, run from the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## 🔧 Development Workflow

### 1. Inspect the app structure
- `index.html` contains the sidebar, navbar, and view containers used by `script.js`.
- `script.js` looks for elements by ID and class names, so keep those names consistent when editing HTML.

### 2. Change game content in `data.js`
Most gameplay tuning happens here. The main data arrays are:
- `cavesData`
- `variantsData`
- `mutationsData`
- `shopData`
- `collectionsData`

### 3. Adjust behavior in `script.js`
Use `script.js` when you want to:
- add new UI interactions
- change mining logic or XP progression
- modify shop purchase effects
- update how views are shown and hidden

---

## 🧠 Core Game Logic

Mining results are computed using two multiplier stages:

### 1) Variant roll
Each mined ore roll uses a `variantsData` multiplier.
- Normal (80%): x1.0
- Rust (10%): x5.0
- Pure (9%): x20.0
- Rainbow (1%): x50.0

### 2) Weight fluctuation
Ore weight varies randomly between 0.8 and 1.2 of the base weight.

### 3) Sub-total value
`Sub-Total = Modified Base Value × Actual Weight`

### 4) Mutation modifier
`Final Value = Sub-Total × Mutation Multiplier`

This system makes each mining result variable and allows rare drops to feel rewarding.

---

## 🎮 Gameplay Overview

### Main Game
- Click **Mine** on unlocked cave cards.
- Mining consumes energy and adds ore to inventory.
- If your bag is full, you must sell ores before mining more.

### Inventory
- The inventory tray shows all mined ores.
- Click **Sell All Ores** to convert inventory into coins.
- The current bag capacity and used slots are displayed in the navbar.

### Shop
- Use coins to buy upgrades and energy items.
- Some items are simulated IAP purchases and are rendered as special pass cards.
- Buying capacity or energy updates the player state immediately.

### Collections
- The collections tab shows unlocked pickaxes, ores, and achievements.
- Unlock progress is driven by mining results and upgrade purchases.

---

## 🛠️ How to Extend the Game

### Add a New Cave
Open `data.js` and add an object to `cavesData`:

```javascript
{
  id: 10,
  name: "Obsidian Abyss",
  image: "Img/Obsidian Abyss.png",
  requiredLevel: 12,
  energyCost: 35,
  xpReward: 400,
  baseValue: 500,
  baseWeight: 22.5,
  oreName: "Obsidian Shard",
  oreIcon: "💥"
}
```

### Add a New Shop Item
Add an entry to the `shopData` array in `data.js`:

```javascript
{
  id: "titanium-pick",
  category: "mining-speed",
  name: "Titanium Pick",
  desc: "+80% break speed.",
  cost: 1500,
  icon: "🔱",
  multiplier: 1.80
}
```

### Add a New Mutation
Add an object to `mutationsData`:

```javascript
{
  id: "magnetic",
  name: "Magnetic Mutation",
  desc: "An ore pulsing with electromagnetic force.",
  multiplier: 4.0,
  pr: 0.02,
  icon: "Icons/Awards/magnetic.png"
}
```

### Add a New Collection Entry
Add an entry to `collectionsData` with the right category:

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

### Add a New Icon or Image
Place the asset in `Img/` or `Img/Icons/`, and reference it from `data.js` or `style.css`.

---

## ✅ Debugging Tips

- If the app does not show the sidebar or menu, check `script.js` for event listeners on `menuToggle` and `sidebar`.
- If a new cave image does not load, verify the filename exactly matches the `image` path in `data.js`.
- If the shop or collections do not render, make sure IDs like `shopSectionsList` and `colSectionsList` exist in `index.html`.

---

## 🏆 Unlocks & Achievements

- Mining a new cave unlocks its base ore entry in `collectionsData`.
- Rolling a rare variant unlocks the corresponding variant collection.
- Rolling a rare mutation unlocks the mutation entry.
- Reaching level 10 unlocks the **Deep Cavern Cup**.
- Mining 100 ores unlocks the **Hard Worker** badge.

---

## 🚀 Next Improvements

Consider adding:

- more caves and upgrade tiers
- sound effects and animations
- save/load using localStorage
- a better shop currency system
- daily rewards or quests

---

If you want, I can also convert this README into a full developer handbook with a roadmap, contribution section, and feature list.