// ==================== CAVES DATABASE ====================
const cavesData = [
    { id: 1, name: "Abyssal Hollow", image: "Img/Abyssal Hollow.png", requiredLevel: 1, energyCost: 5, xpReward: 10, baseValue: 10, baseWeight: 2.5, oreName: "Coal Ore", oreIcon: "🪨", collectionId: "coal-col" },
    { id: 2, name: "Azure Sinkhole", image: "Img/Azure Sinkhole.png", requiredLevel: 2, energyCost: 6, xpReward: 15, baseValue: 18, baseWeight: 3.0, oreName: "Copper Ore", oreIcon: "🟧", collectionId: "copper-col" },
    { id: 3, name: "Crystalline Chasm", image: "Img/Crystalline Chasm.png", requiredLevel: 3, energyCost: 8, xpReward: 25, baseValue: 30, baseWeight: 4.2, oreName: "Iron Ore", oreIcon: "⚙️", collectionId: "iron-col" },
    { id: 4, name: "Echoing Grotto", image: "Img/Echoing Grotto.png", requiredLevel: 4, energyCost: 10, xpReward: 40, baseValue: 45, baseWeight: 5.0, oreName: "Silver Ore", oreIcon: "🪙", collectionId: "silver-col" },
    { id: 5, name: "Gilded Labyrinth", image: "Img/Gilded Labyrinth.png", requiredLevel: 5, energyCost: 12, xpReward: 60, baseValue: 70, baseWeight: 6.5, oreName: "Gold Vein", oreIcon: "👑", collectionId: "gold-col" },
    { id: 6, name: "Glacial Crevasse", image: "Img/Glacial Crevasse.png", requiredLevel: 6, energyCost: 15, xpReward: 90, baseValue: 110, baseWeight: 8.0, oreName: "Emerald Gem", oreIcon: "💚", collectionId: "emerald-col" },
    { id: 7, name: "The Chipped Vein", image: "Img/The Chipped Vein.png", requiredLevel: 7, energyCost: 18, xpReward: 130, baseValue: 160, baseWeight: 10.0, oreName: "Ruby Gem", oreIcon: "🟥", collectionId: "ruby-col" },
    { id: 8, name: "The Ember Maw", image: "Img/The Ember Maw.png", requiredLevel: 8, energyCost: 22, xpReward: 180, baseValue: 240, baseWeight: 12.5, oreName: "Diamond Shard", oreIcon: "💎", collectionId: "diamond-col" },
    { id: 9, name: "The Shattered Stratum", image: "Img/The Shattered Stratum.png", requiredLevel: 9, energyCost: 30, xpReward: 300, baseValue: 400, baseWeight: 18.0, oreName: "Obsidian Core", oreIcon: "🔥", collectionId: "obsidian-col" },
    { id: 10, name: "The Void Rift", image: "Img/The Void Rift.png", requiredLevel: 10, energyCost: 40, xpReward: 500, baseValue: 700, baseWeight: 25.0, oreName: "Void Essence", oreIcon: "🌑", collectionId: "void-col" }
];

// ==================== ORE VARIANTS (BASE VALUE MULTIPLIERS) ====================
const variantsData = [
    { id: "normal", name: "Normal", multiplier: 1.0, pr: 0.80, collectionId: null },   
    { id: "rust",   name: "Rust",   multiplier: 5.0, pr: 0.10, collectionId: "rust-col" },   
    { id: "pure",   name: "Pure",   multiplier: 20.0, pr: 0.09, collectionId: "pure-col" },  
    { id: "rainbow",name: "Rainbow",multiplier: 50.0, pr: 0.01, collectionId: "rainbow-col" }   
];

