// ==================== FIREBASE BACKEND CONFIGURATION (DEFENSIVE) ====================
let auth = null;
let db = null;
let firebaseActive = false;

if (typeof firebase !== "undefined") {
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyBeCPvV6ho9J9wBLH7wHe8j0Usg0pO2ESA",
        authDomain: "gian-app-development.firebaseapp.com",
        databaseURL: "https://gian-app-development-default-rtdb.firebaseio.com",
        projectId: "gian-app-development",
        storageBucket: "gian-app-development.firebasestorage.app",
        messagingSenderId: "750987942732",
        appId: "1:750987942732:web:373b98e40721447b3c4de9",
        measurementId: "G-5QLKWRQ4HT"
    };

    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.database();
        firebaseActive = true;
    } catch (err) {
        console.error("Firebase initialization failed:", err);
    }
} else {
    console.warn(
        "Firebase SDK not loaded. Running in local Offline-Only mode."
    );
}

let isProcessingClaim = false; // Prevents multiple revenue modals from stacking

let isShuttingDown = false; // Prevents background saves during reset

const leaderCatSelect = document.getElementById('leaderboardCategory');
const leaderboardBody = document.getElementById('leaderboardBody');
const leaderboardLoading = document.getElementById('leaderboardLoading');

document.addEventListener("DOMContentLoaded", () => {
    // ==================== SESSION STATE ====================
    const GAME_VERSION = "2.1.1"; // Active version used to check shop updates

    const playerState = {
        username: "", // Custom player display name
        level: 1,
        xp: 0,
        xpNeeded: 100,
        money: 200,
        maxBagCapacity: 20,
        tokens: 0, // <-- ADD THIS (Premium Currency)
        hasCoinSub: false, // <-- ADD THIS (Pension Subscription check)
        hasTokenSub: false, // <-- ADD THIS
        hasMagnet: false, // <-- ADD THIS
        hasStarterBundle: false, // <-- ADD THIS
        hasMinerPack: false, // <-- ADD THIS
        hasWeightPass: false, // <-- This is my own pass
        tokenSubTimer: 0, // <-- ADD THIS
        lastClaimTime: 0, // <-- ADD THIS (Daily Claim timestamp)
        saveMode: "local", // <-- ADD THIS (local or cloud)
        currentEnergy: 100,
        maxEnergy: 100,
        activePickaxeMultiplier: 1.0,
        xpMultiplier: 1.0,
        sellMultiplier: 1.0, // <-- ADD THIS LINE
        rebirthCount: 0,      // Total times rebirthed
        rebirthMultiplier: 1, // Permanent 1.25x, 1.50x, etc.
        inventory: [],
        soundsMuted: false, // Tracks global audio state
        unlockedOres: {}, // Dictionary tracking 320 progressive dynamic ore cards
        buffs: {
            luck: 0, // Dynamic luck timer in seconds
            rage: 0, // Dynamic rage cost timer in seconds
            xpBoost: 0 // Dynamic XP boost timer in seconds
        }
    };

    // ==================== SELECTORS ====================
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const navLinks = document.querySelectorAll(".nav-link");
    const gameViews = document.querySelectorAll(".game-view");
    const userProfile = document.getElementById("userProfile");

    // Profile Dropdown Options selectors
    const dropdownAccount = document.getElementById("dropdownAccount");
    const dropdownSettings = document.getElementById("dropdownSettings");
    const dropdownSignOut = document.getElementById("dropdownSignOut");

    // Username display selectors
    const navUsername = document.getElementById("navUsername");
    const sideUsername = document.getElementById("sideUsername");

    // Welcome Name Modal selectors
    const nameModal = document.getElementById("nameModal");
    const usernameInput = document.getElementById("usernameInput");
    const saveNameBtn = document.getElementById("saveNameBtn");

    // Sidebar XP Progress elements
    const sidebarXpFill = document.getElementById("sidebarXpFill");
    const sidebarXpText = document.getElementById("sidebarXpText");

    // Stats Labels
    const labelLevel = document.getElementById("player-level");
    const sidebarLevel = document.getElementById("sidebarLevel"); // <-- ADD THIS SELECTOR
    const labelXp = document.getElementById("player-xp");
    const labelMoney = document.getElementById("player-money");
    const labelTokens = document.getElementById("player-tokens"); // <-- ADD THIS Selector
    const labelOres = document.getElementById("ores-mined");
    const labelCapacity = document.getElementById("bag-capacity");
    const labelEnergy = document.getElementById("player-energy");

    const caveContainer = document.getElementById("caveContainer");
    const prevMapBtn = document.getElementById("prevMapBtn");
    const nextMapBtn = document.getElementById("nextMapBtn");
    const mapPageLabel = document.getElementById("mapPageLabel");
    const inventoryScroll = document.getElementById("inventoryScroll");
    const labelInvCount = document.getElementById("inv-count");
    const labelInvMax = document.getElementById("inv-max");
    const sellAllBtn = document.getElementById("sellAllBtn");

    const shopSearchInput = document.getElementById("shopSearchInput");
    const shopSectionFilter = document.getElementById("shopSectionFilter");
    const shopSectionsList = document.getElementById("shopSectionsList");

    const colSearchInput = document.getElementById("colSearchInput");
    const colSectionFilter = document.getElementById("colSectionFilter");
    const colSectionsList = document.getElementById("colSectionsList");

    // Modal selectors
    const infoModal = document.getElementById("infoModal");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalIcon = document.getElementById("modalIcon");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalStats = document.getElementById("modalStats");

    // Game Manual Element selectors
    const readmeContent = document.getElementById("readmeContent");

    // Active Buffs Panel container
    const buffsContainer = document.getElementById("buffsContainer");

    let currentMapPage = 1,
        cavesPerPage = 9,
        maxMapPages = 1,
        totalMinesCount = 0;
    let readmeLoaded = false;

    // Rarity weights table used to compute loot tables
    const rarityWeights = {
        common: 1000,
        uncommon: 500,
        rare: 200,
        epic: 80,
        legendary: 30,
        mythic: 10,
        divine: 3,
        cosmic: 1
    };

    // ==================== OFFLINE SYNTHESIZED SOUND ENGINE ====================
    const SoundEngine = {
        ctx: null,
        init() {
            if (!this.ctx) {
                this.ctx = new (
                    window.AudioContext || window.webkitAudioContext
                )();
            }
            if (this.ctx && this.ctx.state === "suspended") {
                this.ctx.resume();
            }
        },
        playTone(freq, type, duration, gainStart) {
            this.init();
            if (!this.ctx || playerState.soundsMuted) return;
            try {
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(
                    0.001,
                    this.ctx.currentTime + duration
                );

                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (err) {
                console.error("Audio node generation failed: ", err);
            }
        },
        playClick() {
            this.playTone(600, "sine", 0.08, 0.05);
        },
        playMine() {
            this.playTone(1200, "triangle", 0.1, 0.15);
            setTimeout(() => this.playTone(800, "sine", 0.05, 0.05), 40);
        },
        playCoin() {
            this.playTone(987.77, "sine", 0.12, 0.08);
            setTimeout(() => this.playTone(1318.51, "sine", 0.22, 0.08), 80);
        },
        playLevelUp() {
            this.playTone(523.25, "triangle", 0.15, 0.15);
            setTimeout(
                () => this.playTone(659.25, "triangle", 0.15, 0.15),
                100
            );
            setTimeout(
                () => this.playTone(783.99, "triangle", 0.15, 0.15),
                200
            );
            setTimeout(() => this.playTone(1046.5, "triangle", 0.4, 0.15), 300);
        },
        playError() {
            this.playTone(130, "sawtooth", 0.25, 0.12);
        },
        playUnlock() {
            this.playTone(880, "sine", 0.1, 0.08);
            setTimeout(() => this.playTone(1100, "sine", 0.1, 0.08), 60);
            setTimeout(() => this.playTone(1320, "sine", 0.15, 0.08), 120);
        }
    };

    // ==================== SHOP ITEM OWNSHIP CHECKER ====================
    function isShopItemOwned(item) {
        try {
            if (!item || !item.category) return false;

            if (item.category === "mining-speed") {
                return (
                    (playerState.activePickaxeMultiplier || 1.0) >=
                    (item.multiplier || 1.0)
                );
            }
            if (item.category === "bag-capacity") {
                return (
                    (playerState.maxBagCapacity || 20) >= (item.capacity || 20)
                );
            }
            if (item.category === "money-perks") {
                if (item.id === "magnet-badge") return !!playerState.hasMagnet;
                return (
                    (playerState.sellMultiplier || 1.0) >=
                    (item.multiplier || 1.0)
                );
            }
            if (item.category === "subscriptions") {
                if (item.id === "coin-subscription")
                    return !!playerState.hasCoinSub;
                if (item.id === "token-subscription")
                    return !!playerState.hasTokenSub;
            }
            if (item.category === "passes") {
                if (item.id === "double-xp-pass")
                    return (playerState.xpMultiplier || 1.0) >= 2.0;
                if (item.id === "twice-weight-pass")
                    return !!playerState.hasWeightPass;
            }
            if (item.category === "packs") {
                if (item.id === "starter-bundle")
                    return !!playerState.hasStarterBundle;
                if (item.id === "miner-pack") return !!playerState.hasMinerPack;
            }
        } catch (error) {
            console.error("Error inside isShopItemOwned checker:", error, item);
        }
        return false;
    }

    // ==================== SEQUENTIAL SHOP ITEM UNLOCK CHECKER ====================
    function canBuyShopItem(item) {
        try {
            if (!item || !item.category) return true;

            // Apply sequence locks to progressive categories
            const sequentialCategories = [
                "mining-speed",
                "bag-capacity",
                "money-perks"
            ];
            if (sequentialCategories.includes(item.category)) {
                const categoryItems = shopData.filter(
                    i => i.category === item.category
                );
                const itemIndex = categoryItems.findIndex(
                    i => i.id === item.id
                );

                // If this is not the first item in the category, player must own the previous one
                if (itemIndex > 0) {
                    const prevItem = categoryItems[itemIndex - 1];
                    return isShopItemOwned(prevItem);
                }
            }
        } catch (error) {
            console.error("Error inside canBuyShopItem checker:", error, item);
        }
        return true;
    }
    
    function triggerRebirth() {
        if (playerState.level < 100) {
            SoundEngine.playError();
            showNotification("Locked", "You must reach Level 100 to Rebirth!", "error");
            return;
        }

        const nextMult = playerState.rebirthMultiplier + 0.25;

        openDetailModal(
            "Ascend to Rebirth?",
            "✨",
            `By rebirthing, you will lose your Gold, Levels, and Pickaxes, but your soul will become stronger.<br><br><strong>New Multiplier: x${nextMult.toFixed(2)}</strong>`,
            [
                { label: "Current Rebirths", value: playerState.rebirthCount },
                { label: "New XP Boost", value: "+10%" },
                { label: "New Gold Boost", value: "+25%" }
            ],
            {
                label: "ASCEND NOW",
                callback: () => {
                    // 1. Increase Rebirth Stats
                    playerState.rebirthCount++;
                    playerState.rebirthMultiplier += 0.25;
                    playerState.xpMultiplier += 0.10;

                    // 2. WIPE Progress
                    playerState.money = 200;
                    playerState.level = 1;
                    playerState.xp = 0;
                    playerState.xpNeeded = 100;
                    playerState.inventory = [];
                    playerState.maxBagCapacity = 20;
                    playerState.activePickaxeMultiplier = 1.0;
                    playerState.maxEnergy = 100;
                    playerState.currentEnergy = playerState.maxEnergy;

                    // 3. Effect & Save
                    SoundEngine.playLevelUp();
                    showNotification("ASCENDED", `Welcome to Rebirth Rank ${playerState.rebirthCount}!`, "level-up", 6000);
                    
                    
                    saveGame();
                    updateMapPageStructure(); // Re-lock caves
                    updateStatsUI();
                    renderShop(); // Reset buy buttons
                    renderInventoryTray();
                    
                    // Close sidebar if on mobile
                    if (window.innerWidth < 768) sidebar.classList.remove('open');
                }
            }
        );
    }

    // ==================== PERSISTENT LOCAL STORAGE ENGINE ====================
    function saveGame() {
        if (isShuttingDown) return; // Block saving if the game is resetting
        localStorage.setItem("miner_save", JSON.stringify(playerState));
        const colMap = {};
        collectionsData.forEach(item => {
            colMap[item.id] = item.obtained;
        });
        localStorage.setItem("miner_col_save", JSON.stringify(colMap));

        // Locate inside saveGame() and update:
        // Background Cloud Sync Integration (Offline-First Sync)
        if (
            playerState.saveMode === "cloud" &&
            navigator.onLine &&
            firebaseActive
        ) {
            const user = auth.currentUser;
            if (user) {
                db.ref("users/" + user.uid + "/saveState")
                    .set(playerState)
                    .catch(err =>
                        console.error("Cloud progress sync failed:", err)
                    );
                db.ref("users/" + user.uid + "/collections")
                    .set(colMap)
                    .catch(err =>
                        console.error("Cloud collections sync failed:", err)
                    );
            }
        }
    }

    function loadGame() {
        const savedState = localStorage.getItem("miner_save");
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);

                if (parsed.inventory) {
                    parsed.inventory.forEach(ore => {
                        ore.isNew = false;
                    });
                }

                Object.assign(playerState, parsed);

                // Fix: Initialize buffs and unlockedOres if missing from older save formats
                if (!playerState.buffs) {
                    playerState.buffs = { luck: 0, rage: 0, xpBoost: 0 };
                }
                if (!playerState.unlockedOres) {
                    playerState.unlockedOres = {};
                }
                if (playerState.sellMultiplier === undefined) {
                    playerState.sellMultiplier = 1.0; // <-- ADD THIS LINE
                }
                if (playerState.tokens === undefined) {
                    playerState.tokens = 0; // <-- ADD THIS
                }
                if (playerState.hasCoinSub === undefined) {
                    playerState.hasCoinSub = false; // <-- ADD THIS
                }
                if (playerState.hasTokenSub === undefined) {
                    playerState.hasTokenSub = false;
                }
                if (playerState.hasMagnet === undefined) {
                    playerState.hasMagnet = false;
                }
                if (playerState.tokenSubTimer === undefined) {
                    playerState.tokenSubTimer = 0;
                }
                if (!playerState.buffs.vigor) {
                    playerState.buffs.vigor = 0;
                }
                if (!playerState.buffs.jackpot) {
                    playerState.buffs.jackpot = 0;
                }
                if (playerState.hasStarterBundle === undefined) {
                    playerState.hasStarterBundle = false;
                }
                if (playerState.hasMinerPack === undefined) {
                    playerState.hasMinerPack = false;
                }
                if (playerState.lastClaimTime === undefined) {
                    playerState.lastClaimTime = 0; // <-- ADD THIS
                }
                if (playerState.saveMode === undefined) {
                    playerState.saveMode = "local"; // <-- ADD THIS
                }
                if (playerState.rebirthCount === undefined) playerState.rebirthCount = 0;
                if (playerState.rebirthMultiplier === undefined) playerState.rebirthMultiplier = 1.0;
                if (playerState.hasWeightPass === undefined) playerState.hasWeightPass = false;
            } catch (err) {
                console.error("Save load failed: ", err);
            }
        }

        const savedCol = localStorage.getItem("miner_col_save");
        if (savedCol) {
            try {
                const parsedCol = JSON.parse(savedCol);
                collectionsData.forEach(item => {
                    if (parsedCol[item.id] !== undefined) {
                        item.obtained = parsedCol[item.id];
                        item.isNew = false;
                    }
                });
            } catch (err) {
                console.error("Collections load failed: ", err);
            }
        }
        
        // Sync tiny scorecard to Global Leaderboard if online
        if (playerState.saveMode === "cloud" && firebaseActive && auth.currentUser) {
            const scorecard = {
                username: playerState.username,
                level: playerState.level,
                money: playerState.money,
                rebirthCount: playerState.rebirthCount,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            };
            db.ref('leaderboards/' + auth.currentUser.uid).set(scorecard);
        }
    }

    // ==================== CURRENCY FORMATTER ENGINE ====================
    function formatMoney(value, compact = false) {
        const num = Number(value);
        if (isNaN(num)) return "0";

        if (compact && num >= 100000) {
            return new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1
            }).format(num);
        }

        return num.toLocaleString();
    }

    // ==================== INTERACTIVE NOTIFICATION SYSTEM ====================
    let notificationContainer = document.querySelector(
        ".notification-container"
    );
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    function showNotification(
        title,
        message,
        type = "",
        duration = 4000,
        action = null
    ) {
        const toast = document.createElement("div");
        toast.className = `toast-notification toast-${type}`;

        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${title}</span>
                <button class="toast-close-btn" aria-label="Close">×</button>
            </div>
            <div class="toast-body">${message}</div>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        if (action) {
            const actionBtn = document.createElement("button");
            actionBtn.className = "toast-action-btn";
            actionBtn.textContent = action.label;
            actionBtn.addEventListener("click", e => {
                e.stopPropagation();
                SoundEngine.playClick();
                action.callback();
                closeToast();
            });
            toast.appendChild(actionBtn);
        }

        function closeToast() {
            if (toast.classList.contains("exiting")) return;
            toast.classList.add("exiting");
            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        toast.querySelector(".toast-close-btn").addEventListener("click", e => {
            e.stopPropagation();
            SoundEngine.playClick();
            closeToast();
        });

        setTimeout(closeToast, duration);
        notificationContainer.appendChild(toast);
    }

    function navigateToView(viewId) {
        const targetLink = document.querySelector(
            `.nav-link[data-view="${viewId}"]`
        );
        if (targetLink) {
            targetLink.click();
        }
    }

    // ==================== DYNAMIC POPUP MODAL ENGINE (FIXED) ====================
    function openDetailModal(
        title,
        icon,
        description,
        statsArray = [],
        customAction = null
    ) {
        if (
            !infoModal ||
            !modalTitle ||
            !modalIcon ||
            !modalDescription ||
            !modalStats
        )
            return;

        // Reset content
        modalTitle.textContent = title;
        modalIcon.textContent = icon;
        modalDescription.innerHTML = description;
        modalStats.innerHTML = ""; // Clear stats and buttons

        if (statsArray.length > 0) {
            modalStats.style.display = "flex";
            statsArray.forEach(stat => {
                const row = document.createElement("div");
                row.className = "modal-stat-row";
                row.innerHTML = `
                    <span class="modal-stat-label">${stat.label}</span>
                    <span class="modal-stat-val">${stat.value}</span>
                `;
                modalStats.appendChild(row);
            });
        } else {
            modalStats.style.display = "none";
        }

        // Handle Custom Action (Confirm Purchase / Collect Revenue)
        if (customAction) {
            modalStats.style.display = "flex"; // Ensure container is visible for the button
            const btn = document.createElement("button");
            btn.className = "card-buy-btn";
            btn.style.marginTop = "15px";
            btn.style.width = "100%";
            btn.textContent = customAction.label;

            btn.addEventListener("click", e => {
                e.stopPropagation();
                infoModal.classList.remove("active");
                setTimeout(() => {
                    customAction.callback();
                }, 100);
            });
            modalStats.appendChild(btn);
        }

        infoModal.classList.add("active");
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            SoundEngine.playClick();
            infoModal.classList.remove("active");
        });
    }

    if (infoModal) {
        infoModal.addEventListener("click", e => {
            if (e.target === infoModal) {
                SoundEngine.playClick();
                infoModal.classList.remove("active");
            }
        });
    }

    // ==================== GAME MANUAL PARSER (README.MD FETCH) ====================
    function loadReadmeFile() {
        if (readmeLoaded || !readmeContent) return;

        fetch("README.md")
            .then(response => {
                if (!response.ok)
                    throw new Error("Could not load README.md file.");
                return response.text();
            })
            .then(markdownText => {
                if (window.marked) {
                    readmeContent.innerHTML = window.marked.parse(markdownText);
                    readmeLoaded = true;
                } else {
                    readmeContent.innerHTML = `<pre style="font-family: inherit; font-size: 0.8rem; white-space: pre-wrap;">${markdownText}</pre>`;
                }
            })
            .catch(err => {
                console.error(err);
                readmeContent.innerHTML = `
                    <div style="text-align: center; margin: auto;">
                        <span style="font-size: 2rem;">⚠️</span>
                        <p style="color: #f87171; font-size: 0.85rem; margin-top: 10px;">
                            Failed to load Game Manual.<br>
                            Ensure you are running your browser via VS Code <strong>Live Server</strong>.
                        </p>
                    </div>`;
            });
    }

    // ==================== VISUAL EFFECTS ENGINE ====================
    function spawnFloatingText(text, x, y, colorClass = "") {
        const el = document.createElement("div");
        el.className = `floating-text ${colorClass}`;
        el.innerHTML = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 1200);
    }

    // Spawns 6 physical rock splash particles falling on click coords
    function spawnMineParticles(x, y, icon) {
        const particleCount = 6;
        const particlePool = [icon, "🪨", "✨", "🪙", "🟫"];

        for (let i = 0; i < particleCount; i++) {
            const el = document.createElement("div");
            el.className = "mine-particle";
            el.innerHTML =
                particlePool[Math.floor(Math.random() * particlePool.length)];
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            document.body.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const force = 3 + Math.random() * 6;
            const vx = Math.cos(angle) * force;
            const vy = Math.sin(angle) * force - 4;

            let currentX = x,
                currentY = y,
                currentVy = vy;

            const physicsInterval = setInterval(() => {
                currentX += vx;
                currentVy += 0.6;
                currentY += currentVy;

                el.style.left = `${currentX}px`;
                el.style.top = `${currentY}px`;

                if (currentY > window.innerHeight + 50) {
                    clearInterval(physicsInterval);
                    el.remove();
                }
            }, 30);

            setTimeout(() => {
                clearInterval(physicsInterval);
                el.remove();
            }, 1000);
        }
    }

    function rollChestSpawn() {
        // Magnet Badge doubles base spawn rate (from 8% to 16%)
        const spawnChance = playerState.hasMagnet ? 0.16 : 0.08;
        if (Math.random() <= spawnChance) {
            const activeView = document.querySelector(".game-view.active");
            if (!activeView) return;

            const chest = document.createElement("div");
            chest.className = "mystery-chest";
            chest.innerHTML = "🎁";

            const rect = activeView.getBoundingClientRect();
            const randomX = Math.max(30, Math.random() * (rect.width - 70));
            const randomY = Math.max(90, Math.random() * (rect.height - 180));

            chest.style.left = `${randomX}px`;
            chest.style.top = `${randomY}px`;

            chest.addEventListener("click", e => {
                e.stopPropagation();
                chest.style.pointerEvents = "none";

                let rewardGold = 40 + Math.floor(Math.random() * 61);

                // Triple chest gold if Jackpot buff is active
                if (playerState.buffs && playerState.buffs.jackpot > 0) {
                    rewardGold *= 3;
                }

                playerState.money += rewardGold;

                // Fix: Corrected parenthesis syntax inside formatMoney call
                spawnFloatingText(
                    `+🪙 ${formatMoney(rewardGold)}`,
                    e.clientX,
                    e.clientY,
                    "float-gold"
                );
                showNotification(
                    "🎁 Gift Opened!",
                    `Unlocked 🪙 ${formatMoney(rewardGold)} Coins from a Cavern Chest!`,
                    "sell",
                    3500
                );

                SoundEngine.playCoin(); // Triggers your custom coin sound natively

                chest.remove();
                saveGame();
                updateStatsUI();
            });

            activeView.appendChild(chest);

            setTimeout(() => {
                chest.remove();
            }, 7000);
        }
    }

    // ==================== ACTIVE TIMERS ENGINE ====================
    function renderBuffsUI() {
        if (!buffsContainer) return;
        buffsContainer.innerHTML = "";

        const buffLabels = {
            luck: "🍀 Luck",
            rage: "🔥 Rage",
            xpBoost: "✨ Double XP",
            vigor: "⚡ Infinite Energy", // <-- ADD THIS
            jackpot: "🎰 Jackpot" // <-- ADD THIS
        };

        if (!playerState.buffs) return;

        Object.keys(playerState.buffs).forEach(key => {
            const duration = playerState.buffs[key];
            if (duration > 0) {
                const badge = document.createElement("div");
                badge.className = "buff-badge";
                badge.innerHTML = `${buffLabels[key] || key.toUpperCase()}: ${duration}s`;
                buffsContainer.appendChild(badge);
            }
        });
    }

    setInterval(() => {
        let changed = false;
        if (playerState.buffs) {
            Object.keys(playerState.buffs).forEach(key => {
                if (playerState.buffs[key] > 0) {
                    playerState.buffs[key]--;
                    changed = true;
                }
            });
        }

        // Passively generate 5 coins every second if Coin Subscription is active
        if (playerState.hasCoinSub) {
            playerState.money += 5;
            changed = true;
        }

        // Passive Coin Subscription Pension Tick
        if (playerState.hasCoinSub) {
            playerState.money += 5;
            changed = true;
        }

        // Passive Token Subscription Pension Tick (1 Premium Token every 60s)
        if (playerState.hasTokenSub) {
            playerState.tokenSubTimer++;
            if (playerState.tokenSubTimer >= 60) {
                playerState.tokens += 1;
                playerState.tokenSubTimer = 0;
                showNotification(
                    "🎟️ Token Pension!",
                    "Received +1 Premium Token from your VIP Subscription!",
                    "shop",
                    3500
                );
                changed = true;
            }
        }

        if (changed) {
            renderBuffsUI();
            updateStatsUI(); // Keeps the numbers in sync
            saveGame();
        }
    }, 1000);

    // ==================== UTILITY ALGORITHMS ====================
    function rollWeightedSelection(itemsArray) {
        const roll = Math.random();
        let cumulative = 0;
        for (let item of itemsArray) {
            cumulative += item.pr;
            if (roll <= cumulative) return item;
        }
        return itemsArray[0];
    }

    function updateStatsUI() {
        if (labelLevel) labelLevel.textContent = playerState.level;
        if (sidebarLevel)
            sidebarLevel.textContent = `Lvl. ${playerState.level}`;

        // Format Money and Tokens (Compact)
        if (labelMoney)
            labelMoney.textContent = formatMoney(playerState.money, true);
        if (labelTokens)
            labelTokens.textContent = formatMoney(playerState.tokens, true);

        if (labelOres) labelOres.textContent = playerState.inventory.length;
        if (labelCapacity)
            labelCapacity.textContent = playerState.maxBagCapacity;

        // FIX: Format Large Energy Percentages
        if (labelEnergy) {
            const energyVal = Math.floor(playerState.currentEnergy);
            labelEnergy.textContent =
                energyVal > 9999
                    ? `${formatMoney(energyVal, true)}%`
                    : `${energyVal}%`;
        }

        // 1. Sidebar XP Progress
        if (sidebarXpFill && sidebarXpText) {
            const xpPercent = Math.min(
                100,
                (playerState.xp / playerState.xpNeeded) * 100
            );
            sidebarXpFill.style.width = `${xpPercent}%`;
            // FIX: Use compact formatting for sidebar XP (e.g., 1.5e+22 -> 150Sx)
            sidebarXpText.textContent = `XP: ${formatMoney(playerState.xp, true)} / ${formatMoney(playerState.xpNeeded, true)}`;
        }

        // 2. Navbar XP Progress
        const navXpFill = document.getElementById("navXpFill");
        const navXpText = document.getElementById("navXpText");
        if (navXpFill && navXpText) {
            const xpPercent = Math.min(
                100,
                (playerState.xp / playerState.xpNeeded) * 100
            );
            navXpFill.style.width = `${xpPercent}%`;

            const xpLeft = playerState.xpNeeded - playerState.xp;
            // FIX: Use compact formatting for XP Left
            navXpText.textContent = `${formatMoney(xpLeft, true)} XP to Level Up`;
        }

        // 3. Floating Mobile Stats Bar
        const floatMoney = document.getElementById("float-money");
        const floatTokens = document.getElementById("float-tokens");
        const floatBag = document.getElementById("float-bag");
        const floatEnergy = document.getElementById("float-energy");

        if (floatMoney)
            floatMoney.textContent = formatMoney(playerState.money, true);
        if (floatTokens)
            floatTokens.textContent = formatMoney(playerState.tokens, true);
        if (floatBag)
            floatBag.textContent = `${playerState.inventory.length} / ${playerState.maxBagCapacity}`;
        if (floatEnergy) {
            const eVal = Math.floor(playerState.currentEnergy);
            floatEnergy.textContent =
                eVal > 9999 ? `${formatMoney(eVal, true)}%` : `${eVal}%`;
        }

        const displayName = playerState.username
            ? playerState.username
            : "Miner Joe";
        if (navUsername) navUsername.textContent = displayName;
        if (sideUsername) sideUsername.textContent = displayName;

        // Dynamic Claim Button Cooldown Text Update
        if (dailyClaimBtn) {
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;
            const timePassed = now - playerState.lastClaimTime;

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                );
                dailyClaimBtn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${hours}h ${minutes}m left`;
                dailyClaimBtn.style.opacity = "0.75";
                dailyClaimBtn.style.borderColor = "#444";
                dailyClaimBtn.style.color = "var(--text-muted)";
            } else {
                dailyClaimBtn.innerHTML = `<i class="fa-solid fa-gift"></i> Claim Gift`;
                dailyClaimBtn.style.opacity = "1";
                dailyClaimBtn.style.borderColor = "var(--gold-accent)";
                dailyClaimBtn.style.color = "var(--gold-accent)";
            }
        }
        
        // Inside updateStatsUI()
        const rebirthBtn = document.getElementById('rebirthBtn');
        const sidebarRebirth = document.getElementById('sidebarRebirth');

        if (rebirthBtn) {
         // Show button if Lvl 100+
         rebirthBtn.style.display = playerState.level >= 100 ? 'block' : 'none';
         rebirthBtn.onclick = triggerRebirth;
        }

        if (sidebarRebirth) {
         // Show Rebirth Rank if they have rebirthed at least once
         if (playerState.rebirthCount > 0) {
           sidebarRebirth.style.display = 'block';
           sidebarRebirth.textContent = `Rebirth Rank: ${playerState.rebirthCount}`;
          }
        }

        checkAchievements();
    }

    function awardXp(amount) {
        const activeMultiplier =
            playerState.buffs && playerState.buffs.xpBoost > 0
                ? playerState.xpMultiplier * 1.1
                : playerState.xpMultiplier;
        playerState.xp += amount * activeMultiplier;

        if (playerState.xp >= playerState.xpNeeded) {
            playerState.xp -= playerState.xpNeeded;
            playerState.level += 1;

            // NERF: Increased progression difficulty from 1.5x to 1.6x curve
            playerState.xpNeeded = Math.floor(playerState.xpNeeded * 1.2);

            // BUFF: Increased energy growth from 1.1x to 1.15x per level
            playerState.maxEnergy = Math.floor(playerState.maxEnergy * 1.12);
            playerState.currentEnergy = playerState.maxEnergy;

            // BUFF: Award +1 Premium Token on every level up!
            playerState.tokens += 1;

            SoundEngine.playLevelUp();

            showNotification(
                "🎉 Level Up!",
                `Awesome! You reached Level ${playerState.level}! Gained +1 Premium Token and Max Energy increased to ${playerState.maxEnergy}%!`,
                "level-up",
                5000
            );

            if (playerState.level >= 10) unlockCollectionItem("cavern-cup");

            updateMapPageStructure();
        }
        updateStatsUI();
        saveGame();
        if (firebaseActive && playerState.saveMode === "cloud") {
            claimPendingEarnings(); // <-- ADD THIS
        }
    }

    // ==================== INVENTORY & SELLING ====================
    function renderInventoryTray() {
        if (!inventoryScroll) return;
        inventoryScroll.innerHTML = "";

        labelInvCount.textContent = playerState.inventory.length;
        labelInvMax.textContent = playerState.maxBagCapacity;

        if (playerState.inventory.length === 0) {
            inventoryScroll.innerHTML = `<div class="empty-inv" style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">Bag is Empty</div>`;
            return;
        }

        playerState.inventory.forEach((item, index) => {
            const card = document.createElement("div");

            // 1. Set the visual skin tier based on your stored variant string
            const variantId = item.variant
                ? item.variant.toLowerCase()
                : "normal";
            card.className = `loot-item variant-${variantId}`;

            // 2. Calculate the sell price using your precalculated finalValue and sellMultiplier
            const itemPrice = Math.floor(
                (item.finalValue || item.baseValue) * playerState.sellMultiplier * playerState.rebirthMultiplier // <--- ADD THIS
            );

            // 3. Extract the weight value directly from your stored actualWeight
            const displayWeight = item.actualWeight
                ? item.actualWeight.toFixed(2)
                : (item.baseWeight || 0.0).toFixed(2);

            // 4. Build the dynamic title prefix (omitting 'Normal' and cleaning up the " Mutation" suffix)
            let prefix = "";
            if (item.variant && item.variant !== "Normal") {
                prefix += `${item.variant} `;
            }
            if (item.mutation && item.mutation !== "Normal") {
                // Clean the name dynamically (e.g. "Spore Mutation" becomes "Spore")
                const cleanMutation = item.mutation.replace(" Mutation", "");
                prefix += `${cleanMutation} `;
            }

            // Render the card displaying both the price and the weight
            card.innerHTML = `
                ${item.isNew ? '<span class="new-badge">New</span>' : ""}
                <span class="loot-icon">${item.icon || "🪨"}</span>
                <div class="loot-details">
                    <span class="loot-name">${prefix}${item.name}</span>
                    <span class="loot-meta">🪙 ${formatMoney(itemPrice)} | ⚖️ ${displayWeight} kg</span>
                </div>
            `;

            // Click to view modal details (now displaying comprehensive RPG stats safely)
            card.addEventListener("click", () => {
                SoundEngine.playClick();

                // Clear new status badge if clicked
                if (item.isNew) {
                    item.isNew = false;
                    saveGame();
                    renderInventoryTray();
                }

                // Dynamic lookup: Find which cave this ore originates from
                let sourceCave = "Unknown Caverns";
                const foundCave = cavesData.find(
                    c =>
                        c.lootPool && c.lootPool.some(o => o.name === item.name)
                );
                if (foundCave) {
                    sourceCave = foundCave.name;
                }

                // Styled rarity tags
                const rarityLabels = {
                    common: "⚪ Common",
                    uncommon: "🟢 Uncommon",
                    rare: "🔵 Rare",
                    epic: "🟣 Epic",
                    legendary: "🟡 Legendary",
                    mythic: "🔴 Mythic",
                    divine: "✨ Divine",
                    cosmic: "🌌 Cosmic"
                };

                // SAFE LOOKUP: Read the description directly from the global mutationsData array
                let description = `A pristine raw specimen of ${item.name} mined deep from the core walls.`;
                if (item.mutation && item.mutation !== "Normal") {
                    const foundMutation = mutationsData.find(
                        m => m.name === item.mutation
                    );
                    if (foundMutation) {
                        description = foundMutation.desc;
                    }
                }

                const stats = [
                    {
                        label: "Rarity Class",
                        value:
                            rarityLabels[item.rarity] ||
                            item.rarity.toUpperCase()
                    },
                    { label: "Cavern Origin", value: `🧗 ${sourceCave}` },
                    {
                        label: "Specimen Weight",
                        value: `⚖️ ${displayWeight} kg ${playerState.hasWeightPass ? "X2" : "X1"}`
                    },
                    {
                        label: "Base Value",
                        value: `🪙 ${formatMoney(item.baseValue)}`
                    },
                    {
                        label: "Variant Modifier",
                        value: `${item.variant || "Normal"} (x${item.variantMultiplier || 1})`
                    },
                    {
                        label: "Mutational State",
                        value: `${item.mutation || "Normal"} (x${item.mutationMultiplier || 1})`
                    },
                    {
                        label: "Sell Multiplier",
                        value: `x${playerState.sellMultiplier.toFixed(2)}`
                    },
                    {
                        label: "Total Value",
                        value: `🪙 ${formatMoney(itemPrice)}`
                    }
                ];

                openDetailModal(
                    `${prefix}${item.name}`,
                    item.icon || "🪨",
                    description,
                    stats
                );
            });

            inventoryScroll.appendChild(card);
        });
    }

    if (sellAllBtn) {
        sellAllBtn.addEventListener("click", () => {
            if (playerState.inventory.length === 0) {
                SoundEngine.playError();
                showNotification(
                    "Inventory Empty",
                    "You have no ores to sell!",
                    "error"
                );
                return;
            }

            let totalEarned = 0;
            playerState.inventory.forEach(item => {
                // Calculate item price directly using your stored finalValue
                const itemPrice = Math.floor(
                    (item.finalValue || item.baseValue) *
                        playerState.sellMultiplier * playerState.rebirthMultiplier // <--- ADD THIS
                );
                totalEarned += itemPrice;
            });

            playerState.money += totalEarned;
            playerState.inventory = [];

            SoundEngine.playCoin();
            showNotification(
                "Ores Sold!",
                `Earned 🪙 ${formatMoney(totalEarned)} Coins!`,
                "sell",
                3000
            );

            saveGame();
            updateStatsUI();
            renderInventoryTray();
        });
    }

    // ==================== CORE MINING CALCULATOR ====================
    function mineCave(caveId, clickEvent) {
        const cave = cavesData.find(c => c.id === caveId);
        if (!cave) return;

        if (playerState.level < cave.requiredLevel) {
            SoundEngine.playError();
            showNotification(
                "🔒 Cavern Locked!",
                `You need to reach Level ${cave.requiredLevel} to mine here.`,
                "level-up",
                3000
            );
            return;
        }

        // Locate inside mineCave:
        let activeCost = cave.energyCost;
        if (playerState.buffs && playerState.buffs.vigor > 0) {
            activeCost = 0; // Infinite Energy Buff Active!
        } else if (playerState.buffs && playerState.buffs.rage > 0) {
            activeCost = Math.ceil(cave.energyCost / 2);
        }

        if (playerState.currentEnergy < activeCost) {
            SoundEngine.playError();
            showNotification(
                "⚡ Out of Energy!",
                "Eat some food or buy Stamina Brews from the Shop to restore energy.",
                "shop",
                3000
            );
            if (clickEvent)
                spawnFloatingText(
                    "No Energy! ⚡",
                    clickEvent.clientX,
                    clickEvent.clientY,
                    "float-red"
                );
            return;
        }
        if (playerState.inventory.length >= playerState.maxBagCapacity) {
            SoundEngine.playError();
            showNotification(
                "🎒 Bag Full!",
                "Click 'Sell All Ores' below to empty your inventory and earn coins.",
                "sell",
                3000
            );
            if (clickEvent)
                spawnFloatingText(
                    "Bag Full! 🎒",
                    clickEvent.clientX,
                    clickEvent.clientY,
                    "float-red"
                );
            return;
        }

        playerState.currentEnergy -= activeCost;

        const pool = cave.lootPool;
        let totalWeight = 0;

        if (!pool) {
            console.error(
                "Critical: Cave lootPool is undefined! Fallback executed."
            );
            return;
        }

        pool.forEach(ore => {
            let weight = rarityWeights[ore.rarity] || 1000;
            if (
                playerState.buffs &&
                playerState.buffs.luck > 0 &&
                ore.rarity !== "common"
            ) {
                weight *= 2;
            }
            totalWeight += weight;
        });

        const roll = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        let selectedOre = pool[0];

        for (let ore of pool) {
            let weight = rarityWeights[ore.rarity] || 1000;
            if (
                playerState.buffs &&
                playerState.buffs.luck > 0 &&
                ore.rarity !== "common"
            ) {
                weight *= 2;
            }
            cumulativeWeight += weight;
            if (roll <= cumulativeWeight) {
                selectedOre = ore;
                break;
            }
        }

        const rolledVar = rollWeightedSelection(variantsData);
        const weightFluctuation = (0.8 + Math.random() * 0.4);
        const weightMult = rollBonusWeight(clickEvent);
        const actualWeight = parseFloat(
            (weightMult + (selectedOre.baseWeight * weightFluctuation)).toFixed(2)
        );
        const subTotal = Math.floor(
            selectedOre.baseValue * rolledVar.multiplier * actualWeight
        );
        const rolledMut = rollWeightedSelection(mutationsData);
        const finalValue = Math.floor(subTotal * rolledMut.multiplier);

        const newOre = {
            id: selectedOre.name.toLowerCase().replace(/\s+/g, "-"),
            name: selectedOre.name,
            rarity: selectedOre.rarity,
            baseValue: selectedOre.baseValue,
            baseWeight: selectedOre.baseWeight,
            variant: rolledVar.name,
            variantMultiplier: rolledVar.multiplier,
            weightMultiplier: weightMult,
            actualWeight: actualWeight,
            subTotalValue: subTotal,
            mutation: rolledMut.name,
            mutationMultiplier: rolledMut.multiplier,
            finalValue: finalValue,
            icon: selectedOre.icon,
            isNew: true
        };

        playerState.inventory.push(newOre);
        
        console.log(newOre);

        // ==================== SECRET ACHIEVEMENTS TRIGGERS ====================
        // 1. Ethereal Gaze Secret Unlock (Mine an Ethereal mutation)
        if (rolledMut.id === "ethereal") {
            unlockCollectionItem("secret-ethereal");
        }

        // 2. Void Emperor Secret Unlock (Mine 'The Void Heart' from the Void Rift)
        if (selectedOre.name === "The Void Heart") {
            unlockCollectionItem("secret-void-emperor");
        }

        // ==================== NEW DYNAMIC MULTI-TIERED UNLOCKS ====================
        const isNormal = rolledVar.id === "normal" && rolledMut.id === "none";
        const hasVariantOnly =
            rolledVar.id !== "normal" && rolledMut.id === "none";
        const hasMutationOnly =
            rolledVar.id === "normal" && rolledMut.id !== "none";
        const isHybrid = rolledVar.id !== "normal" && rolledMut.id !== "none";

        const oreBaseId = selectedOre.name.toLowerCase().replace(/\s+/g, "-");
        let rolledCardId = `${oreBaseId}-normal`;

        // Determine rolled card tier ID
        if (hasVariantOnly) {
            rolledCardId = `${oreBaseId}-variant`;
        } else if (hasMutationOnly) {
            rolledCardId = `${oreBaseId}-mutation`;
        } else if (isHybrid) {
            rolledCardId = `${oreBaseId}-hybrid`;
        }

        // Programmatically unlock the dynamic progressive ore card inside your save dictionary
        if (!playerState.unlockedOres[rolledCardId]) {
            playerState.unlockedOres[rolledCardId] = true;

            showNotification(
                "🏆 Collection Unlocked!",
                `New card unlocked: <strong>${selectedOre.icon} ${selectedOre.name} (${isNormal ? "Common" : hasVariantOnly ? "Rare" : hasMutationOnly ? "Epic" : "Legendary"})</strong>!`,
                "collection",
                6000,
                {
                    label: "View Gallery",
                    callback: () => navigateToView("view-collections"),
                }
            );
            SoundEngine.playUnlock();

            // Fix: Re-render collections view to instantly display unlocked ores
            renderCollections();
        }

        if (cave.collectionId) unlockCollectionItem(cave.collectionId);
        if (rolledVar.collectionId)
            unlockCollectionItem(rolledVar.collectionId);
        if (rolledMut.collectionId)
            unlockCollectionItem(rolledMut.collectionId);

        // Also unlock the new separate Cave Collection card using the Cave's name
        if (cave.caveCollectionId) {
            unlockCollectionItem(cave.caveCollectionId);
        }

        totalMinesCount++;
        if (totalMinesCount >= 100) unlockCollectionItem("hard-worker");

        SoundEngine.playMine();

        if (clickEvent) {
            const x = clickEvent.clientX;
            const y = clickEvent.clientY;
            spawnFloatingText(`-${activeCost}⚡`, x - 30, y, "float-energy");
            spawnFloatingText(`+${cave.xpReward} XP`, x + 30, y, "float-xp");
            spawnFloatingText(
                `+ ${selectedOre.icon} ${rolledVar.name !== "Normal" ? rolledVar.name + " " : ""}${selectedOre.name.split(" ")[0]}`,
                x,
                y - 20,
                "float-ore"
            );

            spawnMineParticles(x, y, selectedOre.icon);
        }

        rollChestSpawn();
        awardXp(cave.xpReward);
        renderInventoryTray();
        saveGame();

        setTimeout(() => {
            if (inventoryScroll) {
                inventoryScroll.scrollTo({
                    left: inventoryScroll.scrollWidth,
                    behavior: "smooth"
                });
            }
        }, 100);

        setTimeout(() => {
            newOre.isNew = false;
            renderInventoryTray();
        }, 5000);
    }
    
    function rollBonusWeight(clickEvent) {
      // If they have the pass, roll for the 4x bonus
      if (playerState.hasWeightPass) {
        const roll = Math.random();
        if (roll <= 0.5) {
          const getBonusWeight = parseFloat((1 + Math.random() * 4).toFixed(1));
          spawnFloatingText( `+${getBonusWeight} Bonus Weight`, clickEvent.clientX, clickEvent.clientY + 30, "float-ore" );
          return getBonusWeight
        }
      }
      // CRITICAL: Always return 1.0 as a base multiplier so the math doesn't break
      return 1.0; 
    }

    // ==================== CAVE GRID RENDERER ====================
    function renderCaves() {
        if (!caveContainer) return;
        caveContainer.innerHTML = "";
        const startIndex = (currentMapPage - 1) * cavesPerPage;
        const endIndex = startIndex + cavesPerPage;

        for (let i = startIndex; i < endIndex; i++) {
            const box = document.createElement("div");
            if (i < cavesData.length) {
                const cave = cavesData[i];
                const isLocked = playerState.level < cave.requiredLevel;

                if (isLocked) {
                    box.className = "box disabled";
                    box.innerHTML = `<span class="box-title">Locked</span><span style="font-size:0.65rem; color:#bbb; z-index:2;">Lvl ${cave.requiredLevel} Req.</span>`;
                } else {
                    box.className = "box";
                    box.style.backgroundImage = `url('${cave.image}')`;
                    box.innerHTML = `<span class="box-title">${cave.name}</span><button class="box-btn" data-id="${cave.id}">Mine</button>`;

                    box.addEventListener("click", e => {
                        if (e.target.classList.contains("box-btn")) return;

                        SoundEngine.playClick();

                        const poolLength = cave.lootPool
                            ? cave.lootPool.length
                            : 1;

                        const stats = [
                            {
                                label: "Required Level",
                                value: `Lvl ${cave.requiredLevel}`
                            },
                            {
                                label: "Energy Cost",
                                value: `${cave.energyCost}⚡`
                            },
                            {
                                label: "Standard Ore Pool",
                                value: `${poolLength} Ores`
                            },
                            {
                                label: "XP Reward",
                                value: `+${cave.xpReward} XP`
                            }
                        ];
                        openDetailModal(
                            cave.name,
                            "🧗",
                            `A deep mining layer containing rich minerals. Mine here using your pickaxe to collect valuable raw ore samples.`,
                            stats
                        );
                    });
                }
            } else {
                box.className = "box disabled";
                box.innerHTML = `<span class="box-title">Coming Soon</span>`;
            }
            caveContainer.appendChild(box);
        }

        caveContainer.querySelectorAll(".box-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const caveId = parseInt(btn.getAttribute("data-id"));

                btn.disabled = true;
                btn.textContent = "Mining...";

                try {
                    mineCave(caveId, e);
                } catch (error) {
                    console.error("Mining logic execution failed: ", error);
                } finally {
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = "Mine";
                    }, 1000 / playerState.activePickaxeMultiplier);
                }
            });
        });
    }

    function getGridColumnsCount() {
        const w = window.innerWidth,
            h = window.innerHeight;
        return w <= 220 || h <= 380 ? 1 : w <= 330 || h <= 500 ? 2 : 3;
    }

    function updateMapPageStructure() {
        const cols = getGridColumnsCount();
        cavesPerPage = cols === 3 ? 9 : cols === 2 ? 4 : 1;
        maxMapPages = Math.ceil(cavesData.length / cavesPerPage);

        if (currentMapPage > maxMapPages) currentMapPage = maxMapPages;
        if (mapPageLabel)
            mapPageLabel.textContent = `Map ${currentMapPage} / ${maxMapPages}`;
        if (prevMapBtn && nextMapBtn) {
            prevMapBtn.disabled = currentMapPage === 1;
            nextMapBtn.disabled = currentMapPage === maxMapPages;
        }
        renderCaves();
    }

    if (prevMapBtn && nextMapBtn) {
        prevMapBtn.addEventListener("click", () => {
            if (currentMapPage > 1) {
                currentMapPage--;
                updateMapPageStructure();
            }
        });
        nextMapBtn.addEventListener("click", () => {
            if (currentMapPage < maxMapPages) {
                currentMapPage++;
                updateMapPageStructure();
            }
        });
    }

    // ==================== SHOP DYNAMIC RENDERER ====================
    function renderShopSubSection(parent, title, subCat, gridClass, cardClass) {
        try {
            const header = document.createElement("h4");
            header.className = "sub-section-header";
            header.textContent = title;
            parent.appendChild(header);

            const scroll = document.createElement("div");
            scroll.className = "scroll-container";
            const grid = document.createElement("div");
            grid.className = gridClass;

            const filteredItems = shopData.filter(i => i.category === subCat);
            if (filteredItems.length === 0) {
                console.warn(
                    `No shop items found matching category: ${subCat}`
                );
            }

            filteredItems.forEach(item => {
                try {
                    const card = document.createElement("div");
                    card.className = cardClass;
                    const isNewItem =
                        item.releaseDate &&
                        Date.now() - Date.parse(item.releaseDate) <
                            3 * 24 * 60 * 60 * 1000;
                    const isNewVersion = item.versionAdded === GAME_VERSION;
                    const showNew = isNewItem || isNewVersion;

                    const premiumCategories = [
                        "money-perks",
                        "packs",
                        "subscriptions",
                        "passes"
                    ];
                    const isPremium = premiumCategories.includes(item.category);
                    const currencyIcon = isPremium ? "🎟️" : "🪙";

                    // Check ownership and sequence constraints
                    const isOwned = isShopItemOwned(item);
                    const canBuy = canBuyShopItem(item);

                    // Locate inside renderShopSubSection:
                    let buttonHtml = "";
                    if (isOwned) {
                        buttonHtml = `<button class="wider-card-btn" style="background-color: #1f2937; color: #4b5563; border-color: #374151; pointer-events: none; cursor: default;">✓ OWNED</button>`;
                    } else if (!canBuy) {
                        buttonHtml = `<button class="wider-card-btn" style="background-color: #111827; color: #4b5563; border-color: #1f2937; pointer-events: none; cursor: default;">🔒 LOCKED</button>`;
                    } else {
                        // ADDED: pass true to formatMoney for compact display on buttons (e.g. 🎟️ 10)
                        buttonHtml = `<button class="wider-card-btn" data-id="${item.id}">${currencyIcon} ${formatMoney(item.cost, true)}</button>`;
                    }

                    // FIXED: Ensuring innerHTML is written with capital HTML torender properly
                    card.innerHTML = `
                        ${showNew ? '<span class="new-badge">New</span>' : ""}
                        <div class="rounded-image-icon">${item.icon || "📦"}</div>
                        <span class="wider-card-name">${item.name || "Unknown Upgrade"}</span>
                        <p class="wider-card-desc">${item.desc || "No description available."}</p>
                        ${buttonHtml}`;
                    grid.appendChild(card);
                } catch (itemError) {
                    console.error(
                        "Error rendering individual shop item card:",
                        itemError,
                        item
                    );
                }
            });
            scroll.appendChild(grid);
            parent.appendChild(scroll);
        } catch (sectionError) {
            console.error(
                "Error rendering shop sub-section grid:",
                sectionError,
                subCat
            );
        }
    }

    // ==================== SHOP PREVIEW MODAL SYSTEM ====================
    function openShopItemDetailModal(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        SoundEngine.playClick();

        const premiumCategories = [
            "money-perks",
            "packs",
            "subscriptions",
            "passes"
        ];
        const isPremium = premiumCategories.includes(item.category);
        const currencyIcon = isPremium ? "🎟️" : "🪙";

        // Human-readable subtitles for upgrade items
        const categoryLabels = {
            "mining-speed": "⚙️ Mining Speed Upgrade",
            "bag-capacity": "🎒 Bag Capacity Expansion",
            energy: "🍏 Energy Food & Potions",
            boosts: "🧪 Temporary Buff Potion",
            "money-perks": "📛 Passive Sell Badge",
            packs: "🎁 Premium Bundle Pack",
            subscriptions: "📅 Passive Income Subscription",
            passes: "🎫 Seasonal Passive Multiplier"
        };

        const stats = [
            {
                label: "Item Category",
                value:
                    categoryLabels[item.category] || item.category.toUpperCase()
            },
            {
                label: "Upgrade Cost",
                value: `${currencyIcon} ${formatMoney(item.cost)}`
            }
        ];

        // Safely extract relevant stats based on item properties
        if (item.category === "mining-speed" && item.multiplier) {
            stats.push({
                label: "Mining Multiplier",
                value: `x${item.multiplier.toFixed(2)}`
            });
        } else if (item.category === "bag-capacity" && item.capacity) {
            stats.push({
                label: "Bag Capacity",
                value: `${item.capacity} slots`
            });
        } else if (item.category === "energy" && item.energy) {
            stats.push({
                label: "Energy Restored",
                value: `+${item.energy}⚡`
            });
        } else if (item.category === "money-perks" && item.multiplier) {
            stats.push({
                label: "Gold Earnings Bonus",
                value: `+${Math.round((item.multiplier - 1) * 100)}% extra gold`
            });
        } else if (item.category === "boosts" && item.buffType) {
            const buffNames = {
                luck: "Double Gem Roll Rate",
                rage: "50% Less Mining Energy Cost",
                xpBoost: "Double XP Multiplier"
            };
            stats.push({
                label: "Active Effect",
                value: buffNames[item.buffType] || item.buffType
            });
            stats.push({
                label: "Effect Duration",
                value: `${item.buffDuration} seconds`
            });
        }

        if (item.versionAdded) {
            stats.push({
                label: "Release Version",
                value: `v${item.versionAdded}`
            });
        }

        // Build purchase trigger within the modal action button
        const purchaseAction = {
            label: `CONFIRM PURCHASE (${currencyIcon} ${formatMoney(item.cost)})`,
            callback: () => {
                buyShopItem(itemId);
            }
        };

        openDetailModal(
            item.name,
            item.icon || "🛒",
            item.desc || "An essential tool/upgrade for cavern deep explorers.",
            stats,
            purchaseAction
        );
    }

    function renderShop() {
        if (!shopSectionsList) return;
        shopSectionsList.innerHTML = "";
        const categories = {
            "mining-speed": "⚡ Mining Speed",
            "bag-capacity": "🎒 Bag Capacity",
            energy: "🔋 Energy Upgrades",
            boosts: "🧪 Boosts & Potions",
            "money-perks": "🪙 Money Perks"
        };

        Object.keys(categories).forEach(catKey => {
            const section = document.createElement("section");
            section.className = "shop-section";
            section.setAttribute("data-category", catKey);
            section.innerHTML = `<h3 class="section-header">${categories[catKey]}</h3>`;

            if (catKey !== "money-perks") {
                const scroll = document.createElement("div");
                scroll.className = "scroll-container";
                const grid = document.createElement("div");
                grid.className = "portrait-grid";

                shopData
                    .filter(i => i.category === catKey)
                    .forEach(item => {
                        try {
                            const card = document.createElement("div");
                            card.className = "portrait-card";

                            const isNewItem =
                                item.releaseDate &&
                                Date.now() - Date.parse(item.releaseDate) <
                                    3 * 24 * 60 * 60 * 1000;
                            const isNewVersion =
                                item.versionAdded === GAME_VERSION;
                            const showNew = isNewItem || isNewVersion;

                            const isOwned = isShopItemOwned(item);
                            const canBuy = canBuyShopItem(item);

                            // Locate inside renderShop (under catKey !== "money-perks" loop):
                            let buttonHtml = "";
                            if (isOwned) {
                                buttonHtml = `<button class="card-buy-btn" style="background-color: #1f2937; color: #4b5563; border-color: #374151; pointer-events: none; cursor: default;">✓ OWNED</button>`;
                            } else if (!canBuy) {
                                buttonHtml = `<button class="card-buy-btn" style="background-color: #111827; color: #4b5563; border-color: #1f2937; pointer-events: none; cursor: default;">🔒 LOCKED</button>`;
                            } else {
                                // ADDED: pass true to formatMoney for compact display on buttons (e.g. 🪙 1.8M)
                                buttonHtml = `<button class="card-buy-btn" data-id="${item.id}">🪙 ${formatMoney(item.cost, true)}</button>`;
                            }

                            // FIXED: Ensuring innerHTML is written with capital HTML to render properly
                            card.innerHTML = `
                            ${showNew ? '<span class="new-badge">New</span>' : ""}
                            <div class="circle-icon">${item.icon || "🛠️"}</div>
                            <span class="card-name">${item.name || "Upgrade"}</span>
                            <p class="card-desc">${item.desc || "No description available."}</p>
                            ${buttonHtml}
                        `;
                            grid.appendChild(card);
                        } catch (itemError) {
                            console.error(
                                "Error rendering standard shop card:",
                                itemError,
                                item
                            );
                        }
                    });
                scroll.appendChild(grid);
                section.appendChild(scroll);
            } else {
                // Upgrades, Bundles, and Subscriptions rendering
                renderShopSubSection(
                    section,
                    "📛 Upgrades & Badges",
                    "money-perks",
                    "wider-grid",
                    "wider-card"
                );
                renderShopSubSection(
                    section,
                    "🎁 Bundles & Packs",
                    "packs",
                    "wider-grid",
                    "wider-card"
                );
                renderShopSubSection(
                    section,
                    "📅 Subscriptions",
                    "subscriptions",
                    "wider-grid",
                    "wider-card"
                );

                // Safe passes rendering block
                try {
                    const passHeader = document.createElement("h4");
                    passHeader.className = "sub-section-header";
                    passHeader.textContent = "🎫 Season Passes";
                    section.appendChild(passHeader);

                    const passesList = document.createElement("div");
                    passesList.className = "passes-list";

                    shopData
                        .filter(i => i.category === "passes")
                        .forEach(pass => {
                            try {
                                const card = document.createElement("div");
                                card.className = "pass-card";
                                const isBought =
                                    pass.id === "double-xp-pass" && playerState.xpMultiplier >= 2.0
                                    ||
                                    pass.id === "twice-weight-pass" && playerState.hasWeightPass
                                card.setAttribute(
                                    "data-bought",
                                    isBought ? "true" : "false"
                                );

                                card.innerHTML = `
                                <div class="pass-header">
                                    <span class="pass-card-title">${pass.icon} ${pass.name}</span>
                                    <div class="pass-controls">
                                        ${isBought ? '<span class="owned-badge">Owned</span>' : '<button class="pass-header-buy-btn" data-id="' + pass.id + '">🎟️ ' + pass.cost + "</button>"}
                                        <button class="pass-toggle-btn">▼</button>
                                    </div>
                                </div>
                                <div class="pass-content">
                                    <div class="pass-rewards-placeholder">
                                        <h5>🌟 Benefit Details</h5>
                                        <p>${pass.desc}</p>
                                    </div>
                                    ${isBought ? '<div class="pass-owned-placeholder">✓ Already Owned & Active</div>' : '<button class="pass-content-buy-btn" data-id="' + pass.id + '">🎟️ Buy Pass (' + pass.cost + ")</button>"}
                                </div>`;

                                const toggleBtn =
                                    card.querySelector(".pass-toggle-btn");
                                if (toggleBtn) {
                                    toggleBtn.addEventListener("click", e => {
                                        e.stopPropagation();
                                        card.classList.toggle("expanded");
                                    });
                                }
                                passesList.appendChild(card);
                            } catch (passError) {
                                console.error(
                                    "Error rendering pass card:",
                                    passError,
                                    pass
                                );
                            }
                        });
                    section.appendChild(passesList);
                } catch (passesSectionError) {
                    console.error(
                        "Error rendering passes sub-section:",
                        passesSectionError
                    );
                }
            }
            shopSectionsList.appendChild(section);
        });

        shopSectionsList
            .querySelectorAll(
                ".card-buy-btn, .wider-card-btn, .pass-header-buy-btn, .pass-content-buy-btn"
            )
            .forEach(btn => {
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    openShopItemDetailModal(btn.getAttribute("data-id"));
                });
            });
    }

    function buyShopItem(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        // 1. Ownership and Sequence Safety Guards
        if (isShopItemOwned(item)) {
            SoundEngine.playError();
            showNotification(
                "Upgrade Active",
                "You already own this upgrade!",
                "error"
            );
            return;
        }

        if (!canBuyShopItem(item)) {
            SoundEngine.playError();
            showNotification(
                "Locked Upgrade",
                `You must purchase the previous upgrades in this category first!`,
                "error",
                4000
            );
            return;
        }

        const premiumCategories = [
            "money-perks",
            "packs",
            "subscriptions",
            "passes"
        ];
        const isPremium = premiumCategories.includes(item.category);

        // 2. Currency Validation (Simplifies back to standard item.cost checks)
        if (isPremium) {
            if (playerState.tokens < item.cost) {
                SoundEngine.playError();
                showNotification(
                    "🎟️ Insufficient Tokens!",
                    `You need 🎟️ ${item.cost} Tokens to purchase ${item.name}. Convert some Coins first!`,
                    "sell",
                    4000
                );
                return;
            }
            playerState.tokens -= item.cost;
        } else {
            if (playerState.money < item.cost) {
                SoundEngine.playError();
                showNotification(
                    "🪙 Insufficient Coins!",
                    `You need 🪙 ${formatMoney(item.cost)} to purchase ${item.name}.`,
                    "sell",
                    4000
                );
                return;
            }
            playerState.money -= item.cost;
        }

        if (item.collectionId) {
            unlockCollectionItem(item.collectionId);
        }

        // Programmatic dynamic Buff Engine upgrade triggers
        if (item.category === "boosts" && item.buffType && item.buffDuration) {
            playerState.buffs[item.buffType] = item.buffDuration;
        }

        // 3. Apply Upgrades & Premium Rewards
        if (item.category === "mining-speed") {
            playerState.activePickaxeMultiplier = item.multiplier;
        } else if (item.category === "bag-capacity") {
            playerState.maxBagCapacity = item.capacity;
        } else if (item.category === "energy") {
            // OPTION 1: Direct accumulation allows energy to overflow beyond maxEnergy (no limits, no waste!)
            playerState.currentEnergy += item.energy;

            // 3. Infinite Overcharge Secret Unlock (Current energy exceeds 500% max energy)
            if (playerState.currentEnergy >= playerState.maxEnergy * 5) {
                unlockCollectionItem("secret-overcharge");
            }
        } else if (item.category === "money-perks") {
            if (item.id === "magnet-badge") {
                playerState.hasMagnet = true;
            } else {
                playerState.sellMultiplier = Math.max(
                    playerState.sellMultiplier,
                    item.multiplier
                );
            }
        } else if (item.category === "packs") {
            if (item.id === "starter-bundle") {
                playerState.hasStarterBundle = true;
                playerState.money += 500;
                playerState.currentEnergy = Math.min(
                    playerState.maxEnergy,
                    playerState.currentEnergy + 50
                );
            } else if (item.id === "miner-pack") {
                playerState.hasMinerPack = true;
                playerState.money += 2000;
                playerState.currentEnergy = Math.min(
                    playerState.maxEnergy,
                    playerState.currentEnergy + 100
                );
            }
        } else if (item.category === "subscriptions") {
            if (item.id === "coin-subscription") {
                playerState.hasCoinSub = true;
            } else if (item.id === "token-subscription") {
                playerState.hasTokenSub = true;
            }
        } else if (item.category === "passes") {
            if (item.id === "double-xp-pass") {
                playerState.xpMultiplier = 2.0;
            } else if (item.id === "twice-weight-pass") {
                playerState.hasWeightPass = true
            }
        }

        SoundEngine.playCoin();

        // Dynamically tailor the notification text based on the purchased item's category
        let notificationText = `Successfully obtained ${item.name}! Applied active stat adjustments.`;
        const currencyIcon = isPremium ? "🎟️" : "🪙";

        if (item.category === "energy") {
            notificationText = `Successfully obtained ${item.name}! Paid 🪙 ${formatMoney(item.cost)} Coins to restore +${item.energy}⚡ energy.`;
        } else if (item.category === "packs") {
            notificationText = `Successfully opened ${item.name}! Resource bundles have been successfully claimed.`;
        } else if (
            item.category === "subscriptions" ||
            item.category === "passes"
        ) {
            notificationText = `Successfully activated ${item.name}! Passive accounts adjustments are now active.`;
        } else {
            notificationText = `Successfully obtained ${item.name}! Paid ${currencyIcon} ${formatMoney(item.cost)} for the upgrade.`;
        }

        showNotification("🛒 Item Purchased!", notificationText, "shop", 4000);

        saveGame();
        updateStatsUI();
        renderShop();
        renderBuffsUI();
        updateMapPageStructure();
    }

    // ==================== COLLECTIONS RENDERER ====================
    function renderColSubSection(parent, title, subCat) {
        const header = document.createElement("h4");
        header.className = "col-sub-header";
        header.textContent = title;
        parent.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "col-grid";

        collectionsData
            .filter(c => c.category === "awards" && c.subCategory === subCat)
            .forEach(item => {
                grid.appendChild(createColCard(item));
            });
        parent.appendChild(grid);
    }

    // Unified dynamic Collection Card builder
    function createColCard(item) {
        const card = document.createElement("div");
        card.className = "col-card";
        card.innerHTML = `
            ${item.isNew ? '<span class="new-badge">New</span>' : ""}
            <div class="col-icon-circle">${item.obtained ? item.icon : "❓"}</div>
            <h4 class="col-card-title">${item.obtained ? item.name : "Unknown"}</h4>
            <p class="col-card-desc">${item.obtained ? item.desc : "Keep mining layers to unlock details."}</p>
            <button class="col-read-more" ${item.obtained ? "" : "disabled"}>Read more</button>`;

        if (item.obtained) {
            const readMoreBtn = card.querySelector(".col-read-more");
            readMoreBtn.addEventListener("click", e => {
                e.stopPropagation();
                SoundEngine.playClick();

                // Base categories stats
                const stats = [
                    { label: "Category", value: item.category.toUpperCase() }
                ];
                if (item.subCategory) {
                    stats.push({
                        label: "Sub-Type",
                        value: item.subCategory.toUpperCase()
                    });
                }

                // Achievement tier
                if (item.tier) {
                    stats.push({ label: "Achievement Tier", value: item.tier });
                }

                // DYNAMIC LOOKUP (FIXED): Map card index to matching cavesData index
                if (item.category === "caves") {
                    const caveCards = collectionsData.filter(
                        c => c.category === "caves"
                    );
                    const cardIndex = caveCards.findIndex(
                        c => c.id === item.id
                    );
                    if (cardIndex !== -1) {
                        const foundCave = cavesData[cardIndex];
                        if (foundCave) {
                            stats.push({
                                label: "Required Level",
                                value: `Lvl ${foundCave.requiredLevel}`
                            });
                            stats.push({
                                label: "Mining Energy Cost",
                                value: `${foundCave.energyCost}⚡`
                            });
                            stats.push({
                                label: "XP Awarded",
                                value: `+${foundCave.xpReward} XP`
                            });
                            if (foundCave.lootPool) {
                                stats.push({
                                    label: "Discoverable Ores",
                                    value: `${foundCave.lootPool.length} Species`
                                });
                            }
                        }
                    }
                }

                // DYNAMIC LOOKUP (FIXED): Strip the "-col" suffix to match mutationsData ID
                if (item.category === "mutations") {
                    const cleanMutationId = item.id.replace("-col", "");
                    const foundMutation = mutationsData.find(
                        m => m.id === cleanMutationId
                    );
                    if (foundMutation) {
                        stats.push({
                            label: "Rarity Multiplier",
                            value: `x${foundMutation.multiplier.toFixed(1)}`
                        });
                        stats.push({
                            label: "Roll Spawn Rate",
                            value: `${(foundMutation.pr * 100).toFixed(3)}%`
                        });
                    }
                }

                // If the data object has a multiplier (for Badges), show it!
                if (
                    item.multiplier &&
                    item.category !== "mutations" &&
                    item.category !== "caves"
                ) {
                    stats.push({
                        label: "Final Multiplier",
                        value: item.multiplier
                    });
                }

                // If the data object has a speed bonus, show it!
                if (item.speedBonus) {
                    stats.push({
                        label: "Mining Efficiency",
                        value: item.speedBonus
                    });
                }

                openDetailModal(item.name, item.icon, item.desc, stats);
            });
        }

        return card;
    }

    function renderCollections() {
        if (!colSectionsList) return;
        colSectionsList.innerHTML = "";

        try {
            const categories = {
                caves: "🧗 Caves Discovery",
                pickaxes: "⛏️ Pickaxes",
                ores: "🪨 Ores Tiers",
                mutations: "⚛️ Mutations",
                awards: "🏆 Awards"
            };

            Object.keys(categories).forEach(catKey => {
                const section = document.createElement("section");
                section.className = "col-section";
                section.setAttribute("data-category", catKey);
                section.innerHTML = `<h3 class="col-section-header">${categories[catKey]}</h3>`;

                if (catKey !== "awards" && catKey !== "ores") {
                    const grid = document.createElement("div");
                    grid.className = "col-grid";
                    collectionsData
                        .filter(c => c.category === catKey)
                        .forEach(item => {
                            grid.appendChild(createColCard(item));
                        });
                    section.appendChild(grid);
                } else if (catKey === "ores") {
                    // Programmatically generate 320 cards based on our cave loot pools!
                    cavesData.forEach(cave => {
                        try {
                            const subHeader = document.createElement("h4");
                            subHeader.className = "col-sub-header";
                            subHeader.textContent = `🪨 ${cave.name} Ores`;
                            section.appendChild(subHeader);

                            const grid = document.createElement("div");
                            grid.className = "col-grid";

                            if (cave.lootPool) {
                                cave.lootPool.forEach(ore => {
                                    try {
                                        const oreBaseId = ore.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-");
                                        const tiers = [
                                            {
                                                id: `${oreBaseId}-normal`,
                                                suffix: "Normal",
                                                tierLabel: "Common",
                                                desc: `Standard unrefined ${ore.name} sample.`
                                            },
                                            {
                                                id: `${oreBaseId}-variant`,
                                                suffix: "Variant (Rare)",
                                                tierLabel: "Rare",
                                                desc: `High density polished ${ore.name} variant.`
                                            },
                                            {
                                                id: `${oreBaseId}-mutation`,
                                                suffix: "Mutated (Epic)",
                                                tierLabel: "Epic",
                                                desc: `${ore.name} sample displaying high energetic spore/toxic mutations.`
                                            },
                                            {
                                                id: `${oreBaseId}-hybrid`,
                                                suffix: "Hybrid (Legendary)",
                                                tierLabel: "Legendary",
                                                desc: `Legendary combination drop: variant mutated ${ore.name}!`
                                            }
                                        ];

                                        tiers.forEach(tier => {
                                            const isObtained =
                                                playerState.unlockedOres &&
                                                playerState.unlockedOres[
                                                    tier.id
                                                ] === true;
                                            const card =
                                                document.createElement("div");
                                            card.className = "col-card";
                                            card.innerHTML = `
                                                <div class="col-icon-circle">${isObtained ? ore.icon : "❓"}</div>
                                                <h4 class="col-card-title">${isObtained ? ore.name + " - " + tier.suffix : "Unknown"}</h4>
                                                <p class="col-card-desc">${isObtained ? tier.desc : "Mine in " + cave.name + " to unlock details."}</p>
                                                <button class="col-read-more" ${isObtained ? "" : "disabled"}>Read more</button>
                                            `;

                                            if (isObtained) {
                                                const readBtn =
                                                    card.querySelector(
                                                        ".col-read-more"
                                                    );
                                                if (readBtn) {
                                                    readBtn.addEventListener(
                                                        "click",
                                                        e => {
                                                            e.stopPropagation();
                                                            SoundEngine.playClick();
                                                            const stats = [
                                                                {
                                                                    label: "Cavern",
                                                                    value: cave.name
                                                                },
                                                                {
                                                                    label: "Rarity Tier",
                                                                    value: ore.rarity.toUpperCase()
                                                                },
                                                                {
                                                                    label: "Card Grade",
                                                                    value: tier.tierLabel.toUpperCase()
                                                                },
                                                                {
                                                                    label: "Base Weight",
                                                                    value: `${ore.baseWeight} kg`
                                                                },
                                                                {
                                                                    label: "Base Value",
                                                                    value: `🪙 ${ore.baseValue}`
                                                                }
                                                            ];
                                                            openDetailModal(
                                                                `${ore.name} (${tier.suffix})`,
                                                                ore.icon,
                                                                tier.desc,
                                                                stats
                                                            );
                                                        }
                                                    );
                                                }
                                            }
                                            grid.appendChild(card);
                                        });
                                    } catch (oreError) {
                                        console.error(
                                            "Error rendering ore tier card:",
                                            oreError,
                                            ore
                                        );
                                    }
                                });
                            }
                            section.appendChild(grid);
                        } catch (caveError) {
                            console.error(
                                "Error rendering cave collections:",
                                caveError,
                                cave
                            );
                        }
                    });
                } else {
                    renderColSubSection(
                        section,
                        "🏆 Trophies (Quest Chests)",
                        "trophies"
                    );
                    renderColSubSection(
                        section,
                        "🏷️ Badges (Quest Tasks)",
                        "badges"
                    );
                }
                colSectionsList.appendChild(section);
            });
        } catch (globalError) {
            console.error("Error rendering collections view:", globalError);
        }
    }

    function unlockCollectionItem(itemId) {
        const item = collectionsData.find(c => c.id === itemId);
        if (item && !item.obtained) {
            item.obtained = true;
            item.isNew = true;

            SoundEngine.playUnlock();

            showNotification(
                "🏆 Collection Unlocked!",
                `New entry unlocked: ${item.name}! Check your gallery details.`,
                "collection",
                6000,
                {
                    label: "View Gallery",
                    callback: () => navigateToView("view-collections")
                }
            );

            renderCollections();
            saveGame();

            setTimeout(() => {
                item.isNew = false;
                renderCollections();
            }, 6000);
        }
    }

    // ==================== UNIFIED DATA-DRIVEN ACHIEVEMENT ENGINE ====================
    function checkAchievements() {
        collectionsData.forEach(item => {
            if (
                item.category === "awards" &&
                !item.obtained &&
                item.conditionType
            ) {
                let isEligible = false;
                if (
                    item.conditionType === "level" &&
                    playerState.level >= item.conditionValue
                )
                    isEligible = true;
                else if (
                    item.conditionType === "mines" &&
                    totalMinesCount >= item.conditionValue
                )
                    isEligible = true;
                else if (
                    item.conditionType === "money" &&
                    playerState.money >= item.conditionValue
                )
                    isEligible = true;
                if (isEligible) unlockCollectionItem(item.id);
            }
        });
    }

    // ==================== SEARCH/FILTER SYSTEM ====================
    function filterShopItems() {
        const q = shopSearchInput.value.toLowerCase().trim();
        const cat = shopSectionFilter.value;

        shopSectionsList.querySelectorAll(".shop-section").forEach(sec => {
            const secCat = sec.getAttribute("data-category");
            const matchCat = cat === "all" || secCat === cat;
            const cards = sec.querySelectorAll(
                ".portrait-card, .wider-card, .pass-card"
            );
            let visibleCount = 0;

            cards.forEach(card => {
                const nameEl = card.querySelector(
                    ".card-name, .wider-card-name, .pass-card-title"
                );
                const nameText = nameEl ? nameEl.textContent.toLowerCase() : "";
                const matchSearch = nameText.includes(q);

                card.style.display = matchSearch ? "" : "none";
                if (matchSearch) visibleCount++;
            });
            sec.style.display = matchCat && visibleCount > 0 ? "" : "none";
        });
    }

    function filterCollectionItems() {
        const q = colSearchInput.value.toLowerCase().trim(),
            cat = colSectionFilter.value;
        colSectionsList.querySelectorAll(".col-section").forEach(sec => {
            const secCat = sec.getAttribute("data-category"),
                matchCat = cat === "all" || secCat === cat;
            const cards = sec.querySelectorAll(".col-card");
            let visibleCount = 0;

            cards.forEach(card => {
                const titleEl = card.querySelector(".col-card-title"),
                    titleText = titleEl
                        ? titleEl.textContent.toLowerCase()
                        : "";
                const matchSearch = titleText.includes(q);
                card.style.display = matchSearch ? "" : "none";
                if (matchSearch) visibleCount++;
            });
            sec.style.display = matchCat && visibleCount > 0 ? "" : "none";
        });
    }

    if (shopSearchInput && shopSectionFilter) {
        shopSearchInput.addEventListener("input", filterShopItems);
        shopSectionFilter.addEventListener("change", filterShopItems);
    }

    if (colSearchInput && colSectionFilter) {
        colSearchInput.addEventListener("input", filterCollectionItems);
        colSectionFilter.addEventListener("change", filterCollectionItems);
    }

    // ==================== TAB SWITCHER & TOGGLES ====================

    // Set initial view visibility inline to prevent stylesheet timing issues
    gameViews.forEach(view => {
        if (view.classList.contains("active")) {
            view.style.display = "flex";
        } else {
            view.style.display = "none";
        }
    });

    // Tab switcher with absolute inline-style display overrides & dynamic re-rendering
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation(); // Safe click propagation lock
            SoundEngine.playClick();

            // Toggle active styling on navigation list options
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");

            // Force hide all viewport wrappers to prevent display conflicts
            gameViews.forEach(view => {
                view.classList.remove("active");
                view.style.display = "none"; // Overrides CSS caching bugs
            });

            // Force display active viewport
            const targetId = link.getAttribute("data-view");
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add("active");
                targetView.style.display = "flex"; // Overrides CSS caching bugs

                // Re-render target views dynamically on click so stats are always up to date
                if (targetId === "view-readme") loadReadmeFile();
                if (targetId === "view-shop") renderShop();
                if (targetId === "view-collections") renderCollections();
                if (targetId === "view-marketplace") renderMarketplace(); // <-- INSERT THIS
                if (targetId === "view-leaderboard") renderLeaderboard();
            }

            // Auto-close sidebar on mobile viewports
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.remove("open");
            }
        });
    });

    if (userProfile) {
        userProfile.addEventListener("click", e => {
            e.stopPropagation(); // Prevents clicks on the profile from closing the menu immediately
            userProfile.classList.toggle("active");
        });
    }

    window.addEventListener("click", () => {
        if (userProfile && userProfile.classList.contains("active")) {
            userProfile.classList.remove("active");
        }
    });

    // 1. Account Dropdown Option (Displays real-time stats & Cloud linkages)
    if (dropdownAccount) {
        dropdownAccount.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            SoundEngine.playClick();

            const stats = [
                { label: "Level Progress", value: `Lvl ${playerState.level}` },
                {
                    label: "Gold Coins",
                    value: `🪙 ${formatMoney(playerState.money)}`
                },
                {
                    label: "Active Save Mode",
                    value:
                        playerState.saveMode === "cloud"
                            ? "☁️ Cloud Synced"
                            : "🔌 Offline Guest"
                },
                {
                    label: "Mining Efficiency",
                    value: `${playerState.activePickaxeMultiplier}x`
                }
            ];

            // If player is a Guest, provide an action button to open the Auth Modal and Link Account
            let customAction = null;
            if (playerState.saveMode !== "cloud") {
                customAction = {
                    label: "🚀 SYNC PROGRESS ONLINE",
                    callback: () => {
                        authModal.classList.add("active");
                    }
                };
            }

            openDetailModal(
                "Miner Profile",
                "👤",
                `Cavern records and operational statistics for ${playerState.username ? playerState.username : "Miner Joe"}.`,
                stats,
                customAction
            );
        });
    }

    if (dropdownSettings) {
        dropdownSettings.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            playerState.soundsMuted = !playerState.soundsMuted;

            // Correctly toggling between the Solid Font Awesome volume icons
            dropdownSettings.innerHTML = playerState.soundsMuted
                ? `<i class="fa-solid fa-volume-xmark fa-fw"></i> Unmute Sounds`
                : `<i class="fa-solid fa-volume-high fa-fw"></i> Mute Sounds`;

            showNotification(
                playerState.soundsMuted
                    ? "🔈 Caverns Silenced"
                    : "🔊 Caverns Active",
                playerState.soundsMuted
                    ? "All sound effects are now muted."
                    : "Cavern sound effects are now active!",
                "shop",
                3000
            );

            saveGame();
            SoundEngine.playClick();
        });
    }

    // 3. Sign Out Dropdown Handler (FIXED for Single Click)
    if (dropdownSignOut) {
        dropdownSignOut.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation(); // Stops the event from reaching the userProfile toggle

            // Force close the profile dropdown UI immediately
            if (userProfile) userProfile.classList.remove("active");

            SoundEngine.playError();

            const descText =
                playerState.saveMode === "cloud"
                    ? "Are you sure you want to sign out? Your progress is securely backed up in the cloud, and you can access it again anytime."
                    : "<strong>WARNING:</strong> You are playing as a Guest. Signing out will permanently delete your offline Coins, levels, and inventory!";

            openDetailModal("Sign Out / Reset?", "🚪", descText, [], {
                label: "CONFIRM SIGN OUT",
                callback: () => {
                    // Clear local storage first to ensure a clean slate on reload
                    localStorage.removeItem("miner_save");
                    localStorage.removeItem("miner_col_save");

                    if (firebaseActive && playerState.saveMode === "cloud") {
                        auth.signOut()
                            .then(() => {
                                window.location.reload();
                            })
                            .catch(err => {
                                console.error("Sign out error:", err);
                                window.location.reload(); // Reload anyway to reset state
                            });
                    } else {
                        window.location.reload();
                    }
                }
            });
        });
    }

    // ==================== COIN TO TOKEN CONVERSION CONTROLLER ====================
    const convertOneBtn = document.getElementById("convertOneBtn");
    const convertAllBtn = document.getElementById("convertAllBtn"); // <-- Updated Selector

    // Token Exchange Rate Constant (1 Token = 10,000 Gold Coins)
    const TOKEN_EXCHANGE_RATE = 10000;

    if (convertOneBtn) {
        convertOneBtn.addEventListener("click", () => {
            if (playerState.money >= TOKEN_EXCHANGE_RATE) {
                playerState.money -= TOKEN_EXCHANGE_RATE;
                playerState.tokens += 1;
                SoundEngine.playCoin();
                showNotification(
                    "Exchange Successful!",
                    `Converted 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins into 🎟️ 1 Premium Token!`,
                    "shop",
                    3000
                );
                saveGame();
                updateStatsUI();
                renderShop();
            } else {
                SoundEngine.playError();
                showNotification(
                    "Insufficient Coins!",
                    `You need 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins to convert 1 Token.`,
                    "sell",
                    3000
                );
            }
        });
    }

    if (convertAllBtn) {
        convertAllBtn.addEventListener("click", () => {
            // Calculate how many tokens the player can buy with their entire balance
            const tokensToBuy = Math.floor(
                playerState.money / TOKEN_EXCHANGE_RATE
            );

            if (tokensToBuy > 0) {
                const totalCost = tokensToBuy * TOKEN_EXCHANGE_RATE;
                playerState.money -= totalCost;
                playerState.tokens += tokensToBuy;
                SoundEngine.playCoin();
                showNotification(
                    "Exchange Successful!",
                    `Converted 🪙 ${formatMoney(totalCost)} Coins into 🎟️ ${tokensToBuy} Premium Tokens!`,
                    "shop",
                    3000
                );
                saveGame();
                updateStatsUI();
                renderShop();
            } else {
                SoundEngine.playError();
                showNotification(
                    "Insufficient Coins!",
                    `You need at least 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins to exchange for a Token.`,
                    "sell",
                    3000
                );
            }
        });
    }

    // ==================== SEQUENTIAL TUTORIAL ENGINE (NEW USER) ====================
    function startTutorial() {
        // Step 1: Welcome & Mining
        const step1Action = {
            label: "Next Step: Inventory",
            callback: () => {
                // Step 2: Selling & Bag Management
                const step2Action = {
                    label: "Next Step: Upgrades",
                    callback: () => {
                        // Step 3: Shop & Currencies
                        const step3Action = {
                            label: "Next Step: Collections",
                            callback: () => {
                                // Step 4: Progress & Gallery
                                const step4Action = {
                                    label: "Let's Dig! ⛏️",
                                    callback: () => {
                                        showNotification(
                                            "🎉 Tutorial Complete!",
                                            "Your underground adventure begins now. Collect them all!",
                                            "level-up",
                                            4000
                                        );
                                        SoundEngine.playLevelUp();
                                    }
                                };
                                openDetailModal(
                                    "Cavern Gallery",
                                    "🏆",
                                    "The Collections view logs the 320 programmatically unlocked ore cards, trophies, and milestones you obtain. Complete goals to unlock high-tier badges!",
                                    [],
                                    step4Action
                                );
                            }
                        };
                        openDetailModal(
                            "The Town Shop",
                            "🛒",
                            "Spend your Coins here on pickaxes, capacity bags, energy foods, and active buff potions. Use the Token Exchange at the top to buy VIP Subscriptions and Badges!",
                            [],
                            step3Action
                        );
                    }
                };
                openDetailModal(
                    "Mined Resources",
                    "🎒",
                    "Mined items appear in your bottom Inventory Tray. Click any item card to inspect its unique weight and mutation multipliers. Click the green 'Sell All' button to earn Gold Coins!",
                    [],
                    step2Action
                );
            }
        };

        openDetailModal(
            "Underworld Operations",
            "⛏️",
            "Welcome to the Caverns! Click on any unlocked Cavern Box and click 'Mine' to spend Energy and gain XP. Each strike has a chance to yield mutated gems!",
            [],
            step1Action
        );
    }

    // ==================== STARTING USERNAME INPUT MODAL CONTROLLER ====================
    if (saveNameBtn && usernameInput && nameModal) {
        saveNameBtn.addEventListener("click", () => {
            SoundEngine.playCoin();
            const inputVal = usernameInput.value.trim();
            playerState.username = inputVal ? inputVal : "Miner Joe";
            saveGame();
            updateStatsUI();
            nameModal.classList.remove("active");

            // Welcome notification
            showNotification(
                `👋 Welcome ${playerState.username}!`,
                "Let's enter the caverns and mine some valuable resources!",
                "level-up",
                5000
            );

            // Trigger the step-by-step tutorial tour immediately after name submission
            setTimeout(startTutorial, 800);
        });
    }

    function checkUserRegistration() {
        // Trigger Auth modal only if player has no username registered yet
        if (!playerState.username) {
            if (authModal) {
                authModal.classList.add("active");
            }
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", e => {
            e.stopPropagation();
            SoundEngine.playClick();
            sidebar.classList.toggle("open");
        });
    }

    // ==================== DAILY CLAIM CONTROLLER ====================
    const dailyClaimBtn = document.getElementById("dailyClaimBtn");

    if (dailyClaimBtn) {
        dailyClaimBtn.addEventListener("click", e => {
            e.stopPropagation();
            SoundEngine.playClick();

            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const timePassed = now - playerState.lastClaimTime;

            if (timePassed < cooldown) {
                // Calculation of remaining cooldown hours and minutes
                const timeLeft = cooldown - timePassed;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                );

                SoundEngine.playError();
                showNotification(
                    "⏳ Claim Cooldown",
                    `Your Daily Gift is charging. Come back in <strong>${hours}h ${minutes}m</strong>!`,
                    "shop",
                    3500
                );
            } else {
                // Random prizes scaling with player level
                const goldReward =
                    500 +
                    Math.floor(Math.random() * 1001) +
                    playerState.level * 50;
                const tokenReward = 1 + Math.floor(Math.random() * 3);

                playerState.money += goldReward;
                playerState.tokens += tokenReward;
                playerState.lastClaimTime = now;

                SoundEngine.playLevelUp();

                // Detailed reward modal popup
                openDetailModal(
                    "Daily Cavern Chest",
                    "🎁",
                    "Congratulations! You popped open your loyalty daily container. Inside you discovered rich resources to fuel your progression!",
                    [
                        {
                            label: "Coins Awarded",
                            value: `🪙 +${formatMoney(goldReward)}`
                        },
                        { label: "Tokens Awarded", value: `🎟️ +${tokenReward}` }
                    ]
                );

                saveGame();
                updateStatsUI();
                renderShop();
            }
        });
    }

    const gameArea = document.querySelector(".game-area");
    if (gameArea && sidebar) {
        gameArea.addEventListener("click", () => {
            if (window.innerWidth < 768 && sidebar.classList.contains("open")) {
                sidebar.classList.remove("open");
            }
        });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMapPageStructure();
        }, 100);
    });

    // ==================== INITIAL GESTURE TRIGGER ====================
    document.body.addEventListener(
        "click",
        () => {
            SoundEngine.init();
        },
        { once: true }
    );

    // ==================== REAL-TIME MULTIPLAYER MARKETPLACE ENGINE ====================
    const marketList = document.getElementById("marketList");
    const addListingBtn = document.getElementById("addListingBtn");
    const marketModal = document.getElementById("marketModal");
    const marketModalCloseBtn = document.getElementById("marketModalCloseBtn");
    const marketOreSelect = document.getElementById("marketOreSelect");
    const marketPriceInput = document.getElementById("marketPriceInput");
    const marketCurrencySelect = document.getElementById(
        "marketCurrencySelect"
    );
    const marketSubmitBtn = document.getElementById("marketSubmitBtn");

    let activeMarketListings = [];

    // Helper: Build display name with variant & mutation prefixes
    function getItemDisplayName(item) {
        let prefix = "";
        if (item.variant && item.variant !== "Normal") {
            prefix += `${item.variant} `;
        }
        if (item.mutation && item.mutation !== "Normal") {
            const cleanMutation = item.mutation.replace(" Mutation", "");
            prefix += `${cleanMutation} `;
        }
        return `${prefix}${item.name}`;
    }

    // Populate the dropdown inside the modal with current inventory items
    function populateMarketOreSelect() {
        if (!marketOreSelect) return;
        marketOreSelect.innerHTML =
            '<option value="" disabled selected>Select an Ore...</option>';

        playerState.inventory.forEach((item, index) => {
            const displayName = getItemDisplayName(item);
            // Calculate the actual final value of the item in your bag
            const finalValue = Math.floor(
                (item.finalValue || item.baseValue) * playerState.sellMultiplier
            );
            const opt = document.createElement("option");
            opt.value = index;
            opt.textContent = `${item.icon || "🪨"} ${displayName} (Final Value: 🪙 ${formatMoney(finalValue)})`;
            marketOreSelect.appendChild(opt);
        });
    }

    // Open/Close Modal Listeners
    if (addListingBtn) {
        addListingBtn.addEventListener("click", e => {
            e.stopPropagation();
            SoundEngine.playClick();

            if (!firebaseActive || !navigator.onLine) {
                SoundEngine.playError();
                showNotification(
                    "Network Offline",
                    "You must be connected to the internet to trade.",
                    "error"
                );
                return;
            }

            if (playerState.saveMode !== "cloud") {
                SoundEngine.playError();
                showNotification(
                    "Guest Restriction",
                    "Guest accounts cannot list items. Register to unlock trade!",
                    "error"
                );
                return;
            }

            populateMarketOreSelect();
            marketModal.classList.add("active");
        });
    }

    if (marketModalCloseBtn) {
        marketModalCloseBtn.addEventListener("click", () => {
            SoundEngine.playClick();
            marketModal.classList.remove("active");
        });
    }

    // Submit and Upload Listing to Firebase
    if (marketSubmitBtn) {
        marketSubmitBtn.addEventListener("click", () => {
            const selectedIndex = parseInt(marketOreSelect.value);
            const price = parseInt(marketPriceInput.value);
            const currency = marketCurrencySelect.value;
            const user = auth.currentUser;

            if (isNaN(selectedIndex) || isNaN(price) || price <= 0 || !user) {
                SoundEngine.playError();
                showNotification(
                    "Invalid Parameters",
                    "Please choose a valid ore and enter a price greater than 0.",
                    "error"
                );
                return;
            }

            const itemToSell = playerState.inventory[selectedIndex];
            if (!itemToSell) return;

            marketSubmitBtn.disabled = true;
            marketSubmitBtn.textContent = "Uploading...";

            const listingId = db.ref("marketplace").push().key;
            const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

            const listingData = {
                id: listingId,
                sellerId: user.uid,
                sellerName: playerState.username,
                oreName: getItemDisplayName(itemToSell),
                oreIcon: itemToSell.icon || "🪨",
                itemDetails: itemToSell, // Store complete item properties
                price: price,
                currency: currency,
                status: "active",
                createdTime: Date.now(),
                expiryTime: expiryTime,
                soldTime: null
            };

            // Write listing to database
            db.ref("marketplace/" + listingId)
                .set(listingData)
                .then(() => {
                    // Remove item from local inventory array immediately
                    playerState.inventory.splice(selectedIndex, 1);

                    saveGame();
                    updateStatsUI();
                    renderInventoryTray();

                    marketModal.classList.remove("active");
                    marketSubmitBtn.disabled = false;
                    marketSubmitBtn.textContent = "List Product";
                    marketPriceInput.value = "";

                    SoundEngine.playCoin();
                    showNotification(
                        "Item Listed!",
                        `Successfully uploaded your ${listingData.oreName} to the live server.`,
                        "shop",
                        4000
                    );
                })
                .catch(err => {
                    console.error("Listing failed to upload:", err);
                    marketSubmitBtn.disabled = false;
                    marketSubmitBtn.textContent = "List Product";
                    SoundEngine.playError();
                });
        });
    }
    
    function renderLeaderboard() {
        if (!firebaseActive || !leaderboardBody) return;
        
        const category = leaderCatSelect.value;
        const statLabel = leaderCatSelect.options[leaderCatSelect.selectedIndex].text.replace("By ", "");
        document.getElementById('statHeader').textContent = statLabel;

        leaderboardBody.innerHTML = '';
        leaderboardLoading.style.display = 'block';

        // Fetch top 50 based on selected category
        db.ref('leaderboards').orderByChild(category).limitToLast(50).once('value', (snapshot) => {
            const players = [];
            snapshot.forEach(child => {
                players.push({ uid: child.key, ...child.val() });
            });

            // Firebase returns ascending, we want descending (highest first)
            players.reverse();

            leaderboardLoading.style.display = 'none';
            
            players.forEach((p, index) => {
                const row = document.createElement('tr');
                const isMe = auth.currentUser && p.uid === auth.currentUser.uid;
                if (isMe) row.className = 'my-score-highlight';
                if (index < 3) row.classList.add(`leaderboard-row-${index}`);

                let rankDisplay = index + 1;
                if (index === 0) rankDisplay = '<span class="rank-medal">🥇</span>';
                if (index === 1) rankDisplay = '<span class="rank-medal">🥈</span>';
                if (index === 2) rankDisplay = '<span class="rank-medal">🥉</span>';

                const val = (category === 'money') ? formatMoney(p[category], true) : p[category];

                row.innerHTML = `
                    <td style="padding: 12px; font-weight: 900;">${rankDisplay}</td>
                    <td>
                        <div class="miner-name-cell">
                            <div class="profile-avatar" style="width:24px; height:24px; font-size:0.7rem;">👤</div>
                            ${p.username} ${isMe ? '<small>(You)</small>' : ''}
                        </div>
                    </td>
                    <td class="leaderboard-val">${val}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        });
    }

    // Listener for Category Switch
    if (leaderCatSelect) {
        leaderCatSelect.addEventListener('change', renderLeaderboard);
    }

    // Render Live Marketplace Listings
    function renderMarketplace() {
        if (!marketList) return;

        // 1. Show loading if Firebase is working but array is still empty
        if (firebaseActive && activeMarketListings.length === 0) {
            marketList.innerHTML = `<div class="empty-inv" style="text-align: center; padding: 25px;"><i class="fa-solid fa-spinner fa-spin"></i> Checking for server listings...</div>`;
            return;
        }

        marketList.innerHTML = "";

        // 2. Real "No items found" state
        if (activeMarketListings.length === 0) {
            marketList.innerHTML = `<div class="empty-inv" style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 25px;">No items currently listed on the server.</div>`;
            return;
        }

        const now = Date.now();
        const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

        activeMarketListings.forEach(item => {
            // Self-cleaning: If an item was sold more than 24 hours ago, remove it from the database silently
            if (
                item.status === "sold" &&
                item.soldTime &&
                now - item.soldTime > 24 * 60 * 60 * 1000
            ) {
                if (firebaseActive) db.ref("marketplace/" + item.id).remove();
                return;
            }

            // Self-cleaning: If an active item has been listed for more than 7 days, return it to the owner
            if (item.status === "active" && now > item.expiryTime) {
                if (currentUserId === item.sellerId && firebaseActive) {
                    // Return the ore to the seller's inventory
                    playerState.inventory.push(item.itemDetails);
                    db.ref("marketplace/" + item.id)
                        .remove()
                        .then(() => {
                            saveGame();
                            renderInventoryTray();
                            updateStatsUI();
                            showNotification(
                                "Listing Expired",
                                `Your listing for ${item.oreName} has expired (7 days) and returned to your inventory.`,
                                "shop",
                                5000
                            );
                        });
                } else if (firebaseActive) {
                    // Clear the expired listing for other players
                    db.ref("marketplace/" + item.id).remove();
                }
                return;
            }

            const card = document.createElement("div");
            card.className = "market-card";

            const currencySymbol = item.currency === "tokens" ? "🎟️" : "🪙";
            const priceText = `${currencySymbol} ${formatMoney(item.price, true)}`;

            // Build dynamic controls based on player states and relations
            let controlHtml = "";
            if (item.status === "sold") {
                controlHtml = `<span class="market-badge-sold">Sold</span>`;
            } else if (currentUserId === item.sellerId) {
                // If it is their own item, display an edit/cancel button to reclaim it
                controlHtml = `
                    <div style="display: flex; gap: 6px;">
                        <button class="nav-btn cancel-listing-btn" data-id="${item.id}" style="background-color: #3b0707; border-color: #7f1d1d; color: #fca5a5; padding: 4px 8px; font-size: 0.7rem;"><i class="fa-solid fa-trash-can"></i> Reclaim</button>
                    </div>`;
            } else {
                // If it is another player's item, display the buy trigger
                controlHtml = `<button class="card-buy-btn buy-listing-btn" data-id="${item.id}" style="width: auto; padding: 4px 12px; font-size: 0.72rem;">Buy</button>`;
            }

            card.innerHTML = `
                <div class="market-info-block">
                    <div class="circle-icon" style="width: 36px; height: 36px; font-size: 1.15rem;">${item.oreIcon}</div>
                    <div class="market-details">
                        <span class="market-ore-name">${item.oreName}</span>
                        <span class="market-seller-label">Seller: ${item.sellerName || "Anonymous Miner"}</span>
                    </div>
                </div>
                <div class="market-meta-block">
                    <span class="market-price-tag">${priceText}</span>
                    ${controlHtml}
                </div>`;

            marketList.appendChild(card);
        });

        // Bind Action Listeners
        marketList.querySelectorAll(".buy-listing-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                buyMarketplaceItem(btn.getAttribute("data-id"));
            });
        });

        marketList.querySelectorAll(".cancel-listing-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                cancelMarketplaceListing(btn.getAttribute("data-id"));
            });
        });
    }

    // Cancel / Reclaim Listing Logic
    function cancelMarketplaceListing(listingId) {
        if (!firebaseActive) return;
        SoundEngine.playClick();

        const listing = activeMarketListings.find(i => i.id === listingId);
        if (!listing) return;

        // Verify if inventory is full before returning
        if (playerState.inventory.length >= playerState.maxBagCapacity) {
            SoundEngine.playError();
            showNotification(
                "🎒 Bag Full!",
                "Clear some space in your inventory before reclaiming this ore.",
                "sell",
                3500
            );
            return;
        }

        // Atomically remove the listing from database and return the item
        db.ref("marketplace/" + listingId)
            .remove()
            .then(() => {
                playerState.inventory.push(listing.itemDetails);
                saveGame();
                updateStatsUI();
                renderInventoryTray();
                showNotification(
                    "Reclaimed specimen",
                    `Successfully returned your ${listing.oreName} to your inventory.`,
                    "shop",
                    3500
                );
            })
            .catch(err => console.error("Cancel failed:", err));
    }

    // Purchase Live Listing (With atomic transaction and double-spending protection)
    function buyMarketplaceItem(listingId) {
        if (!firebaseActive) return;
        SoundEngine.playClick();

        // Guest check
        if (playerState.saveMode !== "cloud") {
            SoundEngine.playError();
            showNotification(
                "Trade Restriction",
                "Guest accounts cannot purchase server trades. Register to trade!",
                "error"
            );
            return;
        }

        // Bag full check
        if (playerState.inventory.length >= playerState.maxBagCapacity) {
            SoundEngine.playError();
            showNotification(
                "🎒 Bag Full!",
                "Your bag is full! Sell some items before buying.",
                "sell",
                3500
            );
            return;
        }

        const listing = activeMarketListings.find(i => i.id === listingId);
        if (!listing || listing.status !== "active") return;

        // Currency checks
        if (listing.currency === "tokens") {
            if (playerState.tokens < listing.price) {
                SoundEngine.playError();
                showNotification(
                    "🎟️ Insufficient Tokens!",
                    "You cannot afford this listing.",
                    "error"
                );
                return;
            }
        } else {
            if (playerState.money < listing.price) {
                SoundEngine.playError();
                showNotification(
                    "🪙 Insufficient Coins!",
                    "You cannot afford this listing.",
                    "error"
                );
                return;
            }
        }

        // Atomic Transaction: Check status and mark as sold on Firebase safely
        const listingRef = db.ref("marketplace/" + listingId);
        listingRef.transaction(
            currentData => {
                if (currentData && currentData.status === "active") {
                    currentData.status = "sold";
                    currentData.soldTime =
                        firebase.database.ServerValue.TIMESTAMP;
                    currentData.buyerId = auth.currentUser.uid;
                    currentData.buyerName = playerState.username;
                    currentData.earningsClaimed = false; // <-- ADDED: Setup the claiming state
                    return currentData;
                }
                return; // Abort if already purchased
            },
            (error, committed, snapshot) => {
                if (error) {
                    console.error("Purchase transaction failed:", error);
                } else if (!committed) {
                    SoundEngine.playError();
                    showNotification(
                        "❌ Item Already Sold",
                        "This listing was just purchased by another player!",
                        "error",
                        4000
                    );
                } else {
                    // Succeeded! Deduct buyer currency locally and append ore
                    if (listing.currency === "tokens") {
                        playerState.tokens -= listing.price;
                    } else {
                        playerState.money -= listing.price;
                    }

                    playerState.inventory.push(listing.itemDetails);

                    SoundEngine.playLevelUp();
                    showNotification(
                        "🛍️ Purchase Successful!",
                        `Obtained ${listing.oreName} for ${listing.currency === "tokens" ? "🎟️" : "🪙"} ${formatMoney(listing.price)}!`,
                        "level-up",
                        4000
                    );

                    saveGame();
                    updateStatsUI();
                    renderInventoryTray();
                }
            }
        );
    }

    // Periodically Check and Claim Pending Earnings from Successful Sales (Grouped Version)
    function claimPendingEarnings() {
        if (
            !firebaseActive ||
            playerState.saveMode !== "cloud" ||
            isProcessingClaim
        )
            return;
        const user = auth.currentUser;
        if (!user) return;

        // 1. Find all sold items belonging to the player that aren't claimed yet
        const unclaimed = activeMarketListings.filter(
            item =>
                item.sellerId === user.uid &&
                item.status === "sold" &&
                item.earningsClaimed === false
        );

        if (unclaimed.length === 0) return;

        // Lock to prevent multiple modals from stacking
        isProcessingClaim = true;

        let totalGold = 0;
        let totalTokens = 0;
        let updatePromises = [];

        // 2. Build the scrollable list UI
        let listHtml = `<p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">The following items were purchased by other players:</p>`;

        // Apply scroll if more than 5 items
        const scrollBoxStyle =
            unclaimed.length > 5 ? "max-height: 180px; overflow-y: auto;" : "";
        listHtml += `<div style="${scrollBoxStyle} display: flex; flex-direction: column; gap: 8px; padding-right: 5px;">`;

        unclaimed.forEach(item => {
            const sym = item.currency === "tokens" ? "🎟️" : "🪙";
            if (item.currency === "tokens") totalTokens += item.price;
            else totalGold += item.price;

            listHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-size: 0.8rem; font-weight: bold;">${item.oreIcon} ${item.oreName}</span>
                    <span style="font-size: 0.8rem; color: var(--gold-accent); font-weight: bold;">${sym} ${formatMoney(item.price)}</span>
                </div>`;

            // Prepare database update
            updatePromises.push(
                db.ref("marketplace/" + item.id + "/earningsClaimed").set(true)
            );
        });
        listHtml += `</div>`;

        // 3. Final stats to show in the modal
        const finalStats = [
            { label: "Items Sold", value: `${unclaimed.length} Ores` },
            { label: "Total Coins", value: `🪙 +${formatMoney(totalGold)}` },
            { label: "Total Tokens", value: `🎟️ +${totalTokens}` }
        ];

        // 4. Update Database first, then show Modal
        Promise.all(updatePromises)
            .then(() => {
                playerState.money += totalGold;
                playerState.tokens += totalTokens;

                SoundEngine.playLevelUp();

                openDetailModal(
                    "Marketplace Revenue",
                    "💰",
                    listHtml,
                    finalStats,
                    {
                        label: "COLLECT EARNINGS",
                        callback: () => {
                            isProcessingClaim = false; // Unlock for future sales
                            saveGame();
                            updateStatsUI();
                        }
                    }
                );
            })
            .catch(err => {
                isProcessingClaim = false;
                console.error("Revenue claim failed:", err);
            });
    }

    // Monitor live marketplace database node (FIXED: Reliable Live Sync)
    if (firebaseActive) {
        db.ref("marketplace").on(
            "value",
            snapshot => {
                console.log("📦 Marketplace Update Received from Server.");
                activeMarketListings = [];

                snapshot.forEach(child => {
                    activeMarketListings.push(child.val());
                });

                // Re-run sorting: Active top, Newest first, Sold bottom
                activeMarketListings.sort((a, b) => {
                    if (a.status === "active" && b.status === "sold") return -1;
                    if (a.status === "sold" && b.status === "active") return 1;
                    return b.createdTime - a.createdTime;
                });

                // Force UI update
                renderMarketplace();

                // Check for earnings if we are logged in
                if (auth.currentUser) {
                    claimPendingEarnings();
                }
            },
            error => {
                console.error("Marketplace Listener Error:", error);
            }
        );
    }

    // ==================== AUTHENTICATION & DATA MIGRATION ENGINE ====================
    const authModal = document.getElementById("authModal");
    const authTitle = document.getElementById("authTitle");
    const authDesc = document.getElementById("authDesc");
    const authIcon = document.getElementById("authIcon");
    const authUsername = document.getElementById("authUsername");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const authGuestBtn = document.getElementById("authGuestBtn");
    const authToggleText = document.getElementById("authToggleText");

    let isSignUpMode = false; // Toggle tracker

    // Switch between Sign In and Sign Up modes inside modal
    if (authToggleText) {
        authToggleText.addEventListener("click", () => {
            SoundEngine.playClick();
            isSignUpMode = !isSignUpMode;

            if (isSignUpMode) {
                authTitle.textContent = "Sign Up";
                authDesc.textContent =
                    "Create an account to backup your character progress!";
                authIcon.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
                authUsername.style.display = "block";
                authSubmitBtn.textContent = "Sign Up";
                authToggleText.innerHTML = `Already have an account? <strong style="color: var(--gold-accent);">Sign In</strong>`;
            } else {
                authTitle.textContent = "Sign In";
                authDesc.textContent =
                    "Sync your character data, unlock leaderboards, and trade online!";
                authIcon.innerHTML = `<i class="fa-solid fa-user-lock"></i>`;
                authUsername.style.display = "none";
                authSubmitBtn.textContent = "Sign In";
                authToggleText.innerHTML = `Don't have an account? <strong style="color: var(--gold-accent);">Sign Up</strong>`;
            }
        });
    }

    // Process Form Submission (Sign In or Sign Up)
    if (authSubmitBtn && authEmail && authPassword) {
        authSubmitBtn.addEventListener("click", () => {
            const email = authEmail.value.trim();
            const password = authPassword.value.trim();
            const username = authUsername.value.trim();

            if (!email || !password) {
                SoundEngine.playError();
                showNotification(
                    "Missing Fields",
                    "Please enter your email and password.",
                    "error"
                );
                return;
            }

            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = isSignUpMode
                ? "Registering..."
                : "Signing In...";

            if (isSignUpMode) {
                // SIGN UP FLOW
                const finalUsername = username ? username : "Miner Joe";

                auth.createUserWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        const user = userCredential.user;

                        // Update Display name on Firebase Profile
                        return user
                            .updateProfile({ displayName: finalUsername })
                            .then(() => {
                                playerState.username = finalUsername;
                                playerState.saveMode = "cloud";

                                // AUTO-MIGRATION: Upload existing local progress to their cloud database!
                                saveGame();

                                authModal.classList.remove("active");
                                authSubmitBtn.disabled = false;

                                SoundEngine.playLevelUp();
                                showNotification(
                                    "Account Registered!",
                                    `Welcome ${playerState.username}! Progress synced to cloud.`,
                                    "level-up",
                                    4500
                                );

                                renderMarketplace(); // <--- ADD THIS LINE

                                // Trigger onboarding tutorial
                                setTimeout(startTutorial, 500);
                            });
                    })
                    .catch(error => {
                        authSubmitBtn.disabled = false;
                        authSubmitBtn.textContent = "Sign Up";
                        SoundEngine.playError();
                        showNotification(
                            "Registration Failed",
                            error.message,
                            "error",
                            5000
                        );
                    });
            } else {
                // SIGN IN FLOW
                auth.signInWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        const user = userCredential.user;

                        // Fetch saved data from Cloud database
                        db.ref("users/" + user.uid)
                            .once("value")
                            .then(snapshot => {
                                const cloudData = snapshot.val();

                                if (cloudData && cloudData.saveState) {
                                    // Overwrite local state with cloud progress
                                    Object.assign(
                                        playerState,
                                        cloudData.saveState
                                    );
                                    playerState.saveMode = "cloud";

                                    // Overwrite local collections map
                                    if (cloudData.collections) {
                                        collectionsData.forEach(item => {
                                            if (
                                                cloudData.collections[
                                                    item.id
                                                ] !== undefined
                                            ) {
                                                item.obtained =
                                                    cloudData.collections[
                                                        item.id
                                                    ];
                                            }
                                        });
                                    }
                                } else {
                                    // If account is completely new, migrate current offline stats
                                    playerState.saveMode = "cloud";
                                    if (user.displayName)
                                        playerState.username = user.displayName;
                                }

                                saveGame(); // Writes to localStorage
                                updateStatsUI();
                                renderShop();
                                renderInventoryTray();
                                renderCollections();

                                authModal.classList.remove("active");
                                authSubmitBtn.disabled = false;

                                SoundEngine.playLevelUp();
                                showNotification(
                                    "Sign In Successful!",
                                    `Progress synced. Welcome back, ${playerState.username}!`,
                                    "level-up",
                                    4500
                                );
                            });
                    })
                    .catch(error => {
                        authSubmitBtn.disabled = false;
                        authSubmitBtn.textContent = "Sign In";
                        SoundEngine.playError();
                        showNotification(
                            "Sign In Failed",
                            error.message,
                            "error",
                            5000
                        );
                    });
            }
        });
    }

    // Offline Guest Bypass Handler
    if (authGuestBtn && authModal) {
        authGuestBtn.addEventListener("click", () => {
            SoundEngine.playClick();
            playerState.saveMode = "local"; // Stays local/offline

            // Prompt guest user for their display name if they don't have one
            if (!playerState.username) {
                const guestName =
                    prompt("Enter your Guest display name:") || "Guest Miner";
                playerState.username = guestName.trim().substring(0, 14);

                setTimeout(startTutorial, 500);
            }

            saveGame();
            updateStatsUI();
            authModal.classList.remove("active");
            showNotification(
                "Guest Mode Active",
                "Playing offline. Progress saved to local storage.",
                "shop",
                4000
            );
        });
    }

    // Monitor Firebase Auth state dynamically (FIXED for Marketplace Sync)
    if (firebaseActive) {
        auth.onAuthStateChanged(user => {
            if (user) {
                playerState.saveMode = "cloud";
                if (user.displayName) playerState.username = user.displayName;

                // Refresh market to show "Buy" buttons for items you don't own
                renderMarketplace();
                claimPendingEarnings();
            } else {
                playerState.saveMode = "local";
                // Refresh market to show "Guest" view (Buy buttons disabled/inspect only)
                renderMarketplace();
            }
            updateStatsUI();
        });
    }

    // ==================== INITIALIZATION ====================
    loadGame(); // Restore progress from local storage on reload
    checkUserRegistration(); // Call registration check on load
    updateMapPageStructure();
    updateStatsUI();
    renderInventoryTray();
    renderShop();
    renderCollections();

    // ==================== DEVELOPER TOOLS ENGINE ====================
    const DEV_UID = "ZaOjo0lPMTYrHnA8sK5769agLO52"; // <--- CHANGE THIS!

    function initDevTools() {
        const fab = document.getElementById("devFab");
        const panel = document.getElementById("devPanel");
        const closeBtn = document.getElementById("closeDev");

        if (!fab || !panel) return;

        // 1. Security Check
        if (firebaseActive) {
            auth.onAuthStateChanged(user => {
                if (user && user.uid === DEV_UID) {
                    fab.style.display = "flex";
                } else {
                    fab.style.display = "none";
                }
            });
        }

        // 2. Click to Open Panel
        let isDragging = false;
        fab.addEventListener("click", () => {
            if (!isDragging) panel.style.display = "flex";
        });
        closeBtn.addEventListener(
            "click",
            () => (panel.style.display = "none")
        );

        // 3. UNIVERSAL DRAG LOGIC (Works on PC & Mobile)
        let offsetHoldX, offsetHoldY;

        fab.addEventListener("pointerdown", e => {
            isDragging = false;
            // Record where we grabbed the button
            offsetHoldX = e.clientX - fab.getBoundingClientRect().left;
            offsetHoldY = e.clientY - fab.getBoundingClientRect().top;

            // Tell the browser to keep tracking this finger/mouse even if it leaves the button area
            fab.setPointerCapture(e.pointerId);

            function onPointerMove(ev) {
                isDragging = true;

                // Calculate new position
                let newX = ev.clientX - offsetHoldX;
                let newY = ev.clientY - offsetHoldY;

                // Apply styles
                fab.style.left = newX + "px";
                fab.style.top = newY + "px";
                fab.style.right = "auto";
                fab.style.bottom = "auto";
            }

            // Move event
            fab.addEventListener("pointermove", onPointerMove);

            // Stop event
            fab.addEventListener(
                "pointerup",
                () => {
                    fab.removeEventListener("pointermove", onPointerMove);
                    // Small delay so a drag doesn't count as a "click"
                    setTimeout(() => (isDragging = false), 50);
                },
                { once: true }
            );
        });
    }

    // Dev Cheat Functions (Global so HTML can see them)
    window.devAddGold = () => {
        playerState.money += 100000000;
        updateStatsUI();
        saveGame();
        showNotification("DEV", "+100M Gold Added", "level-up");
    };
    window.devAddTokens = () => {
        playerState.tokens += 100000000;
        updateStatsUI();
        saveGame();
        showNotification("DEV", "+100M Tokens Added", "level-up");
    };
    window.devFillEnergy = () => {
        playerState.currentEnergy = playerState.maxEnergy; // Resets to 100% instead of adding more
        updateStatsUI();
        saveGame();
    };
    window.devLevelUp = () => {
        playerState.level += 50
        SoundEngine.playLevelUp();

        showNotification(
            "🎉 Level Up!",
            `Awesome! You reached Level ${playerState.level}! Gained +1 Premium Token and Max Energy increased to ${playerState.maxEnergy}%!`,
            "level-up",
            5000
        );

        if (playerState.level >= 10) unlockCollectionItem("cavern-cup");

        updateMapPageStructure();
        showNotification("DEV", "Level Bypassed", "level-up");
        renderCollections();
        saveGame();
    };
    window.devUnlockAll = () => {
        collectionsData.forEach(c => (c.obtained = true));
        cavesData.forEach(cave => {
            if (cave.lootPool)
                cave.lootPool.forEach(ore => {
                    const id = ore.name.toLowerCase().replace(/\s+/g, "-");
                    playerState.unlockedOres[`${id}-normal`] = true;
                    playerState.unlockedOres[`${id}-variant`] = true;
                    playerState.unlockedOres[`${id}-mutation`] = true;
                    playerState.unlockedOres[`${id}-hybrid`] = true;
                });
        });
        renderCollections();
        saveGame();
        showNotification("DEV", "All Cards Unlocked", "collection");
    };
    // FIXED: Hard Reset now clears LocalStorage AND Signs Out of Firebase
    window.devReset = () => {
        if (confirm("🔥 HARD RESET: This will wipe your local save and SIGN YOU OUT. Continue?")) {
            isShuttingDown = true; // Stop all background save processes immediately
            
            // 1. Wipe all local storage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Clear current memory to be safe
            playerState.money = 0;
            playerState.inventory = [];
            playerState.username = "";

            // 3. Handle Firebase and Reload
            if (firebaseActive && auth) {
                auth.signOut().then(() => {
                    window.location.replace(window.location.href); // Harder reload
                }).catch(() => {
                    window.location.replace(window.location.href);
                });
            } else {
                window.location.replace(window.location.href);
            }
        }
    };

    // Launch Dev Tools
    initDevTools();
});