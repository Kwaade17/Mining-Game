document.addEventListener('DOMContentLoaded', () => {
    // ==================== SESSION STATE ====================
    const GAME_VERSION = "1.9.0"; // Active version used to check shop updates
    
    const playerState = {
        username: "", // Custom player display name
        level: 1, xp: 0, xpNeeded: 100, money: 200, maxBagCapacity: 20,
        tokens: 0,          // <-- ADD THIS (Premium Currency)
        hasCoinSub: false,  // <-- ADD THIS (Pension Subscription check)
        hasTokenSub: false, // <-- ADD THIS
        hasMagnet: false,   // <-- ADD THIS
        hasStarterBundle: false, // <-- ADD THIS
        hasMinerPack: false,     // <-- ADD THIS
        tokenSubTimer: 0,   // <-- ADD THIS
        lastClaimTime: 0,    // <-- ADD THIS (Daily Claim timestamp)
        currentEnergy: 100, maxEnergy: 100, activePickaxeMultiplier: 1.0,
        xpMultiplier: 1.0, 
        sellMultiplier: 1.0, // <-- ADD THIS LINE
        inventory: [],
        soundsMuted: false, // Tracks global audio state
        unlockedOres: {}, // Dictionary tracking 320 progressive dynamic ore cards
        buffs: {
            luck: 0,            // Dynamic luck timer in seconds
            rage: 0,            // Dynamic rage cost timer in seconds
            xpBoost: 0          // Dynamic XP boost timer in seconds
        }
    };

    // ==================== SELECTORS ====================
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const gameViews = document.querySelectorAll('.game-view');
    const userProfile = document.getElementById('userProfile');

    // Profile Dropdown Options selectors
    const dropdownAccount = document.getElementById('dropdownAccount');
    const dropdownSettings = document.getElementById('dropdownSettings');
    const dropdownSignOut = document.getElementById('dropdownSignOut');

    // Username display selectors
    const navUsername = document.getElementById('navUsername');
    const sideUsername = document.getElementById('sideUsername');

    // Welcome Name Modal selectors
    const nameModal = document.getElementById('nameModal');
    const usernameInput = document.getElementById('usernameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');

    // Sidebar XP Progress elements
    const sidebarXpFill = document.getElementById('sidebarXpFill');
    const sidebarXpText = document.getElementById('sidebarXpText');

    // Stats Labels
    const labelLevel = document.getElementById('player-level');
    const sidebarLevel = document.getElementById('sidebarLevel'); // <-- ADD THIS SELECTOR
    const labelXp = document.getElementById('player-xp');
    const labelMoney = document.getElementById('player-money');
    const labelTokens = document.getElementById('player-tokens'); // <-- ADD THIS Selector
    const labelOres = document.getElementById('ores-mined');
    const labelCapacity = document.getElementById('bag-capacity');
    const labelEnergy = document.getElementById('player-energy');

    const caveContainer = document.getElementById('caveContainer');
    const prevMapBtn = document.getElementById('prevMapBtn');
    const nextMapBtn = document.getElementById('nextMapBtn');
    const mapPageLabel = document.getElementById('mapPageLabel');
    const inventoryScroll = document.getElementById('inventoryScroll');
    const labelInvCount = document.getElementById('inv-count');
    const labelInvMax = document.getElementById('inv-max');
    const sellAllBtn = document.getElementById('sellAllBtn');

    const shopSearchInput = document.getElementById('shopSearchInput');
    const shopSectionFilter = document.getElementById('shopSectionFilter');
    const shopSectionsList = document.getElementById('shopSectionsList');

    const colSearchInput = document.getElementById('colSearchInput');
    const colSectionFilter = document.getElementById('colSectionFilter');
    const colSectionsList = document.getElementById('colSectionsList');

    // Modal selectors
    const infoModal = document.getElementById('infoModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalStats = document.getElementById('modalStats');

    // Game Manual Element selectors
    const readmeContent = document.getElementById('readmeContent');

    // Active Buffs Panel container
    const buffsContainer = document.getElementById('buffsContainer');

    let currentMapPage = 1, cavesPerPage = 9, maxMapPages = 1, totalMinesCount = 0;
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
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
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
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (err) {
                console.error("Audio node generation failed: ", err);
            }
        },
        playClick() {
            this.playTone(600, 'sine', 0.08, 0.05); 
        },
        playMine() {
            this.playTone(1200, 'triangle', 0.1, 0.15); 
            setTimeout(() => this.playTone(800, 'sine', 0.05, 0.05), 40); 
        },
        playCoin() {
            this.playTone(987.77, 'sine', 0.12, 0.08); 
            setTimeout(() => this.playTone(1318.51, 'sine', 0.22, 0.08), 80); 
        },
        playLevelUp() {
            this.playTone(523.25, 'triangle', 0.15, 0.15); 
            setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.15), 100); 
            setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.15), 200); 
            setTimeout(() => this.playTone(1046.50, 'triangle', 0.4, 0.15), 300); 
        },
        playError() {
            this.playTone(130, 'sawtooth', 0.25, 0.12); 
        },
        playUnlock() {
            this.playTone(880, 'sine', 0.1, 0.08);
            setTimeout(() => this.playTone(1100, 'sine', 0.1, 0.08), 60);
            setTimeout(() => this.playTone(1320, 'sine', 0.15, 0.08), 120);
        }
    };
    
    // ==================== SHOP ITEM OWNSHIP CHECKER ====================
    function isShopItemOwned(item) {
        try {
            if (!item || !item.category) return false;
            
            if (item.category === "mining-speed") {
                return (playerState.activePickaxeMultiplier || 1.0) >= (item.multiplier || 1.0);
            }
            if (item.category === "bag-capacity") {
                return (playerState.maxBagCapacity || 20) >= (item.capacity || 20);
            }
            if (item.category === "money-perks") {
                if (item.id === "magnet-badge") return !!playerState.hasMagnet;
                return (playerState.sellMultiplier || 1.0) >= (item.multiplier || 1.0);
            }
            if (item.category === "subscriptions") {
                if (item.id === "coin-subscription") return !!playerState.hasCoinSub;
                if (item.id === "token-subscription") return !!playerState.hasTokenSub;
            }
            if (item.category === "passes") {
                if (item.id === "double-xp-pass") return (playerState.xpMultiplier || 1.0) >= 2.0;
            }
            if (item.category === "packs") {
                if (item.id === "starter-bundle") return !!playerState.hasStarterBundle;
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
            const sequentialCategories = ["mining-speed", "bag-capacity", "money-perks"];
            if (sequentialCategories.includes(item.category)) {
                const categoryItems = shopData.filter(i => i.category === item.category);
                const itemIndex = categoryItems.findIndex(i => i.id === item.id);
                
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

    // ==================== PERSISTENT LOCAL STORAGE ENGINE ====================
    function saveGame() {
        localStorage.setItem('miner_save', JSON.stringify(playerState));
        const colMap = {};
        collectionsData.forEach(item => {
            colMap[item.id] = item.obtained;
        });
        localStorage.setItem('miner_col_save', JSON.stringify(colMap));
    }

    function loadGame() {
        const savedState = localStorage.getItem('miner_save');
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
            } catch (err) {
                console.error("Save load failed: ", err);
            }
        }

        const savedCol = localStorage.getItem('miner_col_save');
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
    }

    // ==================== CURRENCY FORMATTER ENGINE ====================
    function formatMoney(value, compact = false) {
        const num = Number(value);
        if (isNaN(num)) return "0";

        if (compact && num >= 100000) {
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(num);
        }

        return num.toLocaleString();
    }

    // ==================== INTERACTIVE NOTIFICATION SYSTEM ====================
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    function showNotification(title, message, type = '', duration = 4000, action = null) {
        const toast = document.createElement('div');
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
            const actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action-btn';
            actionBtn.textContent = action.label;
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundEngine.playClick();
                action.callback();
                closeToast();
            });
            toast.appendChild(actionBtn);
        }

        function closeToast() {
            if (toast.classList.contains('exiting')) return;
            toast.classList.add('exiting');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        toast.querySelector('.toast-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            SoundEngine.playClick();
            closeToast();
        });

        setTimeout(closeToast, duration);
        notificationContainer.appendChild(toast);
    }

    function navigateToView(viewId) {
        const targetLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }

    // ==================== DYNAMIC POPUP MODAL ENGINE ====================
    function openDetailModal(title, icon, description, statsArray = [], customAction = null) {
        if (!infoModal || !modalTitle || !modalIcon || !modalDescription || !modalStats) return;

        modalTitle.textContent = title;
        modalIcon.textContent = icon;
        modalDescription.textContent = description;

        modalStats.innerHTML = '';

        if (statsArray.length > 0) {
            modalStats.style.display = 'flex';
            statsArray.forEach(stat => {
                const row = document.createElement('div');
                row.className = 'modal-stat-row';
                row.innerHTML = `
                    <span class="modal-stat-label">${stat.label}</span>
                    <span class="modal-stat-val">${stat.value}</span>
                `;
                modalStats.appendChild(row);
            });
        } else {
            modalStats.style.display = 'none';
        }

        if (customAction) {
            const btn = document.createElement('button');
            btn.className = 'card-buy-btn';
            btn.style.marginTop = '15px';
            btn.style.width = '100%';
            btn.textContent = customAction.label;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                infoModal.classList.remove('active');
                setTimeout(() => {
                    customAction.callback();
                }, 100); 
            });
            modalStats.style.display = 'flex';
            modalStats.appendChild(btn);
        }

        infoModal.classList.add('active');
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            SoundEngine.playClick();
            infoModal.classList.remove('active');
        });
    }

    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                SoundEngine.playClick();
                infoModal.classList.remove('active');
            }
        });
    }

    // ==================== GAME MANUAL PARSER (README.MD FETCH) ====================
    function loadReadmeFile() {
        if (readmeLoaded || !readmeContent) return;

        fetch('README.md')
            .then(response => {
                if (!response.ok) throw new Error("Could not load README.md file.");
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
    function spawnFloatingText(text, x, y, colorClass = '') {
        const el = document.createElement('div');
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
        const particlePool = [icon, '🪨', '✨', '🪙', '🟫'];

        for (let i = 0; i < particleCount; i++) {
            const el = document.createElement('div');
            el.className = 'mine-particle';
            el.innerHTML = particlePool[Math.floor(Math.random() * particlePool.length)];
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            document.body.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const force = 3 + Math.random() * 6;
            const vx = Math.cos(angle) * force;
            const vy = Math.sin(angle) * force - 4; 

            let currentX = x, currentY = y, currentVy = vy;

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
            const activeView = document.querySelector('.game-view.active');
            if (!activeView) return;

            const chest = document.createElement('div');
            chest.className = 'mystery-chest';
            chest.innerHTML = '🎁';

            const rect = activeView.getBoundingClientRect();
            const randomX = Math.max(30, Math.random() * (rect.width - 70));
            const randomY = Math.max(90, Math.random() * (rect.height - 180));

            chest.style.left = `${randomX}px`;
            chest.style.top = `${randomY}px`;

            chest.addEventListener('click', (e) => {
                e.stopPropagation();
                chest.style.pointerEvents = 'none';

                let rewardGold = 40 + Math.floor(Math.random() * 61); 
                
                // Triple chest gold if Jackpot buff is active
                if (playerState.buffs && playerState.buffs.jackpot > 0) {
                    rewardGold *= 3;
                }

                playerState.money += rewardGold;

                // Fix: Corrected parenthesis syntax inside formatMoney call
                spawnFloatingText(`+🪙 ${formatMoney(rewardGold)}`, e.clientX, e.clientY, 'float-gold');
                showNotification("🎁 Gift Opened!", `Unlocked 🪙 ${formatMoney(rewardGold)} Coins from a Cavern Chest!`, "sell", 3500);

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
        buffsContainer.innerHTML = '';

        const buffLabels = {
            luck: "🍀 Luck",
            rage: "🔥 Rage",
            xpBoost: "✨ Double XP",
            vigor: "⚡ Infinite Energy", // <-- ADD THIS
            jackpot: "🎰 Jackpot"        // <-- ADD THIS
        };

        if (!playerState.buffs) return;

        Object.keys(playerState.buffs).forEach(key => {
            const duration = playerState.buffs[key];
            if (duration > 0) {
                const badge = document.createElement('div');
                badge.className = 'buff-badge';
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
                showNotification("🎟️ Token Pension!", "Received +1 Premium Token from your VIP Subscription!", "shop", 3500);
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
        if (sidebarLevel) sidebarLevel.textContent = `Lvl. ${playerState.level}`; // <-- ADD THIS LINE
        if (labelXp) labelXp.textContent = playerState.xp;
        
        if (labelMoney) labelMoney.textContent = formatMoney(playerState.money, true);
        if (labelTokens) labelTokens.textContent = formatMoney(playerState.tokens);
        
        if (labelOres) labelOres.textContent = playerState.inventory.length;
        if (labelCapacity) labelCapacity.textContent = playerState.maxBagCapacity;
        if (labelEnergy) labelEnergy.textContent = `${Math.floor(playerState.currentEnergy)}%`;
        if (labelInvCount) labelInvCount.textContent = playerState.inventory.length;
        if (labelInvMax) labelInvMax.textContent = playerState.maxBagCapacity;

        // 1. Update full XP fills and Sidebar stats
        if (sidebarXpFill && sidebarXpText) {
            const xpPercent = Math.min(100, (playerState.xp / playerState.xpNeeded) * 100);
            sidebarXpFill.style.width = `${xpPercent}%`;
            sidebarXpText.textContent = `XP: ${playerState.xp} / ${playerState.xpNeeded}`;
        }

        // 2. Update the new contained navbar XP bar and remaining text limit
        const navXpFill = document.getElementById('navXpFill');
        const navXpText = document.getElementById('navXpText');
        if (navXpFill && navXpText) {
            const xpPercent = Math.min(100, (playerState.xp / playerState.xpNeeded) * 100);
            navXpFill.style.width = `${xpPercent}%`;
            
            // Calculate how much XP is remaining to level up
            const xpLeft = playerState.xpNeeded - playerState.xp;
            navXpText.textContent = `${xpLeft} XP to Level Up`;
        }

        // 3. Update the new Floating Mobile Stats Bar labels
        const floatMoney = document.getElementById('float-money');
        const floatTokens = document.getElementById('float-tokens');
        const floatBag = document.getElementById('float-bag');
        const floatEnergy = document.getElementById('float-energy');

        if (floatMoney) floatMoney.textContent = formatMoney(playerState.money, true);
        if (floatTokens) floatTokens.textContent = formatMoney(playerState.tokens);
        if (floatBag) floatBag.textContent = `${playerState.inventory.length} / ${playerState.maxBagCapacity}`;
        if (floatEnergy) floatEnergy.textContent = `${Math.floor(playerState.currentEnergy)}%`;

        const displayName = playerState.username ? playerState.username : "Miner Joe";
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
               const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
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

        checkAchievements(); 
    }

    function awardXp(amount) {
        const activeMultiplier = (playerState.buffs && playerState.buffs.xpBoost > 0) ? playerState.xpMultiplier * 2 : playerState.xpMultiplier;
        playerState.xp += amount * activeMultiplier;
        
        if (playerState.xp >= playerState.xpNeeded) {
            playerState.xp -= playerState.xpNeeded;
            playerState.level += 1;
            playerState.xpNeeded = Math.floor(playerState.xpNeeded * 1.5);
            playerState.maxEnergy = Math.floor(playerState.maxEnergy * 1.1);
            playerState.currentEnergy = playerState.maxEnergy;

            SoundEngine.playLevelUp();

            showNotification(
                "🎉 Level Up!", 
                `Awesome! You reached Level ${playerState.level}! Max Energy increased to ${playerState.maxEnergy}%!`, 
                "level-up", 
                5000
            );

            if (playerState.level >= 10) unlockCollectionItem("cavern-cup");

            updateMapPageStructure();
        }
        updateStatsUI();
        saveGame();
    }

    // ==================== INVENTORY & SELLING ====================
    function renderInventoryTray() {
        if (!inventoryScroll) return;
        inventoryScroll.innerHTML = '';
    
        labelInvCount.textContent = playerState.inventory.length;
        labelInvMax.textContent = playerState.maxBagCapacity;
    
        if (playerState.inventory.length === 0) {
            inventoryScroll.innerHTML = `<div class="empty-inv" style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">Bag is Empty</div>`;
            return;
        }
    
        playerState.inventory.forEach((item, index) => {
            const card = document.createElement('div');
            
            // 1. Set the visual skin tier based on your stored variant string
            const variantId = item.variant ? item.variant.toLowerCase() : 'normal';
            card.className = `loot-item variant-${variantId}`;
            
            // 2. Calculate the sell price using your precalculated finalValue and sellMultiplier
            const itemPrice = Math.floor((item.finalValue || item.baseValue) * playerState.sellMultiplier);
    
            // 3. Extract the weight value directly from your stored actualWeight
            const displayWeight = item.actualWeight ? item.actualWeight.toFixed(2) : (item.baseWeight || 0.0).toFixed(2);
    
            // 4. Build the dynamic title prefix (omitting 'Normal' and cleaning up the " Mutation" suffix)
            let prefix = '';
            if (item.variant && item.variant !== 'Normal') {
                prefix += `${item.variant} `;
            }
            if (item.mutation && item.mutation !== 'Normal') {
                // Clean the name dynamically (e.g. "Spore Mutation" becomes "Spore")
                const cleanMutation = item.mutation.replace(' Mutation', '');
                prefix += `${cleanMutation} `;
            }
    
            // Render the card displaying both the price and the weight
            card.innerHTML = `
                ${item.isNew ? '<span class="new-badge">New</span>' : ''}
                <span class="loot-icon">${item.icon || '🪨'}</span>
                <div class="loot-details">
                    <span class="loot-name">${prefix}${item.name}</span>
                    <span class="loot-meta">🪙 ${formatMoney(itemPrice)} | ⚖️ ${displayWeight} kg</span>
                </div>
            `;

            // Click to view modal details (now displaying comprehensive RPG stats safely)
            card.addEventListener('click', () => {
                SoundEngine.playClick();
                
                // Clear new status badge if clicked
                if (item.isNew) {
                    item.isNew = false;
                    saveGame();
                    renderInventoryTray();
                }
    
                // Dynamic lookup: Find which cave this ore originates from
                let sourceCave = "Unknown Caverns";
                const foundCave = cavesData.find(c => c.lootPool && c.lootPool.some(o => o.name === item.name));
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
                if (item.mutation && item.mutation !== 'Normal') {
                    const foundMutation = mutationsData.find(m => m.name === item.mutation);
                    if (foundMutation) {
                        description = foundMutation.desc;
                    }
                }
    
                const stats = [
                    { label: "Rarity Class", value: rarityLabels[item.rarity] || item.rarity.toUpperCase() },
                    { label: "Cavern Origin", value: `🧗 ${sourceCave}` },
                    { label: "Specimen Weight", value: `⚖️ ${displayWeight} kg` },
                    { label: "Base Value", value: `🪙 ${formatMoney(item.baseValue)}` },
                    { label: "Variant Modifier", value: `${item.variant || 'Normal'} (x${item.variantMultiplier || 1})` },
                    { label: "Mutational State", value: `${item.mutation || 'Normal'} (x${item.mutationMultiplier || 1})` },
                    { label: "Sell Multiplier", value: `x${playerState.sellMultiplier.toFixed(2)}` },
                    { label: "Total Value", value: `🪙 ${formatMoney(itemPrice)}` }
                ];
    
                openDetailModal(`${prefix}${item.name}`, item.icon || '🪨', description, stats);
            });

            inventoryScroll.appendChild(card);
        });
    }

    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', () => {
            if (playerState.inventory.length === 0) {
                SoundEngine.playError();
                showNotification("Inventory Empty", "You have no ores to sell!", "error");
                return;
            }
        
            let totalEarned = 0;
            playerState.inventory.forEach(item => {
                // Calculate item price directly using your stored finalValue
                const itemPrice = Math.floor((item.finalValue || item.baseValue) * playerState.sellMultiplier);
                totalEarned += itemPrice;
            });
        
            playerState.money += totalEarned;
            playerState.inventory = [];
        
            SoundEngine.playCoin();
            showNotification("Ores Sold!", `Earned 🪙 ${formatMoney(totalEarned)} Coins!`, "sell", 3000);
        
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
            showNotification("🔒 Cavern Locked!", `You need to reach Level ${cave.requiredLevel} to mine here.`, "level-up", 3000);
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
            showNotification("⚡ Out of Energy!", "Eat some food or buy Stamina Brews from the Shop to restore energy.", "shop", 3000);
            if (clickEvent) spawnFloatingText("No Energy! ⚡", clickEvent.clientX, clickEvent.clientY, "float-red");
            return;
        }
        if (playerState.inventory.length >= playerState.maxBagCapacity) {
            SoundEngine.playError();
            showNotification("🎒 Bag Full!", "Click 'Sell All Ores' below to empty your inventory and earn coins.", "sell", 3000);
            if (clickEvent) spawnFloatingText("Bag Full! 🎒", clickEvent.clientX, clickEvent.clientY, "float-red");
            return;
        }

        playerState.currentEnergy -= activeCost;

        const pool = cave.lootPool;
        let totalWeight = 0;
        
        if (!pool) {
            console.error("Critical: Cave lootPool is undefined! Fallback executed.");
            return;
        }

        pool.forEach(ore => {
            let weight = rarityWeights[ore.rarity] || 1000;
            if (playerState.buffs && playerState.buffs.luck > 0 && ore.rarity !== 'common') {
                weight *= 2; 
            }
            totalWeight += weight;
        });

        const roll = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        let selectedOre = pool[0];

        for (let ore of pool) {
            let weight = rarityWeights[ore.rarity] || 1000;
            if (playerState.buffs && playerState.buffs.luck > 0 && ore.rarity !== 'common') {
                weight *= 2;
            }
            cumulativeWeight += weight;
            if (roll <= cumulativeWeight) {
                selectedOre = ore;
                break;
            }
        }

        const rolledVar = rollWeightedSelection(variantsData);
        const weightFluctuation = 0.8 + (Math.random() * 0.4);
        const actualWeight = parseFloat((selectedOre.baseWeight * weightFluctuation).toFixed(2));
        const subTotal = Math.floor((selectedOre.baseValue * rolledVar.multiplier) * actualWeight);
        const rolledMut = rollWeightedSelection(mutationsData);
        const finalValue = Math.floor(subTotal * rolledMut.multiplier);

        const newOre = {
            id: selectedOre.name.toLowerCase().replace(/\s+/g, '-'),
            name: selectedOre.name,
            rarity: selectedOre.rarity,
            baseValue: selectedOre.baseValue,
            baseWeight: selectedOre.baseWeight,
            variant: rolledVar.name,
            variantMultiplier: rolledVar.multiplier,
            actualWeight: actualWeight,
            subTotalValue: subTotal,
            mutation: rolledMut.name,
            mutationMultiplier: rolledMut.multiplier,
            finalValue: finalValue,
            icon: selectedOre.icon,
            isNew: true 
        };

        playerState.inventory.push(newOre);

        // ==================== NEW DYNAMIC MULTI-TIERED UNLOCKS ====================
        const isNormal = (rolledVar.id === "normal") && (rolledMut.id === "none");
        const hasVariantOnly = (rolledVar.id !== "normal") && (rolledMut.id === "none");
        const hasMutationOnly = (rolledVar.id === "normal") && (rolledMut.id !== "none");
        const isHybrid = (rolledVar.id !== "normal") && (rolledMut.id !== "none");

        const oreBaseId = selectedOre.name.toLowerCase().replace(/\s+/g, '-');
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
                `New card unlocked: <strong>${selectedOre.icon} ${selectedOre.name} (${isNormal ? 'Common' : hasVariantOnly ? 'Rare' : hasMutationOnly ? 'Epic' : 'Legendary'})</strong>!`, 
                "collection", 
                6000,
                {
                    label: "View Gallery",
                    callback: () => navigateToView("view-collections") 
                }
            );
            SoundEngine.playUnlock();
            
            // Fix: Re-render collections view to instantly display unlocked ores
            renderCollections();
        }

        if (cave.collectionId) unlockCollectionItem(cave.collectionId);
        if (rolledVar.collectionId) unlockCollectionItem(rolledVar.collectionId);
        if (rolledMut.collectionId) unlockCollectionItem(rolledMut.collectionId);

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
            spawnFloatingText(`-${activeCost}⚡`, x - 30, y, 'float-energy');
            spawnFloatingText(`+${cave.xpReward} XP`, x + 30, y, 'float-xp');
            spawnFloatingText(`+ ${selectedOre.icon} ${rolledVar.name !== 'Normal' ? rolledVar.name + ' ' : ''}${selectedOre.name.split(' ')[0]}`, x, y - 20, 'float-ore');
            
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
                    behavior: 'smooth'
                });
            }
        }, 100);

        setTimeout(() => {
            newOre.isNew = false;
            renderInventoryTray();
        }, 5000);
    }

    // ==================== CAVE GRID RENDERER ====================
    function renderCaves() {
        if (!caveContainer) return;
        caveContainer.innerHTML = '';
        const startIndex = (currentMapPage - 1) * cavesPerPage;
        const endIndex = startIndex + cavesPerPage;

        for (let i = startIndex; i < endIndex; i++) {
            const box = document.createElement('div');
            if (i < cavesData.length) {
                const cave = cavesData[i];
                const isLocked = playerState.level < cave.requiredLevel;

                if (isLocked) {
                    box.className = 'box disabled';
                    box.innerHTML = `<span class="box-title">Locked</span><span style="font-size:0.65rem; color:#bbb; z-index:2;">Lvl ${cave.requiredLevel} Req.</span>`;
                } else {
                    box.className = 'box';
                    box.style.backgroundImage = `url('${cave.image}')`;
                    box.innerHTML = `<span class="box-title">${cave.name}</span><button class="box-btn" data-id="${cave.id}">Mine</button>`;
                    
                    box.addEventListener('click', (e) => {
                        if (e.target.classList.contains('box-btn')) return; 

                        SoundEngine.playClick();

                        const poolLength = cave.lootPool ? cave.lootPool.length : 1;

                        const stats = [
                            { label: "Required Level", value: `Lvl ${cave.requiredLevel}` },
                            { label: "Energy Cost", value: `${cave.energyCost}⚡` },
                            { label: "Standard Ore Pool", value: `${poolLength} Ores` },
                            { label: "XP Reward", value: `+${cave.xpReward} XP` }
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
                box.className = 'box disabled';
                box.innerHTML = `<span class="box-title">Coming Soon</span>`;
            }
            caveContainer.appendChild(box);
        }

        caveContainer.querySelectorAll('.box-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const caveId = parseInt(btn.getAttribute('data-id'));

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
        const w = window.innerWidth, h = window.innerHeight;
        return (w <= 220 || h <= 380) ? 1 : (w <= 330 || h <= 500) ? 2 : 3;
    }

    function updateMapPageStructure() {
        const cols = getGridColumnsCount();
        cavesPerPage = (cols === 3) ? 9 : (cols === 2) ? 4 : 1;
        maxMapPages = Math.ceil(cavesData.length / cavesPerPage);

        if (currentMapPage > maxMapPages) currentMapPage = maxMapPages;
        if (mapPageLabel) mapPageLabel.textContent = `Map ${currentMapPage} / ${maxMapPages}`;
        if (prevMapBtn && nextMapBtn) {
            prevMapBtn.disabled = (currentMapPage === 1);
            nextMapBtn.disabled = (currentMapPage === maxMapPages);
        }
        renderCaves();
    }

    if (prevMapBtn && nextMapBtn) {
        prevMapBtn.addEventListener('click', () => { if (currentMapPage > 1) { currentMapPage--; updateMapPageStructure(); } });
        nextMapBtn.addEventListener('click', () => { if (currentMapPage < maxMapPages) { currentMapPage++; updateMapPageStructure(); } });
    }

    // ==================== SHOP DYNAMIC RENDERER ====================
    function renderShopSubSection(parent, title, subCat, gridClass, cardClass) {
        try {
            const header = document.createElement('h4');
            header.className = 'sub-section-header';
            header.textContent = title;
            parent.appendChild(header);

            const scroll = document.createElement('div');
            scroll.className = 'scroll-container';
            const grid = document.createElement('div');
            grid.className = gridClass;

            const filteredItems = shopData.filter(i => i.category === subCat);
            if (filteredItems.length === 0) {
                console.warn(`No shop items found matching category: ${subCat}`);
            }

            filteredItems.forEach(item => {
                try {
                    const card = document.createElement('div');
                    card.className = cardClass;
                    const isNewItem = item.releaseDate && ((Date.now() - Date.parse(item.releaseDate)) < 3 * 24 * 60 * 60 * 1000);
                    const isNewVersion = item.versionAdded === GAME_VERSION;
                    const showNew = isNewItem || isNewVersion;

                    const premiumCategories = ["money-perks", "packs", "subscriptions", "passes"];
                    const isPremium = premiumCategories.includes(item.category);
                    const currencyIcon = isPremium ? "🎟️" : "🪙";

                    // Check ownership and sequence constraints
                    const isOwned = isShopItemOwned(item);
                    const canBuy = canBuyShopItem(item);
                    
                    // Locate inside renderShopSubSection:
                    let buttonHtml = '';
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
                        ${showNew ? '<span class="new-badge">New</span>' : ''}
                        <div class="rounded-image-icon">${item.icon || '📦'}</div>
                        <span class="wider-card-name">${item.name || 'Unknown Upgrade'}</span>
                        <p class="wider-card-desc">${item.desc || 'No description available.'}</p>
                        ${buttonHtml}`;
                    grid.appendChild(card);
                } catch (itemError) {
                    console.error("Error rendering individual shop item card:", itemError, item);
                }
            });
            scroll.appendChild(grid);
            parent.appendChild(scroll);
        } catch (sectionError) {
            console.error("Error rendering shop sub-section grid:", sectionError, subCat);
        }
    }
    
    // ==================== SHOP PREVIEW MODAL SYSTEM ====================
    function openShopItemDetailModal(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        SoundEngine.playClick();

        const premiumCategories = ["money-perks", "packs", "subscriptions", "passes"];
        const isPremium = premiumCategories.includes(item.category);
        const currencyIcon = isPremium ? "🎟️" : "🪙";

        // Human-readable subtitles for upgrade items
        const categoryLabels = {
            "mining-speed": "⚙️ Mining Speed Upgrade",
            "bag-capacity": "🎒 Bag Capacity Expansion",
            "energy": "🍏 Energy Food & Potions",
            "boosts": "🧪 Temporary Buff Potion",
            "money-perks": "📛 Passive Sell Badge",
            "packs": "🎁 Premium Bundle Pack",
            "subscriptions": "📅 Passive Income Subscription",
            "passes": "🎫 Seasonal Passive Multiplier"
        };

        const stats = [
            { label: "Item Category", value: categoryLabels[item.category] || item.category.toUpperCase() },
            { label: "Upgrade Cost", value: `${currencyIcon} ${formatMoney(item.cost)}` }
        ];

        // Safely extract relevant stats based on item properties
        if (item.category === "mining-speed" && item.multiplier) {
            stats.push({ label: "Mining Multiplier", value: `x${item.multiplier.toFixed(2)}` });
        } else if (item.category === "bag-capacity" && item.capacity) {
            stats.push({ label: "Bag Capacity", value: `${item.capacity} slots` });
        } else if (item.category === "energy" && item.energy) {
            stats.push({ label: "Energy Restored", value: `+${item.energy}⚡` });
        } else if (item.category === "money-perks" && item.multiplier) {
            stats.push({ label: "Gold Earnings Bonus", value: `+${Math.round((item.multiplier - 1) * 100)}% extra gold` });
        } else if (item.category === "boosts" && item.buffType) {
            const buffNames = { luck: "Double Gem Roll Rate", rage: "50% Less Mining Energy Cost", xpBoost: "Double XP Multiplier" };
            stats.push({ label: "Active Effect", value: buffNames[item.buffType] || item.buffType });
            stats.push({ label: "Effect Duration", value: `${item.buffDuration} seconds` });
        }

        if (item.versionAdded) {
            stats.push({ label: "Release Version", value: `v${item.versionAdded}` });
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
        shopSectionsList.innerHTML = '';
        const categories = {"mining-speed": "⚡ Mining Speed", "bag-capacity": "🎒 Bag Capacity", "energy": "🔋 Energy Upgrades", "boosts": "🧪 Boosts & Potions", "money-perks": "🪙 Money Perks"};

        Object.keys(categories).forEach(catKey => {
            const section = document.createElement('section');
            section.className = 'shop-section';
            section.setAttribute('data-category', catKey);
            section.innerHTML = `<h3 class="section-header">${categories[catKey]}</h3>`;

            if (catKey !== "money-perks") {
                const scroll = document.createElement('div');
                scroll.className = 'scroll-container';
                const grid = document.createElement('div');
                grid.className = 'portrait-grid';

                shopData.filter(i => i.category === catKey).forEach(item => {
                    try {
                        const card = document.createElement('div');
                        card.className = 'portrait-card';

                        const isNewItem = item.releaseDate && ((Date.now() - Date.parse(item.releaseDate)) < 3 * 24 * 60 * 60 * 1000);
                        const isNewVersion = item.versionAdded === GAME_VERSION;
                        const showNew = isNewItem || isNewVersion;

                        const isOwned = isShopItemOwned(item);
                        const canBuy = canBuyShopItem(item);

                        // Locate inside renderShop (under catKey !== "money-perks" loop):
                        let buttonHtml = '';
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
                            ${showNew ? '<span class="new-badge">New</span>' : ''}
                            <div class="circle-icon">${item.icon || '🛠️'}</div>
                            <span class="card-name">${item.name || 'Upgrade'}</span>
                            <p class="card-desc">${item.desc || 'No description available.'}</p>
                            ${buttonHtml}
                        `;
                        grid.appendChild(card);
                    } catch (itemError) {
                        console.error("Error rendering standard shop card:", itemError, item);
                    }
                });
                scroll.appendChild(grid);
                section.appendChild(scroll);
            } else {
                // Upgrades, Bundles, and Subscriptions rendering
                renderShopSubSection(section, '📛 Upgrades & Badges', 'money-perks', 'wider-grid', 'wider-card');
                renderShopSubSection(section, '🎁 Bundles & Packs', 'packs', 'wider-grid', 'wider-card');
                renderShopSubSection(section, '📅 Subscriptions', 'subscriptions', 'wider-grid', 'wider-card');

                // Safe passes rendering block
                try {
                    const passHeader = document.createElement('h4');
                    passHeader.className = 'sub-section-header';
                    passHeader.textContent = '🎫 Season Passes';
                    section.appendChild(passHeader);

                    const passesList = document.createElement('div');
                    passesList.className = 'passes-list';

                    shopData.filter(i => i.category === 'passes').forEach(pass => {
                        try {
                            const card = document.createElement('div');
                            card.className = 'pass-card';
                            const isBought = pass.id === 'double-xp-pass' && playerState.xpMultiplier === 2.0;
                            card.setAttribute('data-bought', isBought ? 'true' : 'false');

                            card.innerHTML = `
                                <div class="pass-header">
                                    <span class="pass-card-title">${pass.icon} ${pass.name}</span>
                                    <div class="pass-controls">
                                        ${isBought ? '<span class="owned-badge">Owned</span>' : '<button class="pass-header-buy-btn" data-id="' + pass.id + '">🎟️ ' + pass.cost + '</button>'}
                                        <button class="pass-toggle-btn">▼</button>
                                    </div>
                                </div>
                                <div class="pass-content">
                                    <div class="pass-rewards-placeholder">
                                        <h5>🌟 Benefit Details</h5>
                                        <p>${pass.desc}</p>
                                    </div>
                                    ${isBought ? '<div class="pass-owned-placeholder">✓ Already Owned & Active</div>' : '<button class="pass-content-buy-btn" data-id="' + pass.id + '">🎟️ Buy Pass (' + pass.cost + ')</button>'}
                                </div>`;

                            const toggleBtn = card.querySelector('.pass-toggle-btn');
                            if (toggleBtn) {
                                toggleBtn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    card.classList.toggle('expanded');
                                });
                            }
                            passesList.appendChild(card);
                        } catch (passError) {
                            console.error("Error rendering pass card:", passError, pass);
                        }
                    });
                    section.appendChild(passesList);
                } catch (passesSectionError) {
                    console.error("Error rendering passes sub-section:", passesSectionError);
                }
            }
            shopSectionsList.appendChild(section);
        });

        shopSectionsList.querySelectorAll('.card-buy-btn, .wider-card-btn, .pass-header-buy-btn, .pass-content-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openShopItemDetailModal(btn.getAttribute('data-id')); 
            });
        });
    }
    
    function buyShopItem(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        // 1. Ownership and Sequence Safety Guards
        if (isShopItemOwned(item)) {
            SoundEngine.playError();
            showNotification("Upgrade Active", "You already own this upgrade!", "error");
            return;
        }

        if (!canBuyShopItem(item)) {
            SoundEngine.playError();
            showNotification("Locked Upgrade", `You must purchase the previous upgrades in this category first!`, "error", 4000);
            return;
        }

        const premiumCategories = ["money-perks", "packs", "subscriptions", "passes"];
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
        } else if (item.category === "money-perks") {
            if (item.id === "magnet-badge") {
                playerState.hasMagnet = true;
            } else {
                playerState.sellMultiplier = Math.max(playerState.sellMultiplier, item.multiplier);
            }
        } else if (item.category === "packs") {
            if (item.id === "starter-bundle") {
                playerState.hasStarterBundle = true;
                playerState.money += 500;
                playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + 50);
            } else if (item.id === "miner-pack") {
                playerState.hasMinerPack = true;
                playerState.money += 2000;
                playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + 100);
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
            }
        }

        SoundEngine.playCoin();

        // Updated Notification to reflect the full energy restored
        showNotification(
            "🛒 Item Purchased!", 
            `Successfully obtained ${item.name}! Paid 🪙 ${formatMoney(item.cost)} Coins to restore +${item.energy}⚡ energy.`, 
            "shop", 
            4000
        );
        
        saveGame();
        updateStatsUI();
        renderShop();
        renderBuffsUI(); 
        updateMapPageStructure();
    }

    // ==================== COLLECTIONS RENDERER ====================
    function renderColSubSection(parent, title, subCat) {
        const header = document.createElement('h4');
        header.className = 'col-sub-header';
        header.textContent = title;
        parent.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'col-grid';

        collectionsData.filter(c => c.category === 'awards' && c.subCategory === subCat).forEach(item => {
            grid.appendChild(createColCard(item));
        });
        parent.appendChild(grid);
    }

    // Unified dynamic Collection Card builder
    function createColCard(item) {
        const card = document.createElement('div');
        card.className = 'col-card';
        card.innerHTML = `
            ${item.isNew ? '<span class="new-badge">New</span>' : ''}
            <div class="col-icon-circle">${item.obtained ? item.icon : '❓'}</div>
            <h4 class="col-card-title">${item.obtained ? item.name : 'Unknown'}</h4>
            <p class="col-card-desc">${item.obtained ? item.desc : 'Keep mining layers to unlock details.'}</p>
            <button class="col-read-more" ${item.obtained ? '' : 'disabled'}>Read more</button>`;
        
        if (item.obtained) {
            const readMoreBtn = card.querySelector('.col-read-more');
            readMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundEngine.playClick();
                
                // Base categories stats
                const stats = [
                    { label: "Category", value: item.category.toUpperCase() }
                ];
                if (item.subCategory) {
                    stats.push({ label: "Sub-Type", value: item.subCategory.toUpperCase() });
                }
                
                // NEW: Dynamic check. If the data object has a multiplier, show it!
                if (item.multiplier) {
                    stats.push({ label: "Final Multiplier", value: item.multiplier });
                }
                
                // NEW: Dynamic check. If the data object has a speed bonus, show it!
                if (item.speedBonus) {
                    stats.push({ label: "Mining Efficiency", value: item.speedBonus });
                }
                
                openDetailModal(
                    item.name, 
                    item.icon, 
                    item.desc, 
                    stats
                );
            });
        }

        return card;
    }

    function renderCollections() {
        if (!colSectionsList) return;
        colSectionsList.innerHTML = '';
        
        try {
            const categories = {"caves": "🧗 Caves Discovery", "pickaxes": "⛏️ Pickaxes", "ores": "🪨 Ores Tiers", "mutations": "⚛️ Mutations", "awards": "🏆 Awards"};

            Object.keys(categories).forEach(catKey => {
                const section = document.createElement('section');
                section.className = 'col-section';
                section.setAttribute('data-category', catKey);
                section.innerHTML = `<h3 class="col-section-header">${categories[catKey]}</h3>`;

                if (catKey !== "awards" && catKey !== "ores") {
                    const grid = document.createElement('div');
                    grid.className = 'col-grid';
                    collectionsData.filter(c => c.category === catKey).forEach(item => {
                        grid.appendChild(createColCard(item));
                    });
                    section.appendChild(grid);
                } else if (catKey === "ores") {
                    // Programmatically generate 320 cards based on our cave loot pools!
                    cavesData.forEach(cave => {
                        try {
                            const subHeader = document.createElement('h4');
                            subHeader.className = 'col-sub-header';
                            subHeader.textContent = `🪨 ${cave.name} Ores`;
                            section.appendChild(subHeader);

                            const grid = document.createElement('div');
                            grid.className = 'col-grid';

                            if (cave.lootPool) {
                                cave.lootPool.forEach(ore => {
                                    try {
                                        const oreBaseId = ore.name.toLowerCase().replace(/\s+/g, '-');
                                        const tiers = [
                                            { id: `${oreBaseId}-normal`, suffix: "Normal", tierLabel: "Common", desc: `Standard unrefined ${ore.name} sample.` },
                                            { id: `${oreBaseId}-variant`, suffix: "Variant (Rare)", tierLabel: "Rare", desc: `High density polished ${ore.name} variant.` },
                                            { id: `${oreBaseId}-mutation`, suffix: "Mutated (Epic)", tierLabel: "Epic", desc: `${ore.name} sample displaying high energetic spore/toxic mutations.` },
                                            { id: `${oreBaseId}-hybrid`, suffix: "Hybrid (Legendary)", tierLabel: "Legendary", desc: `Legendary combination drop: variant mutated ${ore.name}!` }
                                        ];

                                        tiers.forEach(tier => {
                                            const isObtained = playerState.unlockedOres && playerState.unlockedOres[tier.id] === true;
                                            const card = document.createElement('div');
                                            card.className = 'col-card';
                                            card.innerHTML = `
                                                <div class="col-icon-circle">${isObtained ? ore.icon : '❓'}</div>
                                                <h4 class="col-card-title">${isObtained ? ore.name + ' - ' + tier.suffix : 'Unknown'}</h4>
                                                <p class="col-card-desc">${isObtained ? tier.desc : 'Mine in ' + cave.name + ' to unlock details.'}</p>
                                                <button class="col-read-more" ${isObtained ? '' : 'disabled'}>Read more</button>
                                            `;

                                            if (isObtained) {
                                                const readBtn = card.querySelector('.col-read-more');
                                                if (readBtn) {
                                                    readBtn.addEventListener('click', (e) => {
                                                        e.stopPropagation();
                                                        SoundEngine.playClick();
                                                        const stats = [
                                                            { label: "Cavern", value: cave.name },
                                                            { label: "Rarity Tier", value: ore.rarity.toUpperCase() },
                                                            { label: "Card Grade", value: tier.tierLabel.toUpperCase() },
                                                            { label: "Base Weight", value: `${ore.baseWeight} kg` },
                                                            { label: "Base Value", value: `🪙 ${ore.baseValue}` }
                                                        ];
                                                        openDetailModal(`${ore.name} (${tier.suffix})`, ore.icon, tier.desc, stats);
                                                    });
                                                }
                                            }
                                            grid.appendChild(card);
                                        });
                                    } catch (oreError) {
                                        console.error("Error rendering ore tier card:", oreError, ore);
                                    }
                                });
                            }
                            section.appendChild(grid);
                        } catch (caveError) {
                            console.error("Error rendering cave collections:", caveError, cave);
                        }
                    });
                } else {
                    renderColSubSection(section, '🏆 Trophies (Quest Chests)', 'trophies');
                    renderColSubSection(section, '🏷️ Badges (Quest Tasks)', 'badges');
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
            if (item.category === "awards" && !item.obtained && item.conditionType) {
                let isEligible = false;
                if (item.conditionType === "level" && playerState.level >= item.conditionValue) isEligible = true;
                else if (item.conditionType === "mines" && totalMinesCount >= item.conditionValue) isEligible = true;
                else if (item.conditionType === "money" && playerState.money >= item.conditionValue) isEligible = true;
                if (isEligible) unlockCollectionItem(item.id);
            }
        });
    }

    // ==================== SEARCH/FILTER SYSTEM ====================
    function filterShopItems() {
        const q = shopSearchInput.value.toLowerCase().trim();
        const cat = shopSectionFilter.value;

        shopSectionsList.querySelectorAll('.shop-section').forEach(sec => {
            const secCat = sec.getAttribute('data-category');
            const matchCat = (cat === 'all' || secCat === cat);
            const cards = sec.querySelectorAll('.portrait-card, .wider-card, .pass-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const nameEl = card.querySelector('.card-name, .wider-card-name, .pass-card-title');
                const nameText = nameEl ? nameEl.textContent.toLowerCase() : '';
                const matchSearch = nameText.includes(q);

                card.style.display = matchSearch ? '' : 'none';
                if (matchSearch) visibleCount++;
            });
            sec.style.display = (matchCat && visibleCount > 0) ? '' : 'none';
        });
    }

    function filterCollectionItems() {
        const q = colSearchInput.value.toLowerCase().trim(), cat = colSectionFilter.value;
        colSectionsList.querySelectorAll('.col-section').forEach(sec => {
            const secCat = sec.getAttribute('data-category'), matchCat = (cat === 'all' || secCat === cat);
            const cards = sec.querySelectorAll('.col-card'); let visibleCount = 0;

            cards.forEach(card => {
                const titleEl = card.querySelector('.col-card-title'), titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
                const matchSearch = titleText.includes(q); card.style.display = matchSearch ? '' : 'none';
                if (matchSearch) visibleCount++;
            });
            sec.style.display = (matchCat && visibleCount > 0) ? '' : 'none';
        });
    }

    if (shopSearchInput && shopSectionFilter) {
        shopSearchInput.addEventListener('input', filterShopItems);
        shopSectionFilter.addEventListener('change', filterShopItems);
    }

    if (colSearchInput && colSectionFilter) {
        colSearchInput.addEventListener('input', filterCollectionItems);
        colSectionFilter.addEventListener('change', filterCollectionItems);
    }

    // ==================== TAB SWITCHER & TOGGLES ====================
    
    // Set initial view visibility inline to prevent stylesheet timing issues
    gameViews.forEach(view => {
        if (view.classList.contains('active')) {
            view.style.display = 'flex';
        } else {
            view.style.display = 'none';
        }
    });

    // Tab switcher with absolute inline-style display overrides & dynamic re-rendering
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Safe click propagation lock
            SoundEngine.playClick();

            // Toggle active styling on navigation list options
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            // Force hide all viewport wrappers to prevent display conflicts
            gameViews.forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none'; // Overrides CSS caching bugs
            });

            // Force display active viewport
            const targetId = link.getAttribute('data-view');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'flex'; // Overrides CSS caching bugs
                
                // Re-render target views dynamically on click so stats are always up to date
                if (targetId === "view-readme") loadReadmeFile();
                if (targetId === "view-shop") renderShop();
                if (targetId === "view-collections") renderCollections();
            }

            // Auto-close sidebar on mobile viewports
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfile.classList.toggle('active');
        });
    }

    window.addEventListener('click', () => {
        if (userProfile && userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
        }
    });

    // 1. Account Dropdown Option (Displays real-time stats inside unified modal)
    if (dropdownAccount) {
        dropdownAccount.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            SoundEngine.playClick();
            
            const stats = [
                { label: "Level Progress", value: `Lvl ${playerState.level}` },
                { label: "XP", value: `${playerState.xp} / ${playerState.xpNeeded}` },
                { label: "Total Coins", value: `🪙 ${formatMoney(playerState.money)}` },
                { label: "Bag Space", value: `${playerState.inventory.length} / ${playerState.maxBagCapacity}` },
                { label: "Active Pick speed multiplier", value: `${playerState.activePickaxeMultiplier}x` }
            ];

            openDetailModal(
                "Miner Profile", 
                "👤", 
                `Cavern records and operational statistics for ${playerState.username ? playerState.username : "Miner Joe"}.`, 
                stats
            );
        });
    }

    if (dropdownSettings) {
        dropdownSettings.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            playerState.soundsMuted = !playerState.soundsMuted;
            
            // Correctly toggling between the Solid Font Awesome volume icons
            dropdownSettings.innerHTML = playerState.soundsMuted 
                ? `<i class="fa-solid fa-volume-xmark fa-fw"></i> Unmute Sounds` 
                : `<i class="fa-solid fa-volume-high fa-fw"></i> Mute Sounds`;

            showNotification(
                playerState.soundsMuted ? "🔈 Caverns Silenced" : "🔊 Caverns Active", 
                playerState.soundsMuted ? "All sound effects are now muted." : "Cavern sound effects are now active!", 
                "shop", 
                3000
            );

            saveGame();
            SoundEngine.playClick();
        });
    }

    if (dropdownSignOut) {
        dropdownSignOut.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            SoundEngine.playError();
            
            // Custom confirmation modal popup
            openDetailModal(
                "Reset Cavern Progress?",
                "🚪",
                "Are you sure you want to sign out and clear your session? This will permanently delete your coin balance, levels, inventory, and unlocked collections!",
                [],
                {
                    label: "RESET EVERYTHING",
                    callback: () => {
                        localStorage.clear();
                        window.location.reload();
                    }
                }
            );
        });
    }
    
    // ==================== COIN TO TOKEN CONVERSION CONTROLLER ====================
    const convertOneBtn = document.getElementById('convertOneBtn');
    const convertAllBtn = document.getElementById('convertAllBtn'); // <-- Updated Selector

    // Token Exchange Rate Constant (1 Token = 10,000 Gold Coins)
    const TOKEN_EXCHANGE_RATE = 10000;

    if (convertOneBtn) {
        convertOneBtn.addEventListener('click', () => {
            if (playerState.money >= TOKEN_EXCHANGE_RATE) {
                playerState.money -= TOKEN_EXCHANGE_RATE;
                playerState.tokens += 1;
                SoundEngine.playCoin();
                showNotification("Exchange Successful!", `Converted 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins into 🎟️ 1 Premium Token!`, "shop", 3000);
                saveGame();
                updateStatsUI();
                renderShop();
            } else {
                SoundEngine.playError();
                showNotification("Insufficient Coins!", `You need 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins to convert 1 Token.`, "sell", 3000);
            }
        });
    }

    if (convertAllBtn) {
        convertAllBtn.addEventListener('click', () => {
            // Calculate how many tokens the player can buy with their entire balance
            const tokensToBuy = Math.floor(playerState.money / TOKEN_EXCHANGE_RATE);
            
            if (tokensToBuy > 0) {
                const totalCost = tokensToBuy * TOKEN_EXCHANGE_RATE;
                playerState.money -= totalCost;
                playerState.tokens += tokensToBuy;
                SoundEngine.playCoin();
                showNotification("Exchange Successful!", `Converted 🪙 ${formatMoney(totalCost)} Coins into 🎟️ ${tokensToBuy} Premium Tokens!`, "shop", 3000);
                saveGame();
                updateStatsUI();
                renderShop();
            } else {
                SoundEngine.playError();
                showNotification("Insufficient Coins!", `You need at least 🪙 ${formatMoney(TOKEN_EXCHANGE_RATE)} Coins to exchange for a Token.`, "sell", 3000);
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
                                        showNotification("🎉 Tutorial Complete!", "Your underground adventure begins now. Collect them all!", "level-up", 4000);
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
        saveNameBtn.addEventListener('click', () => {
            SoundEngine.playCoin();
            const inputVal = usernameInput.value.trim(); 
            playerState.username = inputVal ? inputVal : "Miner Joe";
            saveGame(); 
            updateStatsUI(); 
            nameModal.classList.remove('active');
            
            // Welcome notification
            showNotification(`👋 Welcome ${playerState.username}!`, "Let's enter the caverns and mine some valuable resources!", "level-up", 5000);
            
            // Trigger the step-by-step tutorial tour immediately after name submission
            setTimeout(startTutorial, 800);
        });
    }

    function checkUserRegistration() {
        if (!playerState.username) {
            if (nameModal) {
                nameModal.classList.add('active');
            }
        }
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            SoundEngine.playClick();
            sidebar.classList.toggle('open');
        });
    }
    
    // ==================== DAILY CLAIM CONTROLLER ====================
    const dailyClaimBtn = document.getElementById('dailyClaimBtn');

    if (dailyClaimBtn) {
        dailyClaimBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            SoundEngine.playClick();

            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const timePassed = now - playerState.lastClaimTime;

            if (timePassed < cooldown) {
                // Calculation of remaining cooldown hours and minutes
                const timeLeft = cooldown - timePassed;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                SoundEngine.playError();
                showNotification(
                    "⏳ Claim Cooldown", 
                    `Your Daily Gift is charging. Come back in <strong>${hours}h ${minutes}m</strong>!`, 
                    "shop", 
                    3500
                );
            } else {
                // Random prizes scaling with player level
                const goldReward = 500 + Math.floor(Math.random() * 1001) + (playerState.level * 50);
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
                        { label: "Coins Awarded", value: `🪙 +${formatMoney(goldReward)}` },
                        { label: "Tokens Awarded", value: `🎟️ +${tokenReward}` }
                    ]
                );

                saveGame();
                updateStatsUI();
                renderShop();
            }
        });
    }
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea && sidebar) {
        gameArea.addEventListener('click', () => {
            if (window.innerWidth < 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMapPageStructure();
        }, 100);
    });

    // ==================== INITIAL GESTURE TRIGGER ====================
    document.body.addEventListener('click', () => {
        SoundEngine.init();
    }, { once: true });

    // ==================== INITIALIZATION ====================
    loadGame(); // Restore progress from local storage on reload
    checkUserRegistration(); // Call registration check on load
    updateMapPageStructure();
    updateStatsUI();
    renderInventoryTray();
    renderShop();
    renderCollections();
});