// ==================== ORE MUTATIONS (FINAL VALUE MULTIPLIERS) ====================
const mutationsData = [
    { id: "none", name: "Normal", desc: "A standard ore with no mutated traits.", multiplier: 1.0, pr: 0.80, icon: "Icons/Awards/none.png", collectionId: null },
    { id: "spore", name: "Spore Mutation", desc: "An ore covered in glowing organic cave spores.", multiplier: 1.5, pr: 0.10, icon: "Icons/Awards/spore.png", collectionId: "spore-col" },
    { id: "toxic", name: "Toxic Mutation", desc: "An ore glowing with highly radioactive isotopes.", multiplier: 2.0, pr: 0.06, icon: "Icons/Awards/toxic.png", collectionId: "toxic-col" },
    { id: "crystalline", name: "Crystalline Mutation", desc: "Precious crystalline structures growing on the surface.", multiplier: 3.0, pr: 0.03, icon: "Icons/Awards/crystalline.png", collectionId: "crystalline-col" },
    { id: "cosmic", name: "Cosmic Mutation", desc: "A mysterious ore pulsing with gravitational alien energy.", multiplier: 5.0, pr: 0.01, icon: "Icons/Awards/cosmic.png", collectionId: "cosmic-col" }
];

// ==================== SHOP ITEMS DATABASE ====================
const shopData = [
    // Mining Speed
    { id: "wooden-pick", category: "mining-speed", name: "Wooden Pick", desc: "+5% mining efficiency.", cost: 50, icon: "🪵", multiplier: 1.05, collectionId: "starter-tool" },
    { id: "iron-pick", category: "mining-speed", name: "Iron Pick", desc: "+20% mining efficiency.", cost: 150, icon: "⛏️", multiplier: 1.20, collectionId: "iron-digger" },
    { id: "drill-arm", category: "mining-speed", name: "Drill Arm", desc: "+50% mining efficiency.", cost: 500, icon: "🔋", multiplier: 1.50, collectionId: "drill-arm-col" },
    { id: "steel-miner", category: "mining-speed", name: "Steel Miner", desc: "+70% mining efficiency.", cost: 900, icon: "🔗", multiplier: 1.70, collectionId: "steel-miner-col" },
    
    // Bag Capacity
    { id: "pouch-bag", category: "bag-capacity", name: "Pouch Bag", desc: "Increases bag limit to 30.", cost: 80, icon: "🎒", capacity: 30, collectionId: null },
    { id: "cargo-bag", category: "bag-capacity", name: "Cargo Bag", desc: "Increases bag limit to 60.", cost: 300, icon: "💼", capacity: 60, collectionId: null },
    { id: "steel-trunk", category: "bag-capacity", name: "Steel Trunk", desc: "Increases bag limit to 120.", cost: 800, icon: "📦", capacity: 120, collectionId: null },
    
    // Energy Upgrades
    { id: "raw-apple", category: "energy", name: "Raw Apple", desc: "Restores 15 Energy.", cost: 10, icon: "🍏", energy: 15, collectionId: null },
    { id: "stamina-brew", category: "energy", name: "Stamina Brew", desc: "Restores 50 Energy.", cost: 75, icon: "🧪", energy: 50, collectionId: null },
    { id: "cooked-meat", category: "energy", name: "Cooked Meat", desc: "Restores 100 Energy.", cost: 180, icon: "🥩", energy: 100, collectionId: null },

    // Boosts / Potions
    { id: "luck-brew", category: "boosts", name: "Luck Brew", desc: "Double gem roll chance.", cost: 120, icon: "⭐", collectionId: null },
    { id: "rage-elixir", category: "boosts", name: "Rage Elixir", desc: "Cuts mining costs by 50%.", cost: 200, icon: "🔥", collectionId: null },

    // Packs
    { id: "starter-bundle", category: "packs", name: "Starter Bundle", desc: "Unlock 500 Coins & custom skin.", cost: "$1.99", icon: "💎", isIAP: true, collectionId: null },
    { id: "prospector-chest", category: "packs", name: "Prospector Chest", desc: "Unlock 2500 Coins & 5 Brews.", cost: "$4.99", icon: "🪙", isIAP: true, collectionId: null },

    // Subscriptions
    { id: "weekly-vip", category: "subscriptions", name: "Weekly VIP", desc: "Daily energy and pick speed.", cost: "$0.99/w", icon: "👑", isIAP: true, collectionId: null },
    { id: "monthly-elite", category: "subscriptions", name: "Monthly Elite", desc: "Daily gems and max capacity.", cost: "$2.99/m", icon: "⚜️", isIAP: true, collectionId: null },

    // Passes
    { id: "underworld-pass", category: "passes", name: "Season 1 Underworld Pass", desc: "Unlocks the Underworld Pass and access to Tier Rewards.", cost: "$5.99", icon: "🎫", isIAP: true, collectionId: null },
    { id: "double-xp-pass", category: "passes", name: "Double XP Permanent Pass", desc: "Permanently doubles all experience earned from mining.", cost: "$2.99", icon: "⚡", isIAP: true, collectionId: null }
];

