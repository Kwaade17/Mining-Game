// ==================== CAVES DATABASE (DYNAMIC LOOT POOLS) ====================
const cavesData = [
    { id: 1, name: "Abyssal Hollow", image: "Img/Abyssal Hollow.png", requiredLevel: 1, energyCost: 5, xpReward: 10, collectionId: "coal-col", caveCollectionId: "cave-1-col",
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
    { id: 2, name: "Azure Sinkhole", image: "Img/Azure Sinkhole.png", requiredLevel: 2, energyCost: 6, xpReward: 15, collectionId: "copper-col", caveCollectionId: "cave-2-col",
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
    { id: 3, name: "Crystalline Chasm", image: "Img/Crystalline Chasm.png", requiredLevel: 3, energyCost: 8, xpReward: 25, collectionId: "iron-col", caveCollectionId: "cave-3-col",
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
    { id: 4, name: "Echoing Grotto", image: "Img/Echoing Grotto.png", requiredLevel: 4, energyCost: 10, xpReward: 40, collectionId: "silver-col", caveCollectionId: "cave-4-col",
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
    { id: 5, name: "Gilded Labyrinth", image: "Img/Gilded Labyrinth.png", requiredLevel: 5, energyCost: 12, xpReward: 60, collectionId: "gold-col", caveCollectionId: "cave-5-col",
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
    { id: 6, name: "Glacial Crevasse", image: "Img/Glacial Crevasse.png", requiredLevel: 6, energyCost: 15, xpReward: 90, collectionId: "emerald-col", caveCollectionId: "cave-6-col",
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
    { id: 7, name: "The Chipped Vein", image: "Img/The Chipped Vein.png", requiredLevel: 7, energyCost: 18, xpReward: 130, collectionId: "ruby-col", caveCollectionId: "cave-7-col",
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
    { id: 8, name: "The Ember Maw", image: "Img/The Ember Maw.png", requiredLevel: 8, energyCost: 22, xpReward: 180, collectionId: "diamond-col", caveCollectionId: "cave-8-col",
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
    { id: 9, name: "The Shattered Stratum", image: "Img/The Shattered Stratum.png", requiredLevel: 9, energyCost: 30, xpReward: 300, collectionId: "obsidian-col", caveCollectionId: "cave-9-col",
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
        id: 10, name: "The Void Rift", image: "Img/The Void Rift.png", requiredLevel: 10, energyCost: 40, xpReward: 500, baseValue: 700, baseWeight: 25.0, oreName: "Void Essence", oreIcon: "🌑", collectionId: "void-col", caveCollectionId: "cave-10-col",
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

// ==================== ORE VARIANTS ====================
const variantsData = [
    { id: "normal", name: "Normal", multiplier: 1.0, pr: 0.80, collectionId: null },   
    { id: "rust",   name: "Rust",   multiplier: 5.0, pr: 0.10, collectionId: "rust-col" },   
    { id: "pure",   name: "Pure",   multiplier: 20.0, pr: 0.09, collectionId: "pure-col" },  
    { id: "rainbow",name: "Rainbow",multiplier: 50.0, pr: 0.01, collectionId: "rainbow-col" }   
];

// ==================== ORE MUTATIONS ====================
const mutationsData = [
    { id: "none", name: "Normal", desc: "A standard ore with no mutated traits.", multiplier: 1.0, pr: 0.67, icon: "Icons/Awards/none.png", collectionId: null },
    { id: "spore", name: "Spore Mutation", desc: "An ore covered in glowing organic cave spores.", multiplier: 1.5, pr: 0.10, icon: "Icons/Awards/spore.png", collectionId: "spore-col" },
    { id: "toxic", name: "Toxic Mutation", desc: "An ore glowing with highly radioactive isotopes.", multiplier: 2.0, pr: 0.06, icon: "Icons/Awards/toxic.png", collectionId: "toxic-col" },
    { id: "crystalline", name: "Crystalline Mutation", desc: "Precious crystalline structures growing on the surface.", multiplier: 3.0, pr: 0.03, icon: "Icons/Awards/crystalline.png", collectionId: "crystalline-col" },
    
    // NEW MUTATIONS (v1.7.0 Expansion)
    { id: "magma", name: "Magma Mutation", desc: "An ore encrusted in hot, glowing magma rock.", multiplier: 2.5, pr: 0.05, icon: "Icons/Awards/magma.png", collectionId: "magma-col" },
    { id: "magnetic", name: "Magnetic Mutation", desc: "Pulsing with powerful electromagnetic polarities.", multiplier: 3.5, pr: 0.04, icon: "Icons/Awards/magnetic.png", collectionId: "magnetic-col" },
    { id: "radioactive", name: "Radioactive Mutation", desc: "Emitting a dangerous uranium-green glowing energy.", multiplier: 4.5, pr: 0.02, icon: "Icons/Awards/radioactive.png", collectionId: "radioactive-col" },
    { id: "fossilized", name: "Fossilized Mutation", desc: "Embedded with prehistoric, fossilized remains.", multiplier: 6.0, pr: 0.015, icon: "Icons/Awards/fossilized.png", collectionId: "fossilized-col" },
    { id: "abyssal", name: "Abyssal Mutation", desc: "Coated in dark, light-absorbing ocean moss.", multiplier: 8.0, pr: 0.008, icon: "Icons/Awards/abyssal.png", collectionId: "abyssal-col" },
    { id: "supernova", name: "Supernova Mutation", desc: "Vibrating with the residual force of a collapsed star.", multiplier: 12.0, pr: 0.004, icon: "Icons/Awards/supernova.png", collectionId: "supernova-col" },
    { id: "cosmic", name: "Cosmic Mutation", desc: "A mysterious ore pulsing with gravitational alien energy.", multiplier: 15.0, pr: 0.001, icon: "Icons/Awards/cosmic.png", collectionId: "cosmic-col" },
    { id: "singularity", name: "Singularity Mutation", desc: "An ore warped by the infinite density of a black hole.", multiplier: 25.0, pr: 0.001, icon: "Icons/Awards/singularity.png", collectionId: "singularity-col" },
    { id: "ethereal", name: "Ethereal Mutation", desc: "Pulsing with transparent, ghostly celestial energy.", multiplier: 50.0, pr: 0.001, icon: "Icons/Awards/ethereal.png", collectionId: "ethereal-col" }
];

// ==================== SHOP ITEMS DATABASE ====================
const shopData = [
    // Mining Speed
    { id: "wooden-pick", category: "mining-speed", name: "Wooden Pick", desc: "+5% mining efficiency.", cost: 50, icon: "🪵", multiplier: 1.05, collectionId: "starter-tool" },
    { id: "iron-pick", category: "mining-speed", name: "Iron Pick", desc: "+20% mining efficiency.", cost: 150, icon: "⛏️", multiplier: 1.20, collectionId: "iron-digger" },
    { id: "drill-arm", category: "mining-speed", name: "Drill Arm", desc: "+50% mining efficiency.", cost: 500, icon: "🔋", multiplier: 1.50, collectionId: "drill-arm-col", versionAdded: "1.5.0" },
    
    // Bag Capacity
    { id: "pouch-bag", category: "bag-capacity", name: "Pouch Bag", desc: "Increases bag limit to 30.", cost: 80, icon: "🎒", capacity: 30, collectionId: null },
    { id: "cargo-bag", category: "bag-capacity", name: "Cargo Bag", desc: "Increases bag limit to 60.", cost: 300, icon: "💼", capacity: 60, collectionId: null },
    { id: "steel-trunk", category: "bag-capacity", name: "Steel Trunk", desc: "Increases bag limit to 120.", cost: 800, icon: "📦", capacity: 120, collectionId: null },
    
    // Energy Upgrades
    { id: "raw-apple", category: "energy", name: "Raw Apple", desc: "Restores 15 Energy.", cost: 10, icon: "🍏", energy: 15, collectionId: null, releaseDate: "2026-05-23" },
    { id: "stamina-brew", category: "energy", name: "Stamina Brew", desc: "Restores 50 Energy.", cost: 75, icon: "🧪", energy: 50, collectionId: null },
    { id: "cooked-meat", category: "energy", name: "Cooked Meat", desc: "Restores 100 Energy.", cost: 180, icon: "🥩", energy: 100, collectionId: null },

    // Boosts / Potions
    { id: "luck-brew", category: "boosts", name: "Luck Brew", desc: "Double gem roll chance.", cost: 120, icon: "⭐", collectionId: null, buffType: "luck", buffDuration: 60 },
    { id: "rage-elixir", category: "boosts", name: "Rage Elixir", desc: "Cuts mining costs by 50%.", cost: 200, icon: "🔥", collectionId: null, buffType: "rage", buffDuration: 60 },
    { id: "xp-elixir", category: "boosts", name: "XP Elixir", desc: "Double XP gained for 45s.", cost: 150, icon: "🧪", collectionId: null, buffType: "xpBoost", buffDuration: 45 },
    
    // Money Perks
    { id: "merchant-badge", category: "money-perks", name: "Merchant Badge", desc: "+10% gold from selling ores.", cost: 350, icon: "📛", multiplier: 1.10, collectionId: null },
    { id: "golden-ring", category: "money-perks", name: "Golden Ring", desc: "+25% gold from selling ores.", cost: 1200, icon: "💍", multiplier: 1.25, collectionId: null }
];

// ==================== COLLECTIONS GALLERY DATABASE ====================
const collectionsData = [
    // Pickaxes
    { id: "starter-tool", category: "pickaxes", name: "Starter Tool", desc: "Rusty, wooden, but dependable gear.", icon: "🪵", obtained: true, speedBonus: 1.05 },
    { id: "iron-digger", category: "pickaxes", name: "Iron Digger", desc: "Wrought iron forged deep in dwarven kilns.", icon: "⛏️", obtained: false, speedBonus: 1.20 },
    { id: "drill-arm-col", category: "pickaxes", name: "Drill Arm Specialist", desc: "A fully mechanical drill arm attachment.", icon: "🔋", obtained: false, speedBonus: 1.50 },

    // Caves
    { id: "cave-1-col", category: "caves", name: "Abyssal Discovery", desc: "Mined and mapped the shallow coal deposits of the Abyssal Cavern.", icon: "🧗", obtained: true },
    { id: "cave-2-col", category: "caves", name: "Azure Discovery", desc: "Successfully navigated the watery azure sinkholes.", icon: "🌊", obtained: false },
    { id: "cave-3-col", category: "caves", name: "Crystalline Discovery", desc: "Reached the deep crystal caverns filled with sharp quartz.", icon: "🔮", obtained: false },
    { id: "cave-4-col", category: "caves", name: "Echoing Discovery", desc: "Heard the ringing sound of pure silver echoing off grotto walls.", icon: "🔔", obtained: false },
    { id: "cave-5-col", category: "caves", name: "Gilded Labyrinth", desc: "Entered the labyrinth constructed entirely of sparkling gold vein.", icon: "👑", obtained: false },
    { id: "cave-6-col", category: "caves", name: "Glacial Discovery", desc: "Breached the frozen crevices holding valuable emerald pockets.", icon: "❄️", obtained: false },
    { id: "cave-7-col", category: "caves", name: "The Chipped Discovery", desc: "Mapped the hot volcanic vents holding the chipped rubies.", icon: "🌋", obtained: false },
    { id: "cave-8-col", category: "caves", name: "The Ember Discovery", desc: "Survived the superheated maw housing raw diamond shards.", icon: "🔥", obtained: false },
    { id: "cave-9-col", category: "caves", name: "The Stratum Discovery", desc: "Reached the deep tectonic shattering layer containing obsidian cores.", icon: "🖤", obtained: false },
    { id: "cave-10-col", category: "caves", name: "The Void Discovery", desc: "Breached the event horizon rift where the void core pulses.", icon: "🧿", obtained: false },

    // Mutations (Merged with Variant Unlocks)
    { id: "rust-col", category: "mutations", name: "Rust Variant", desc: "An old oxidization coating on standard cave ores.", icon: "🟫", obtained: false, multiplier: 5.0 },
    { id: "pure-col", category: "mutations", name: "Pure Variant", desc: "Unblemished minerals displaying high density.", icon: "✨", obtained: false, multiplier: 20.0 },
    { id: "rainbow-col", category: "mutations", name: "Rainbow Variant", desc: "Prismatic surface reflections showing color spectrums.", icon: "🌈", obtained: false, multiplier: 50.0 },
    { id: "spore-col", category: "mutations", name: "Spore Mutation", desc: "Covered in glowing organic cave spores.", icon: "🟢", obtained: false, multiplier: 1.5 },
    { id: "toxic-col", category: "mutations", name: "Toxic Mutation", desc: "Glowing with radioactive isotopes.", icon: "🤢", obtained: false, multiplier: 2.0 },
    { id: "crystalline-col", category: "mutations", name: "Crystalline Mutation", desc: "Grown with sparkling crystal points.", icon: "🔮", obtained: false, multiplier: 3.0 },
    { id: "magma-col", category: "mutations", name: "Magma Mutation", desc: "An ore encrusted in hot, glowing magma rock.", icon: "🔥", obtained: false, multiplier: 2.5 },
    { id: "magnetic-col", category: "mutations", name: "Magnetic Mutation", desc: "Pulsing with powerful electromagnetic polarities.", icon: "🧲", obtained: false, multiplier: 3.5 },
    { id: "radioactive-col", category: "mutations", name: "Radioactive Mutation", desc: "Emitting a dangerous uranium-green glowing energy.", icon: "🤢", obtained: false, multiplier: 4.5 },
    { id: "fossilized-col", category: "mutations", name: "Fossilized Mutation", desc: "Embedded with prehistoric, fossilized remains.", icon: "🦴", obtained: false, multiplier: 6.0 },
    { id: "abyssal-col", category: "mutations", name: "Abyssal Mutation", desc: "Coated in dark, light-absorbing ocean moss.", icon: "🦑", obtained: false, multiplier: 8.0 },
    { id: "supernova-col", category: "mutations", name: "Supernova Mutation", desc: "Vibrating with the residual force of a collapsed star.", icon: "💥", obtained: false, multiplier: 12.0 },
    { id: "cosmic-col", category: "mutations", name: "Cosmic Mutation", desc: "Pulsing with gravity-warping alien force.", icon: "🌌", obtained: false, multiplier: 15.0 },
    { id: "singularity-col", category: "mutations", name: "Singularity Mutation", desc: "An ore warped by the infinite density of a black hole.", icon: "🧿", obtained: false, multiplier: 25.0 },
    { id: "ethereal-col", category: "mutations", name: "Ethereal Mutation", desc: "Pulsing with transparent, ghostly celestial energy.", icon: "👻", obtained: false, multiplier: 50.0 },

    // Awards - Trophies
    { id: "cavern-cup", category: "awards", subCategory: "trophies", name: "Cavern Cup", desc: "Reach Character Level 10.", icon: "🥇", obtained: false, conditionType: "level", conditionValue: 10 },
    { id: "hard-worker", category: "awards", subCategory: "badges", name: "Hard Worker", desc: "Mine 100 total ores in caves.", icon: "🎖️", obtained: false, conditionType: "mines", conditionValue: 100 },
    { id: "wealthy-miner", category: "awards", subCategory: "badges", name: "Wealthy Miner", desc: "Accumulate 1,000 Gold Coins.", icon: "💰", obtained: false, conditionType: "money", conditionValue: 1000 }
];
