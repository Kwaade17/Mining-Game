// ==================== CAVES DATABASE (DYNAMIC LOOT POOLS) ====================
const cavesData = [
    { 
        id: 1, name: "Abyssal Hollow", image: "Img/Abyssal Hollow.png", requiredLevel: 1, energyCost: 5, xpReward: 10, collectionId: "coal-col",
        lootPool: [
            { name: "Coal Ore", rarity: "common", baseValue: 5, baseWeight: 1.5, icon: "🪨" },
            { name: "Sooty Shale", rarity: "common", baseValue: 7, baseWeight: 1.8, icon: "🪵" },
            { name: "Peat Brick", rarity: "uncommon", baseValue: 12, baseWeight: 2.2, icon: "🧱" },
            { name: "Lignite Lump", rarity: "uncommon", baseValue: 16, baseWeight: 2.5, icon: "🌑" },
            { name: "Bituminous Ore", rarity: "rare", baseValue: 25, baseWeight: 3.0, icon: "⚫" },
            { name: "Anthracite Gem", rarity: "epic", baseValue: 45, baseWeight: 3.5, icon: "💎" },
            { name: "Glow-Spore Fuel", rarity: "legendary", baseValue: 90, baseWeight: 4.0, icon: "🟢" },
            { name: "Abyssal Geode", rarity: "mythic", baseValue: 200, baseWeight: 5.2, icon: "🔮" }
        ]
    },
    { 
        id: 2, name: "Azure Sinkhole", image: "Img/Azure Sinkhole.png", requiredLevel: 2, energyCost: 6, xpReward: 15, collectionId: "copper-col",
        lootPool: [
            { name: "Copper Ore", rarity: "common", baseValue: 10, baseWeight: 2.0, icon: "🟧" },
            { name: "Verdigris Crust", rarity: "common", baseValue: 14, baseWeight: 2.2, icon: "🦠" },
            { name: "Chalcopyrite", rarity: "uncommon", baseValue: 22, baseWeight: 2.6, icon: "✨" },
            { name: "Malachite Bead", rarity: "uncommon", baseValue: 30, baseWeight: 3.0, icon: "🟢" },
            { name: "Azurite Cluster", rarity: "rare", baseValue: 50, baseWeight: 3.6, icon: "🔵" },
            { name: "Bornite Peacock", rarity: "epic", baseValue: 90, baseWeight: 4.2, icon: "🦚" },
            { name: "Azure Crystal", rarity: "legendary", baseValue: 180, baseWeight: 5.0, icon: "🧊" },
            { name: "Sinkhole Matrix", rarity: "mythic", baseValue: 400, baseWeight: 6.5, icon: "🧬" }
        ]
    },
    { 
        id: 3, name: "Crystalline Chasm", image: "Img/Crystalline Chasm.png", requiredLevel: 3, energyCost: 8, xpReward: 25, collectionId: "iron-col",
        lootPool: [
            { name: "Iron Ore", rarity: "common", baseValue: 16, baseWeight: 2.8, icon: "⚙️" },
            { name: "Hematite Lump", rarity: "common", baseValue: 22, baseWeight: 3.2, icon: "🟫" },
            { name: "Pyrite Nugget", rarity: "uncommon", baseValue: 35, baseWeight: 3.8, icon: "🟡" },
            { name: "Magnetite Core", rarity: "uncommon", baseValue: 48, baseWeight: 4.4, icon: "🧲" },
            { name: "Siderite Spar", rarity: "rare", baseValue: 80, baseWeight: 5.2, icon: "💎" },
            { name: "Iron Rose Crystal", rarity: "epic", baseValue: 150, baseWeight: 6.0, icon: "🌹" },
            { name: "Chasm Geode", rarity: "legendary", baseValue: 300, baseWeight: 7.2, icon: "🔮" },
            { name: "Void-Iron Alloy", rarity: "mythic", baseValue: 650, baseWeight: 9.0, icon: "🌌" }
        ]
    },
    { 
        id: 4, name: "Echoing Grotto", image: "Img/Echoing Grotto.png", requiredLevel: 4, energyCost: 10, xpReward: 40, collectionId: "silver-col",
        lootPool: [
            { name: "Silver Ore", rarity: "common", baseValue: 24, baseWeight: 3.2, icon: "🪙" },
            { name: "Galena Chunk", rarity: "common", baseValue: 34, baseWeight: 3.6, icon: "🩶" },
            { name: "Argentite Spark", rarity: "uncommon", baseValue: 55, baseWeight: 4.2, icon: "✨" },
            { name: "Horn Silver", rarity: "uncommon", baseValue: 75, baseWeight: 4.8, icon: "🐚" },
            { name: "Sterling Cluster", rarity: "rare", baseValue: 120, baseWeight: 5.6, icon: "🪞" },
            { name: "Echoing Prism", rarity: "epic", baseValue: 240, baseWeight: 6.5, icon: "🔔" },
            { name: "Grotto Heart", rarity: "legendary", baseValue: 500, baseWeight: 7.8, icon: "💖" },
            { name: "Cosmic Silver", rarity: "mythic", baseValue: 1100, baseWeight: 10.0, icon: "🪐" }
        ]
    },
    { 
        id: 5, name: "Gilded Labyrinth", image: "Img/Gilded Labyrinth.png", requiredLevel: 5, energyCost: 12, xpReward: 60, collectionId: "gold-col",
        lootPool: [
            { name: "Gold Vein", rarity: "common", baseValue: 36, baseWeight: 4.0, icon: "👑" },
            { name: "Gold Dust Rock", rarity: "common", baseValue: 50, baseWeight: 4.5, icon: "🌟" },
            { name: "Electrum Bar", rarity: "uncommon", baseValue: 80, baseWeight: 5.2, icon: "🧈" },
            { name: "Calaverite Spark", rarity: "uncommon", baseValue: 110, baseWeight: 6.0, icon: "🔆" },
            { name: "Nugget Cluster", rarity: "rare", baseValue: 180, baseWeight: 7.0, icon: "💰" },
            { name: "Labyrinth Crown", rarity: "epic", baseValue: 360, baseWeight: 8.2, icon: "👑" },
            { name: "Aureum Elixir", rarity: "legendary", baseValue: 750, baseWeight: 9.8, icon: "🍯" },
            { name: "Gilded Relic", rarity: "mythic", baseValue: 1600, baseWeight: 12.0, icon: "🏆" }
        ]
    },
    { 
        id: 6, name: "Glacial Crevasse", image: "Img/Glacial Crevasse.png", requiredLevel: 6, energyCost: 15, xpReward: 90, collectionId: "emerald-col",
        lootPool: [
            { name: "Emerald Gem", rarity: "common", baseValue: 52, baseWeight: 5.0, icon: "💚" },
            { name: "Beryl Shard", rarity: "common", baseValue: 72, baseWeight: 5.6, icon: "🧪" },
            { name: "Aquamarine Spire", rarity: "uncommon", baseValue: 115, baseWeight: 6.4, icon: "💠" },
            { name: "Glacial Iceberg", rarity: "uncommon", baseValue: 160, baseWeight: 7.2, icon: "❄️" },
            { name: "Heliodor Spark", rarity: "rare", baseValue: 260, baseWeight: 8.5, icon: "☀️" },
            { name: "Crevasse Crystal", rarity: "epic", baseValue: 520, baseWeight: 10.0, icon: "🧊" },
            { name: "Frozen Heart", rarity: "legendary", baseValue: 1100, baseWeight: 12.0, icon: "💎" },
            { name: "Glacial Star", rarity: "mythic", baseValue: 2400, baseWeight: 15.0, icon: "🌌" }
        ]
    },
    { 
        id: 7, name: "The Chipped Vein", image: "Img/The Chipped Vein.png", requiredLevel: 7, energyCost: 18, xpReward: 130, collectionId: "ruby-col",
        lootPool: [
            { name: "Ruby Gem", rarity: "common", baseValue: 75, baseWeight: 6.2, icon: "🟥" },
            { name: "Spinel Shard", rarity: "common", baseValue: 100, baseWeight: 7.0, icon: "🩸" },
            { name: "Garnet Cluster", rarity: "uncommon", baseValue: 160, baseWeight: 8.0, icon: "🍷" },
            { name: "Carnelian Spar", rarity: "uncommon", baseValue: 220, baseWeight: 9.0, icon: "🟠" },
            { name: "Chipped Geode", rarity: "rare", baseValue: 360, baseWeight: 10.5, icon: "🔮" },
            { name: "Crimson Tear", rarity: "epic", baseValue: 720, baseWeight: 12.2, icon: "💧" },
            { name: "Scarlet Core", rarity: "legendary", baseValue: 1500, baseWeight: 14.5, icon: "❤️" },
            { name: "The Chipped Heart", rarity: "mythic", baseValue: 3300, baseWeight: 18.0, icon: "💍" }
        ]
    },
    { 
        id: 8, name: "The Ember Maw", image: "Img/The Ember Maw.png", requiredLevel: 8, energyCost: 22, xpReward: 180, collectionId: "diamond-col",
        lootPool: [
            { name: "Diamond Shard", rarity: "common", baseValue: 110, baseWeight: 7.5, icon: "💎" },
            { name: "Zircon Lump", rarity: "common", baseValue: 150, baseWeight: 8.4, icon: "🥥" },
            { name: "Topaz Spar", rarity: "uncommon", baseValue: 240, baseWeight: 9.5, icon: "💛" },
            { name: "Tourmaline", rarity: "uncommon", baseValue: 330, baseWeight: 10.8, icon: "💗" },
            { name: "Carbon Core", rarity: "rare", baseValue: 550, baseWeight: 12.5, icon: "⚫" },
            { name: "Ember Flame", rarity: "epic", baseValue: 1100, baseWeight: 14.5, icon: "🔥" },
            { name: "The Maw Eye", rarity: "legendary", baseValue: 2300, baseWeight: 17.0, icon: "👁️" },
            { name: "Cosmic Diamond", rarity: "mythic", baseValue: 5000, baseWeight: 21.0, icon: "🪐" }
        ]
    },
    { 
        id: 9, name: "The Shattered Stratum", image: "Img/The Shattered Stratum.png", requiredLevel: 9, energyCost: 30, xpReward: 300, collectionId: "obsidian-col",
        lootPool: [
            { name: "Obsidian Core", rarity: "common", baseValue: 160, baseWeight: 9.2, icon: "🔥" },
            { name: "Basalt Crust", rarity: "common", baseValue: 220, baseWeight: 10.2, icon: "🌑" },
            { name: "Volcanic Ash", rarity: "uncommon", baseValue: 350, baseWeight: 11.5, icon: "💨" },
            { name: "Tektite Pebble", rarity: "uncommon", baseValue: 480, baseWeight: 13.0, icon: "🟢" },
            { name: "Shattered Slate", rarity: "rare", baseValue: 800, baseWeight: 15.0, icon: "🧱" },
            { name: "Magma Fragment", rarity: "epic", baseValue: 1600, baseWeight: 17.5, icon: "🌋" },
            { name: "Stratum Heart", rarity: "legendary", baseValue: 3300, baseWeight: 21.0, icon: "🖤" },
            { name: "Underworld Core", rarity: "mythic", baseValue: 7200, baseWeight: 26.0, icon: "🔱" }
        ]
    },
    { 
        id: 10, name: "The Void Rift", image: "Img/The Void Rift.png", requiredLevel: 10, energyCost: 40, xpReward: 500, baseValue: 700, baseWeight: 25.0, oreName: "Void Essence", oreIcon: "🌑", collectionId: "void-col",
        lootPool: [
            { name: "Void Essence", rarity: "common", baseValue: 300, baseWeight: 12.0, icon: "🌑" },
            { name: "Singularity Dust", rarity: "common", baseValue: 400, baseWeight: 13.5, icon: "🌪️" },
            { name: "Anomalous Rock", rarity: "uncommon", baseValue: 650, baseWeight: 15.0, icon: "☄️" },
            { name: "Event Horizon", rarity: "uncommon", baseValue: 900, baseWeight: 17.2, icon: "🕳️" },
            { name: "Dark Matter", rarity: "rare", baseValue: 1500, baseWeight: 20.0, icon: "🖤" },
            { name: "Aetheric Shard", rarity: "epic", baseValue: 3000, baseWeight: 23.5, icon: "💜" },
            { name: "Rift Catalyst", rarity: "legendary", baseValue: 6200, baseWeight: 28.0, icon: "🌀" },
            { name: "The Void Heart", rarity: "mythic", baseValue: 14000, baseWeight: 35.0, icon: "🧿" }
        ]
    }
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
    { id: "wooden-pick", category: "mining-speed", name: "Wooden Pick", desc: "+5% mining efficiency.", cost: 50, icon: "🪵", multiplier: 1.05, collectionId: "starter-tool" },
    { id: "iron-pick", category: "mining-speed", name: "Iron Pick", desc: "+20% mining efficiency.", cost: 150, icon: "⛏️", multiplier: 1.20, collectionId: "iron-digger" },
    { id: "drill-arm", category: "mining-speed", name: "Drill Arm", desc: "+50% mining efficiency.", cost: 500, icon: "🔋", multiplier: 1.50, collectionId: "drill-arm-col" },
    
    { id: "pouch-bag", category: "bag-capacity", name: "Pouch Bag", desc: "Increases bag limit to 30.", cost: 80, icon: "🎒", capacity: 30, collectionId: null },
    { id: "cargo-bag", category: "bag-capacity", name: "Cargo Bag", desc: "Increases bag limit to 60.", cost: 300, icon: "💼", capacity: 60, collectionId: null },
    { id: "steel-trunk", category: "bag-capacity", name: "Steel Trunk", desc: "Increases bag limit to 120.", cost: 800, icon: "📦", capacity: 120, collectionId: null },
    
    { id: "raw-apple", category: "energy", name: "Raw Apple", desc: "Restores 15 Energy.", cost: 10, icon: "🍏", energy: 15, collectionId: null },
    { id: "stamina-brew", category: "energy", name: "Stamina Brew", desc: "Restores 50 Energy.", cost: 75, icon: "🧪", energy: 50, collectionId: null },
    { id: "cooked-meat", category: "energy", name: "Cooked Meat", desc: "Restores 100 Energy.", cost: 180, icon: "🥩", energy: 100, collectionId: null },

    { id: "luck-brew", category: "boosts", name: "Luck Brew", desc: "Double gem roll chance.", cost: 120, icon: "⭐", collectionId: null },
    { id: "rage-elixir", category: "boosts", name: "Rage Elixir", desc: "Cuts mining costs by 50%.", cost: 200, icon: "🔥", collectionId: null },

    { id: "starter-bundle", category: "packs", name: "Starter Bundle", desc: "Unlock 500 Coins & custom skin.", cost: "$1.99", icon: "💎", isIAP: true, collectionId: null },
    { id: "prospector-chest", category: "packs", name: "Prospector Chest", desc: "Unlock 2500 Coins & 5 Brews.", cost: "$4.99", icon: "🪙", isIAP: true, collectionId: null },

    { id: "weekly-vip", category: "subscriptions", name: "Weekly VIP", desc: "Daily energy and pick speed.", cost: "$0.99/w", icon: "👑", isIAP: true, collectionId: null },
    { id: "monthly-elite", category: "subscriptions", name: "Monthly Elite", desc: "Daily gems and max capacity.", cost: "$2.99/m", icon: "⚜️", isIAP: true, collectionId: null },

    { id: "underworld-pass", category: "passes", name: "Season 1 Underworld Pass", desc: "Unlocks the Underworld Pass and access to Tier Rewards.", cost: "$5.99", icon: "🎫", isIAP: true, collectionId: null },
    { id: "double-xp-pass", category: "passes", name: "Double XP Permanent Pass", desc: "Permanently doubles all experience earned from mining.", cost: "$2.99", icon: "⚡", isIAP: true, collectionId: null }
];