// ==================== COLLECTIONS GALLERY DATABASE ====================
const collectionsData = [
    // Pickaxes
    { id: "starter-tool", category: "pickaxes", name: "Starter Tool", desc: "Rusty, wooden, but dependable gear.", icon: "🪵", obtained: true },
    { id: "iron-digger", category: "pickaxes", name: "Iron Digger", desc: "Wrought iron forged deep in dwarven kilns.", icon: "⛏️", obtained: false },
    { id: "drill-arm-col", category: "pickaxes", name: "Drill Arm Specialist", desc: "A fully mechanical drill arm attachment.", icon: "🔋", obtained: false },
    { id: "steel-miner-col", category: "pickaxes", name: "Stronger than Steel", desc: "A pure steel chain axe that damages everything it hits.", icon: "🔗", obtained: false },

    // Ores
    { id: "coal-col", category: "ores", name: "Coal Nugget", desc: "Combustible fuel, found in early cave layers.", icon: "🪨", obtained: false },
    { id: "copper-col", category: "ores", name: "Copper Ore", desc: "Highly conductive chunks showing green oxidation.", icon: "🟧", obtained: false },
    { id: "iron-col", category: "ores", name: "Iron Ore", desc: "Heavy metal chunks ready to be refined.", icon: "⚙️", obtained: false },
    { id: "silver-col", category: "ores", name: "Silver Ore", desc: "Precious reflective silver vein chunks.", icon: "🪙", obtained: false },
    { id: "gold-col", category: "ores", name: "Gold Vein", desc: "Pure sparkling gold nugget segments.", icon: "👑", obtained: false },
    { id: "emerald-col", category: "ores", name: "Emerald Gem", desc: "Shimmering hexagonal green emerald clusters.", icon: "💚", obtained: false },
    { id: "ruby-col", category: "ores", name: "Ruby Gem", desc: "Deep crimson ruby crystals mined from hot fissures.", icon: "🟥", obtained: false },
    { id: "diamond-col", category: "ores", name: "Diamond Shard", desc: "Indestructible diamond structures sparkling in the dark.", icon: "💎", obtained: false },
    { id: "obsidian-col", category: "ores", name: "Obsidian Core", desc: "Superheated volcanic core shards vibrating with force.", icon: "🔥", obtained: false },
    { id: "void-col", category: "ores", name: "Void Essence", desc: "A dark, gravitational substance radiating cold, silent energy.", icon: "🌑", obtained: false },

    // Mutations (Merged with Variant Unlocks)
    { id: "rust-col", category: "mutations", name: "Rust Variant", desc: "An old oxidization coating on standard cave ores.", icon: "🟫", obtained: false },
    { id: "pure-col", category: "mutations", name: "Pure Variant", desc: "Unblemished minerals displaying high density.", icon: "✨", obtained: false },
    { id: "rainbow-col", category: "mutations", name: "Rainbow Variant", desc: "Prismatic surface reflections showing color spectrums.", icon: "🌈", obtained: false },
    { id: "spore-col", category: "mutations", name: "Spore Mutation", desc: "Covered in glowing organic cave spores.", icon: "🟢", obtained: false },
    { id: "toxic-col", category: "mutations", name: "Toxic Mutation", desc: "Glowing with radioactive isotopes.", icon: "🤢", obtained: false },
    { id: "crystalline-col", category: "mutations", name: "Crystalline Mutation", desc: "Grown with sparkling crystal points.", icon: "🔮", obtained: false },
    { id: "cosmic-col", category: "mutations", name: "Cosmic Mutation", desc: "Pulsing with gravity-warping alien force.", icon: "🌌", obtained: false },

    // Awards - Trophies
    { id: "cavern-cup", category: "awards", subCategory: "trophies", name: "Cavern Cup", desc: "Reaching Level 10.", icon: "🥇", obtained: false },
    
    // Awards - Badges
    { id: "hard-worker", category: "awards", subCategory: "badges", name: "Hard Worker", desc: "Mine 100 total ores in caves.", icon: "🎖️", obtained: false }
];