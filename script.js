document.addEventListener('DOMContentLoaded', () => {
    // ==================== SESSION STATE ====================
    const playerState = {
        level: 1, xp: 0, xpNeeded: 100, money: 200, maxBagCapacity: 20,
        currentEnergy: 100, maxEnergy: 100, activePickaxeMultiplier: 1.0,
        xpMultiplier: 1.0, inventory: []
    };

    // ==================== SELECTORS ====================
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const gameViews = document.querySelectorAll('.game-view');
    const userProfile = document.getElementById('userProfile');

    const labelLevel = document.getElementById('player-level');
    const labelXp = document.getElementById('player-xp');
    const labelMoney = document.getElementById('player-money');
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

    let currentMapPage = 1, cavesPerPage = 9, maxMapPages = 1, totalMinesCount = 0;

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
                Object.assign(playerState, parsed);
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
                    }
                });
            } catch (err) {
                console.error("Collections load failed: ", err);
            }
        }
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

    function rollChestSpawn() {
        if (Math.random() <= 0.08) {
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
                
                // Fix: Instantly lock clicks to block mobile multi-tap exploits
                chest.style.pointerEvents = 'none';

                const rewardGold = 40 + Math.floor(Math.random() * 61); 
                playerState.money += rewardGold;

                spawnFloatingText(`+🪙 ${rewardGold}`, e.clientX, e.clientY, 'float-gold');
                showNotification("🎁 Gift Opened!", `Unlocked 🪙 ${rewardGold} Coins from a Cavern Chest!`, "sell", 3500);

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
        if (labelXp) labelXp.textContent = playerState.xp;
        if (labelMoney) labelMoney.textContent = playerState.money;
        if (labelOres) labelOres.textContent = playerState.inventory.length;
        if (labelCapacity) labelCapacity.textContent = playerState.maxBagCapacity;
        if (labelEnergy) labelEnergy.textContent = `${Math.floor(playerState.currentEnergy)}%`;
        if (labelInvCount) labelInvCount.textContent = playerState.inventory.length;
        if (labelInvMax) labelInvMax.textContent = playerState.maxBagCapacity;
    }

    function awardXp(amount) {
        playerState.xp += amount * playerState.xpMultiplier;
        if (playerState.xp >= playerState.xpNeeded) {
            playerState.xp -= playerState.xpNeeded;
            playerState.level += 1;
            playerState.xpNeeded = Math.floor(playerState.xpNeeded * 1.5);
            playerState.maxEnergy = Math.floor(playerState.maxEnergy * 1.1);
            playerState.currentEnergy = playerState.maxEnergy;

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
        if (playerState.inventory.length === 0) {
            inventoryScroll.innerHTML = '<span style="color: #666; font-size: 0.75rem; margin: auto;">Your bag is empty. Start mining!</span>';
            return;
        }
        playerState.inventory.forEach(ore => {
            const card = document.createElement('div');
            card.className = 'loot-item';
            if (ore.variant === 'Rainbow' || ore.mutation === 'Cosmic') {
                card.style.borderColor = 'var(--gold-accent)';
                card.style.boxShadow = '0 0 4px rgba(255, 204, 0, 0.4)';
            }
            // Safe fallback value check for loaded legacy save data
            const goldVal = ore.finalValue !== undefined ? ore.finalValue : 10;
            card.innerHTML = `
                <span class="loot-icon">${ore.icon}</span>
                <div class="loot-details">
                    <span class="loot-name">${ore.variant !== 'Normal' ? ore.variant + ' ' : ''}${ore.name}</span>
                    <span class="loot-meta">${ore.actualWeight}kg | 🪙${goldVal}${ore.mutation !== 'Normal' ? ' (' + ore.mutation + ')' : ''}</span>
                </div>`;
            inventoryScroll.appendChild(card);
        });
    }

    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', (e) => {
            const count = playerState.inventory.length;
            if (count === 0) return;
            let totalGold = 0;
            playerState.inventory.forEach(o => {
                // Safe fallback value check for loaded legacy save data
                totalGold += o.finalValue !== undefined ? o.finalValue : 10;
            });
            playerState.money += totalGold;
            playerState.inventory = [];
            
            spawnFloatingText(`+🪙 ${totalGold}`, e.clientX, e.clientY, 'float-gold');
            
            showNotification(
                "🪙 Ores Sold!", 
                `Traded ${count} ores at market for 🪙 ${totalGold} Coins!`, 
                "sell", 
                4000
            );

            updateStatsUI();
            renderInventoryTray();
            saveGame();
        });
    }

    // ==================== CORE MINING CALCULATOR ====================
    function mineCave(caveId, clickEvent) {
        const cave = cavesData.find(c => c.id === caveId);
        if (!cave) return;

        // Interactive UX warning feedback on validation checks
        if (playerState.level < cave.requiredLevel) {
            showNotification("🔒 Cavern Locked!", `You need to reach Level ${cave.requiredLevel} to mine here.`, "level-up", 3000);
            return;
        }
        if (playerState.currentEnergy < cave.energyCost) {
            showNotification("⚡ Out of Energy!", "Eat some food or buy Stamina Brews from the Shop to restore energy.", "shop", 3000);
            if (clickEvent) spawnFloatingText("No Energy! ⚡", clickEvent.clientX, clickEvent.clientY, "float-red");
            return;
        }
        if (playerState.inventory.length >= playerState.maxBagCapacity) {
            showNotification("🎒 Bag Full!", "Click 'Sell All Ores' below to empty your inventory and earn coins.", "sell", 3000);
            if (clickEvent) spawnFloatingText("Bag Full! 🎒", clickEvent.clientX, clickEvent.clientY, "float-red");
            return;
        }

        playerState.currentEnergy -= cave.energyCost;
        const rolledVar = rollWeightedSelection(variantsData);
        const actualWeight = parseFloat((cave.baseWeight * (0.8 + Math.random() * 0.4)).toFixed(2));
        const subTotal = Math.floor((cave.baseValue * rolledVar.multiplier) * actualWeight);
        const rolledMut = rollWeightedSelection(mutationsData);

        playerState.inventory.push({
            id: cave.oreName.toLowerCase().replace(/\s+/g, '-'), name: cave.oreName,
            baseValue: cave.baseValue, baseWeight: cave.baseWeight,
            variant: rolledVar.name, variantMultiplier: rolledVar.multiplier,
            actualWeight: actualWeight, subTotalValue: subTotal,
            mutation: rolledMut.name, mutationMultiplier: rolledMut.multiplier,
            finalValue: Math.floor(subTotal * rolledMut.multiplier), icon: cave.oreIcon
        });

        if (cave.collectionId) unlockCollectionItem(cave.collectionId);
        if (rolledVar.collectionId) unlockCollectionItem(rolledVar.collectionId);
        if (rolledMut.collectionId) unlockCollectionItem(rolledMut.collectionId);

        totalMinesCount++;
        if (totalMinesCount >= 100) unlockCollectionItem("hard-worker");

        if (clickEvent) {
            const x = clickEvent.clientX;
            const y = clickEvent.clientY;
            spawnFloatingText(`-${cave.energyCost}⚡`, x - 30, y, 'float-energy');
            spawnFloatingText(`+${cave.xpReward} XP`, x + 30, y, 'float-xp');
            spawnFloatingText(`+ ${cave.oreIcon} ${rolledVar.name !== 'Normal' ? rolledVar.name + ' ' : ''}${cave.oreName.split(' ')[0]}`, x, y - 20, 'float-ore');
        }

        rollChestSpawn();
        awardXp(cave.xpReward);
        renderInventoryTray();
        saveGame();
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

                // Defensive Cooldown execution
                btn.disabled = true;
                btn.textContent = "Mining...";

                try {
                    mineCave(caveId, e);
                } catch (error) {
                    console.error("Mining logic execution failed: ", error);
                } finally {
                    // This block always triggers, preventing the cooldown from locking up
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
        const header = document.createElement('h4');
        header.className = 'sub-section-header';
        header.textContent = title;
        parent.appendChild(header);

        const scroll = document.createElement('div');
        scroll.className = 'scroll-container';
        const grid = document.createElement('div');
        grid.className = gridClass;

        shopData.filter(i => i.category === subCat).forEach(item => {
            const card = document.createElement('div');
            card.className = cardClass;
            card.innerHTML = `
                <div class="rounded-image-icon">${item.icon}</div>
                <span class="wider-card-name">${item.name}</span>
                <p class="wider-card-desc">${item.desc}</p>
                <button class="wider-card-btn" data-id="${item.id}">Buy ${item.cost}</button>`;
            grid.appendChild(card);
        });
        scroll.appendChild(grid);
        parent.appendChild(scroll);
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
                    grid.innerHTML += `
                        <div class="portrait-card">
                            <div class="circle-icon">${item.icon}</div>
                            <span class="card-name">${item.name}</span>
                            <p class="card-desc">${item.desc}</p>
                            <button class="card-buy-btn" data-id="${item.id}">🪙 ${item.cost}</button>
                        </div>`;
                });
                scroll.appendChild(grid);
                section.appendChild(scroll);
            } else {
                renderShopSubSection(section, '🎁 Bundles & Packs', 'packs', 'wider-grid', 'wider-card');
                renderShopSubSection(section, '📅 Subscriptions', 'subscriptions', 'wider-grid', 'wider-card');

                const passHeader = document.createElement('h4');
                passHeader.className = 'sub-section-header';
                passHeader.textContent = '🎫 Season Passes';
                section.appendChild(passHeader);

                const passesList = document.createElement('div');
                passesList.className = 'passes-list';

                shopData.filter(i => i.category === 'passes').forEach(pass => {
                    const card = document.createElement('div');
                    card.className = 'pass-card';
                    const isBought = pass.id === 'double-xp-pass';
                    card.setAttribute('data-bought', isBought ? 'true' : 'false');

                    card.innerHTML = `
                        <div class="pass-header">
                            <span class="pass-card-title">${pass.icon} ${pass.name}</span>
                            <div class="pass-controls">
                                ${isBought ? '<span class="owned-badge">Owned</span>' : '<button class="pass-header-buy-btn" data-id="' + pass.id + '">Buy ' + pass.cost + '</button>'}
                                <button class="pass-toggle-btn">▼</button>
                            </div>
                        </div>
                        <div class="pass-content">
                            <div class="pass-rewards-placeholder">
                                <h5>🌟 Benefit Details</h5>
                                <p>${pass.desc}</p>
                            </div>
                            ${isBought ? '<div class="pass-owned-placeholder">✓ Already Owned & Active</div>' : '<button class="pass-content-buy-btn" data-id="' + pass.id + '">Buy Pass (' + pass.cost + ')</button>'}
                        </div>`;

                    card.querySelector('.pass-toggle-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        card.classList.toggle('expanded');
                    });
                    passesList.appendChild(card);
                });
                section.appendChild(passesList);
            }
            shopSectionsList.appendChild(section);
        });

        shopSectionsList.querySelectorAll('.card-buy-btn, .wider-card-btn, .pass-header-buy-btn, .pass-content-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                buyShopItem(btn.getAttribute('data-id'));
            });
        });
    }

    function buyShopItem(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        if (item.isIAP) {
            alert(`Purchase success for ${item.name}! (Simulated IAP)`);
            if (item.id === "double-xp-pass") playerState.xpMultiplier = 2.0;
            saveGame();
            renderShop();
            return;
        }

        if (playerState.money < item.cost) {
            alert("Not enough coins!");
            return;
        }

        playerState.money -= item.cost;
        if (item.collectionId) {
            unlockCollectionItem(item.collectionId);
        }

        if (item.category === "mining-speed") {
            playerState.activePickaxeMultiplier = item.multiplier;
        } else if (item.category === "bag-capacity") {
            playerState.maxBagCapacity = item.capacity;
        } else if (item.category === "energy") {
            playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + item.energy);
        }

        showNotification(
            "🛒 Item Purchased!", 
            `Successfully obtained ${item.name}! Applied active stat adjustments.`, 
            "shop", 
            4000
        );
        
        saveGame();
        updateStatsUI();
        renderShop();
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

    function createColCard(item) {
        const card = document.createElement('div');
        card.className = 'col-card';
        card.innerHTML = `
            <div class="col-icon-circle">${item.obtained ? item.icon : '❓'}</div>
            <h4 class="col-card-title">${item.obtained ? item.name : 'Unknown'}</h4>
            <p class="col-card-desc">${item.obtained ? item.desc : 'Keep mining layers to unlock details.'}</p>
            <button class="col-read-more" ${item.obtained ? '' : 'disabled'}>Read more</button>`;
        return card;
    }

    function renderCollections() {
        if (!colSectionsList) return;
        colSectionsList.innerHTML = '';
        const categories = {"pickaxes": "⛏️ Pickaxes", "ores": "🪨 Ores", "mutations": "⚛️ Mutations", "awards": "🏆 Awards"};

        Object.keys(categories).forEach(catKey => {
            const section = document.createElement('section');
            section.className = 'col-section';
            section.setAttribute('data-category', catKey);
            section.innerHTML = `<h3 class="col-section-header">${categories[catKey]}</h3>`;

            if (catKey !== "awards") {
                const grid = document.createElement('div');
                grid.className = 'col-grid';
                collectionsData.filter(c => c.category === catKey).forEach(item => {
                    grid.appendChild(createColCard(item));
                });
                section.appendChild(grid);
            } else {
                renderColSubSection(section, '🏆 Trophies (Quest Chests)', 'trophies');
                renderColSubSection(section, '🏷️ Badges (Quest Tasks)', 'badges');
            }
            colSectionsList.appendChild(section);
        });
    }

    function unlockCollectionItem(itemId) {
        const item = collectionsData.find(c => c.id === itemId);
        if (item && !item.obtained) {
            item.obtained = true;

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
        }
    }

    function updateHardWorkerBadge() {
        if (totalMinesCount >= 100) {
            unlockCollectionItem("hard-worker");
        }
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
        const q = colSearchInput.value.toLowerCase().trim();
        const cat = colSectionFilter.value;

        colSectionsList.querySelectorAll('.col-section').forEach(sec => {
            const secCat = sec.getAttribute('data-category');
            const matchCat = (cat === 'all' || secCat === cat);
            const cards = sec.querySelectorAll('.col-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const titleEl = card.querySelector('.col-card-title');
                const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
                const matchSearch = titleText.includes(q);

                card.style.display = matchSearch ? '' : 'none';
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

    // Tab switcher with absolute inline-style display overrides
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Safe click propagation lock

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

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
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

    // ==================== INITIALIZATION ====================
    loadGame(); // Restore progress from local storage on reload
    updateMapPageStructure();
    updateStatsUI();
    renderInventoryTray();
    renderShop();
    renderCollections();
});