// ==================== COLLECTIONS GALLERY DATABASE ====================
const collectionsData = [
    { id: "starter-tool", category: "pickaxes", name: "Starter Tool", desc: "Rusty, wooden, but dependable gear.", icon: "🪵", obtained: true },
    { id: "iron-digger", category: "pickaxes", name: "Iron Digger", desc: "Wrought iron forged deep in dwarven kilns.", icon: "⛏️", obtained: false },
    { id: "drill-arm-col", category: "pickaxes", name: "Drill Arm Specialist", desc: "A fully mechanical drill arm attachment.", icon: "🔋", obtained: false },

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

    { id: "rust-col", category: "mutations", name: "Rust Variant", desc: "An old oxidization coating on standard cave ores.", icon: "🟫", obtained: false },
    { id: "pure-col", category: "mutations", name: "Pure Variant", desc: "Unblemished minerals displaying high density.", icon: "✨", obtained: false },
    { id: "rainbow-col", category: "mutations", name: "Rainbow Variant", desc: "Prismatic surface reflections showing color spectrums.", icon: "🌈", obtained: false },
    { id: "spore-col", category: "mutations", name: "Spore Mutation", desc: "Covered in glowing organic cave spores.", icon: "🟢", obtained: false },
    { id: "toxic-col", category: "mutations", name: "Toxic Mutation", desc: "Glowing with radioactive isotopes.", icon: "🤢", obtained: false },
    { id: "crystalline-col", category: "mutations", name: "Crystalline Mutation", desc: "Grown with sparkling crystal points.", icon: "🔮", obtained: false },
    { id: "cosmic-col", category: "mutations", name: "Cosmic Mutation", desc: "Pulsing with gravity-warping alien force.", icon: "🌌", obtained: false },

    { id: "cavern-cup", category: "awards", subCategory: "trophies", name: "Cavern Cup", desc: "Reaching Level 10.", icon: "🥇", obtained: false },
    { id: "hard-worker", category: "awards", subCategory: "badges", name: "Hard Worker", desc: "Mine 100 total ores in caves.", icon: "🎖️", obtained: false }
];