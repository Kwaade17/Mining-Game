document.addEventListener('DOMContentLoaded', () => {
    // ==================== SESSION STATE ====================
    const playerState = {
        level: 1,
        xp: 0,
        xpNeeded: 100,
        money: 200,             // Starting Coins
        maxBagCapacity: 20,     // Slots inside inventory
        currentEnergy: 100,
        maxEnergy: 100,
        activePickaxeMultiplier: 1.0, // Speed/Mining efficiency
        xpMultiplier: 1.0,      // Double XP pass modifier
        inventory: []           // Mined Ore Objects
    };

    // ==================== SELECTORS ====================
    // Navigation elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const gameViews = document.querySelectorAll('.game-view');
    const userProfile = document.getElementById('userProfile');

    function switchView(viewId) {
        gameViews.forEach(view => {
            view.classList.toggle('active', view.id === viewId);
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.view;
            if (!target) return;
            switchView(target);
            if (window.innerWidth < 768 && sidebar) sidebar.classList.remove('open');
        });
    });

    // Stats Labels
    const labelLevel = document.getElementById('player-level');
    const labelXp = document.getElementById('player-xp');
    const labelMoney = document.getElementById('player-money');
    const labelOres = document.getElementById('ores-mined');
    const labelCapacity = document.getElementById('bag-capacity');
    const labelEnergy = document.getElementById('player-energy');

    // Main Game View Elements
    const caveContainer = document.getElementById('caveContainer');
    const prevMapBtn = document.getElementById('prevMapBtn');
    const nextMapBtn = document.getElementById('nextMapBtn');
    const mapPageLabel = document.getElementById('mapPageLabel');
    const inventoryScroll = document.getElementById('inventoryScroll');
    const labelInvCount = document.getElementById('inv-count');
    const labelInvMax = document.getElementById('inv-max');
    const sellAllBtn = document.getElementById('sellAllBtn');

    // Shop selectors
    const shopSearchInput = document.getElementById('shopSearchInput');
    const shopSectionFilter = document.getElementById('shopSectionFilter');
    const shopSectionsList = document.getElementById('shopSectionsList');

    // Collections selectors
    const colSearchInput = document.getElementById('colSearchInput');
    const colSectionFilter = document.getElementById('colSectionFilter');
    const colSectionsList = document.getElementById('colSectionsList');

    // Map Pagination State
    let currentMapPage = 1;
    let cavesPerPage = 9; 
    let maxMapPages = 1;  

    // ==================== CORE UTILITY ALGORITHMS ====================

    // Weighted Random Picker based on probability rate (pr)
    function rollWeightedSelection(itemsArray) {
        const roll = Math.random();
        let cumulativeProbability = 0;

        for (let item of itemsArray) {
            cumulativeProbability += item.pr;
            if (roll <= cumulativeProbability) {
                return item;
            }
        }
        return itemsArray[0]; // Normal variant fallback
    }

    // Update Navbar labels
    function updateStatsUI() {
        if (labelLevel) labelLevel.textContent = playerState.level;
        if (labelXp) labelXp.textContent = playerState.xp;
        if (labelMoney) labelMoney.textContent = playerState.money;
        if (labelOres) labelOres.textContent = playerState.inventory.length;
        if (labelCapacity) labelCapacity.textContent = playerState.maxBagCapacity;
        if (labelEnergy) labelEnergy.textContent = `${Math.floor(playerState.currentEnergy)}%`;

        // Update active inventory panel metrics
        if (labelInvCount) labelInvCount.textContent = playerState.inventory.length;
        if (labelInvMax) labelInvMax.textContent = playerState.maxBagCapacity;
    }

    // Handle Player Level Ups
    function awardXp(amount) {
        playerState.xp += amount * playerState.xpMultiplier;
        if (playerState.xp >= playerState.xpNeeded) {
            playerState.xp -= playerState.xpNeeded;
            playerState.level += 1;
            playerState.xpNeeded = Math.floor(playerState.xpNeeded * 1.5);
            playerState.maxEnergy = Math.floor(playerState.maxEnergy * 1.1);
            playerState.currentEnergy = playerState.maxEnergy; // Fully restore
            
            // Check Cave Layer Trophies
            if (playerState.level >= 10) {
                unlockCollectionItem("cavern-cup");
            }
        }
        updateStatsUI();
    }

    // ==================== ACTIVE INVENTORY ENGINE ====================

    function renderInventoryTray() {
        if (!inventoryScroll) return;
        inventoryScroll.innerHTML = '';

        if (playerState.inventory.length === 0) {
            inventoryScroll.innerHTML = '<span style="color: #666; font-size: 0.75rem; margin: auto;">Your bag is empty. Start mining!</span>';
            return;
        }

        playerState.inventory.forEach((ore) => {
            const itemCard = document.createElement('div');
            itemCard.className = 'loot-item';
            
            // Apply gold frame glow to highly valuable mutations/variants
            if (ore.variant === 'Rainbow' || ore.mutation === 'Cosmic') {
                itemCard.style.borderColor = 'var(--gold-accent)';
                itemCard.style.boxShadow = '0 0 4px rgba(255, 204, 0, 0.4)';
            }

            itemCard.innerHTML = `
                <span class="loot-icon">${ore.icon}</span>
                <div class="loot-details">
                    <span class="loot-name">${ore.variant !== 'Normal' ? ore.variant + ' ' : ''}${ore.name}</span>
                    <span class="loot-meta">${ore.actualWeight}kg | 🪙${ore.finalValue} ${ore.mutation !== 'Normal' ? ' (' + ore.mutation + ')' : ''}</span>
                </div>
            `;
            inventoryScroll.appendChild(itemCard);
        });
    }

    // Sell inventory content
    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', () => {
            if (playerState.inventory.length === 0) return;

            let totalGoldEarned = 0;
            playerState.inventory.forEach(ore => {
                totalGoldEarned += ore.finalValue;
            });

            playerState.money += totalGoldEarned;
            playerState.inventory = []; // Empty out bag

            updateStatsUI();
            renderInventoryTray();
        });
    }

    // ==================== CORE MINING CALCULATOR ====================

    function mineCave(caveId) {
        const cave = cavesData.find(c => c.id === caveId);
        if (!cave) return;

        // Validation Checks
        if (playerState.level < cave.requiredLevel) return;
        if (playerState.currentEnergy < cave.energyCost) return;
        if (playerState.inventory.length >= playerState.maxBagCapacity) return;

        // 1. Consume Energy
        playerState.currentEnergy -= cave.energyCost;

        // 2. Roll Variant properties (Base Value Multiplier)
        const rolledVariant = rollWeightedSelection(variantsData);
        const modifiedBaseValue = cave.baseValue * rolledVariant.multiplier;

        // 3. Roll randomized fluctuation on Weight
        const weightFluctuation = 0.8 + (Math.random() * 0.4); // Random float between 0.8 and 1.2
        const actualWeight = parseFloat((cave.baseWeight * weightFluctuation).toFixed(2));

        // 4. Calculate Sub-Total value
        const subTotalValue = Math.floor(modifiedBaseValue * actualWeight);

        // 5. Roll Mutation properties (Final Value Multiplier)
        const rolledMutation = rollWeightedSelection(mutationsData);
        const finalValue = Math.floor(subTotalValue * rolledMutation.multiplier);

        // 6. Generate loot and append to inventory Array
        const minedOre = {
            id: cave.oreName.toLowerCase().replace(/\s+/g, '-'),
            name: cave.oreName,
            baseValue: cave.baseValue,
            baseWeight: cave.baseWeight,
            variant: rolledVariant.name,
            variantMultiplier: rolledVariant.multiplier,
            actualWeight: actualWeight,
            subTotalValue: subTotalValue,
            mutation: rolledMutation.name,
            mutationMultiplier: rolledMutation.multiplier,
            finalValue: finalValue,
            icon: cave.oreIcon
        };

        playerState.inventory.push(minedOre);

        // 7. Sync with Collections unlocks
        // Sync active ore unlock
        unlockCollectionItem(`${cave.oreName.toLowerCase().split(' ')[0]}-col`);
        
        // Sync Variant unlocks
        if (rolledVariant.id !== "normal") {
            unlockCollectionItem(`${rolledVariant.id}-col`);
        }
        // Sync Mutation unlocks
        if (rolledMutation.id !== "none") {
            unlockCollectionItem(`${rolledMutation.id}-col`);
        }

        // Check active count badge Achievements
        updateHardWorkerBadge();

        // 8. Award Experience
        awardXp(cave.xpReward);

        // 9. Re-render UI
        updateStatsUI();
        renderInventoryTray();
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
                    box.innerHTML = `
                        <span class="box-title">Locked</span>
                        <span style="font-size:0.65rem; color:#bbb; z-index:2;">Lvl ${cave.requiredLevel} Req.</span>
                    `;
                } else {
                    box.className = 'box';
                    box.id = `cave-${cave.id}`;
                    // Set cave image
                    box.style.backgroundImage = `url('${cave.image}')`;
                    box.innerHTML = `
                        <span class="box-title">${cave.name}</span>
                        <button class="box-btn" data-id="${cave.id}">Mine</button>
                    `;
                }
            } else {
                box.className = 'box disabled';
                box.innerHTML = `
                    <span class="box-title">Coming Soon</span>
                `;
            }
            caveContainer.appendChild(box);
        }

        // Add event listeners inside the dynamically generated Mine buttons
        const mineButtons = caveContainer.querySelectorAll('.box-btn');
        mineButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const caveId = parseInt(btn.getAttribute('data-id'));
                mineCave(caveId);
            });
        });
    }

    // Helper functions to adjust Map Pagination size limits
    function getGridColumnsCount() {
        if (!caveContainer) return 3;
        const computedStyle = window.getComputedStyle(caveContainer);
        const gridTemplateColumns = computedStyle.getPropertyValue('grid-template-columns');
        return gridTemplateColumns.trim().split(/\s+/).length;
    }

    function updateMapPageStructure() {
        const columns = getGridColumnsCount();

        if (columns === 3) cavesPerPage = 9; 
        else if (columns === 2) cavesPerPage = 4; 
        else cavesPerPage = 1; 

        maxMapPages = Math.ceil(cavesData.length / cavesPerPage);

        if (currentMapPage > maxMapPages) currentMapPage = maxMapPages;
        if (currentMapPage < 1) currentMapPage = 1;

        if (mapPageLabel) mapPageLabel.textContent = `Map ${currentMapPage} / ${maxMapPages}`;

        if (prevMapBtn && nextMapBtn) {
            prevMapBtn.disabled = (currentMapPage === 1);
            nextMapBtn.disabled = (currentMapPage === maxMapPages);
        }

        renderCaves();
    }

    // Page navigations click hooks
    if (prevMapBtn && nextMapBtn) {
        prevMapBtn.addEventListener('click', () => {
            if (currentMapPage > 1) {
                currentMapPage--;
                updateMapPageStructure();
            }
        });

        nextMapBtn.addEventListener('click', () => {
            if (currentMapPage < maxMapPages) {
                currentMapPage++;
                updateMapPageStructure();
            }
        });
    }

    // ==================== SHOP DYNAMIC RENDERER ====================

    function renderShop() {
        if (!shopSectionsList) return;
        shopSectionsList.innerHTML = '';

        // Categories Map
        const categories = {
            "mining-speed": "⚡ Mining Speed",
            "bag-capacity": "🎒 Bag Capacity",
            "energy": "🔋 Energy Upgrades",
            "boosts": "🧪 Boosts & Potions",
            "money-perks": "🪙 Money Perks"
        };

        // Render each category container dynamically
        Object.keys(categories).forEach(catKey => {
            const section = document.createElement('section');
            section.className = 'shop-section';
            section.setAttribute('data-category', catKey);
            section.innerHTML = `<h3 class="section-header">${categories[catKey]}</h3>`;

            if (catKey !== "money-perks") {
                // Render standard Portrait grids
                const scrollContainer = document.createElement('div');
                scrollContainer.className = 'scroll-container';
                const grid = document.createElement('div');
                grid.className = 'portrait-grid';

                const items = shopData.filter(i => i.category === catKey);
                items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'portrait-card';
                    card.innerHTML = `
                        <div class="circle-icon">${item.icon}</div>
                        <span class="card-name">${item.name}</span>
                        <p class="card-desc">${item.desc}</p>
                        <button class="card-buy-btn" data-id="${item.id}">🪙 ${item.cost}</button>
                    `;
                    grid.appendChild(card);
                });

                scrollContainer.appendChild(grid);
                section.appendChild(scrollContainer);
            } else {
                // Render Sub-sections inside Money Perks
                // 1. Packs
                const packsHeader = document.createElement('h4');
                packsHeader.className = 'sub-section-header';
                packsHeader.textContent = '🎁 Bundles & Packs';
                section.appendChild(packsHeader);

                const packsScrollContainer = document.createElement('div');
                packsScrollContainer.className = 'scroll-container';
                const packsGrid = document.createElement('div');
                packsGrid.className = 'wider-grid';

                shopData.filter(i => i.category === 'packs').forEach(pack => {
                    const card = document.createElement('div');
                    card.className = 'wider-card';
                    card.innerHTML = `
                        <div class="rounded-image-icon">${pack.icon}</div>
                        <span class="wider-card-name">${pack.name}</span>
                        <p class="wider-card-desc">${pack.desc}</p>
                        <button class="wider-card-btn" data-id="${pack.id}">Buy ${pack.cost}</button>
                    `;
                    packsGrid.appendChild(card);
                });
                packsScrollContainer.appendChild(packsGrid);
                section.appendChild(packsScrollContainer);

                // 2. Subscriptions
                const subsHeader = document.createElement('h4');
                subsHeader.className = 'sub-section-header';
                subsHeader.textContent = '📅 Subscriptions';
                section.appendChild(subsHeader);

                const subsScrollContainer = document.createElement('div');
                subsScrollContainer.className = 'scroll-container';
                const subsGrid = document.createElement('div');
                subsGrid.className = 'wider-grid';

                shopData.filter(i => i.category === 'subscriptions').forEach(sub => {
                    const card = document.createElement('div');
                    card.className = 'wider-card';
                    card.innerHTML = `
                        <div class="rounded-image-icon">${sub.icon}</div>
                        <span class="wider-card-name">${sub.name}</span>
                        <p class="wider-card-desc">${sub.desc}</p>
                        <button class="wider-card-btn" data-id="${sub.id}">Buy ${sub.cost}</button>
                    `;
                    subsGrid.appendChild(card);
                });
                subsScrollContainer.appendChild(subsGrid);
                section.appendChild(subsScrollContainer);

                // 3. Passes (Collapsible Panels)
                const passesHeader = document.createElement('h4');
                passesHeader.className = 'sub-section-header';
                passesHeader.textContent = '🎫 Season Passes';
                section.appendChild(passesHeader);

                const passesList = document.createElement('div');
                passesList.className = 'passes-list';

                shopData.filter(i => i.category === 'passes').forEach(pass => {
                    const card = document.createElement('div');
                    card.className = 'pass-card';
                    // Simulation state
                    const isBought = pass.id === 'double-xp-pass'; 
                    card.setAttribute('data-bought', isBought ? 'true' : 'false');

                    card.innerHTML = `
                        <div class="pass-header">
                            <span class="pass-card-title">${pass.icon} ${pass.name}</span>
                            <div class="pass-controls">
                                ${isBought ? '<span class="owned-badge">Owned</span>' : `<button class="pass-header-buy-btn" data-id="${pass.id}">Buy ${pass.cost}</button>`}
                                <button class="pass-toggle-btn">▼</button>
                            </div>
                        </div>
                        <div class="pass-content">
                            <div class="pass-rewards-placeholder">
                                <h5>🌟 Benefit Details</h5>
                                <p>${pass.desc}</p>
                            </div>
                            ${isBought ? '<div class="pass-owned-placeholder">✓ Already Owned & Active</div>' : `<button class="pass-content-buy-btn" data-id="${pass.id}">Buy Pass (${pass.cost})</button>`}
                        </div>
                    `;

                    // Expansion event hook
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

        // Hook click purchase listeners
        const buyButtons = shopSectionsList.querySelectorAll('.card-buy-btn, .wider-card-btn, .pass-header-buy-btn, .pass-content-buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = btn.getAttribute('data-id');
                buyShopItem(itemId);
            });
        });
    }

    // Handles item upgrade logic
    function buyShopItem(itemId) {
        const item = shopData.find(i => i.id === itemId);
        if (!item) return;

        // IAP Purchases simulation (real world currency)
        if (item.isIAP) {
            alert(`Purchase success for ${item.name}! (Simulated IAP)`);
            if (item.id === "double-xp-pass") {
                playerState.xpMultiplier = 2.0; // Double XP active
            }
            renderShop();
            return;
        }

        // Gold Purchases check
        if (playerState.money < item.cost) {
            alert("Not enough coins!");
            return;
        }

        // Deduct Coins
        playerState.money -= item.cost;

        // Apply Upgrade Stat properties
        if (item.category === "mining-speed") {
            playerState.activePickaxeMultiplier = item.multiplier;
            unlockCollectionItem("iron-digger"); // Unlock gallery card
        } else if (item.category === "bag-capacity") {
            playerState.maxBagCapacity = item.capacity;
        } else if (item.category === "energy") {
            playerState.currentEnergy = Math.min(playerState.maxEnergy, playerState.currentEnergy + item.energy);
        }

        alert(`Successfully unlocked: ${item.name}!`);
        updateStatsUI();
        renderShop();
        renderCaves();
    }

    // ==================== COLLECTIONS RENDERER ====================

    function renderCollections() {
        if (!colSectionsList) return;
        colSectionsList.innerHTML = '';

        const categories = {
            "pickaxes": "⛏️ Pickaxes Collections",
            "ores": "🪨 Ores Collections",
            "mutations": "⚛️ Mutations Collections",
            "awards": "🏆 Awards Collections"
        };

        Object.keys(categories).forEach(catKey => {
            const section = document.createElement('section');
            section.className = 'col-section';
            section.setAttribute('data-category', catKey);
            section.innerHTML = `<h3 class="col-section-header">${categories[catKey]}</h3>`;

            const grid = document.createElement('div');
            grid.className = 'col-grid';

            if (catKey !== "awards") {
                const items = collectionsData.filter(c => c.category === catKey);
                items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'col-card';
                    card.innerHTML = `
                        <div class="col-icon-circle">${item.obtained ? item.icon : '❓'}</div>
                        <h4 class="col-card-title">${item.obtained ? item.name : 'Unknown'}</h4>
                        <p class="col-card-desc">${item.obtained ? item.desc : 'Keep mining layers to unlock details.'}</p>
                        <button class="col-read-more" ${item.obtained ? '' : 'disabled'}>Read more</button>
                    `;
                    grid.appendChild(card);
                });
                section.appendChild(grid);
            } else {
                // Trophies subsection
                const subTrophies = document.createElement('h4');
                subTrophies.className = 'col-sub-header';
                subTrophies.textContent = '🏆 Trophies (Quest Chests)';
                section.appendChild(subTrophies);

                const gridTrophies = document.createElement('div');
                gridTrophies.className = 'col-grid';

                collectionsData.filter(c => c.category === 'awards' && c.subCategory === 'trophies').forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'col-card';
                    card.innerHTML = `
                        <div class="col-icon-circle">${item.obtained ? item.icon : '❓'}</div>
                        <h4 class="col-card-title">${item.obtained ? item.name : 'Unknown'}</h4>
                        <p class="col-card-desc">${item.obtained ? item.desc : 'Complete high-level layers to obtain.'}</p>
                        <button class="col-read-more" ${item.obtained ? '' : 'disabled'}>Read more</button>
                    `;
                    gridTrophies.appendChild(card);
                });
                section.appendChild(gridTrophies);

                // Badges subsection
                const subBadges = document.createElement('h4');
                subBadges.className = 'col-sub-header';
                subBadges.textContent = '🏷️ Badges (Quest Tasks)';
                section.appendChild(subBadges);

                const gridBadges = document.createElement('div');
                gridBadges.className = 'col-grid';

                collectionsData.filter(c => c.category === 'awards' && c.subCategory === 'badges').forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'col-card';
                    card.innerHTML = `
                        <div class="col-icon-circle">${item.obtained ? item.icon : '❓'}</div>
                        <h4 class="col-card-title">${item.obtained ? item.name : 'Unknown'}</h4>
                        <p class="col-card-desc">${item.obtained ? item.desc : 'Finish quest tasks to unlock.'}</p>
                        <button class="col-read-more" ${item.obtained ? '' : 'disabled'}>Read more</button>
                    `;
                    gridBadges.appendChild(card);
                });
                section.appendChild(gridBadges);
            }

            colSectionsList.appendChild(section);
        });
    }

    // Helper to flip the collection item unlock state
    function unlockCollectionItem(itemId) {
        const item = collectionsData.find(c => c.id === itemId);
        if (item && !item.obtained) {
            item.obtained = true;
            renderCollections();
        }
    }

    // Unlock badge achievements dynamically based on totals
    let totalMinesCount = 0;
    function updateHardWorkerBadge() {
        totalMinesCount += 1;
        if (totalMinesCount >= 100) {
            unlockCollectionItem("hard-worker");
        }
    }

    // ==================== SEARCH/FILTER IMPLEMENTATIONS ====================

    function filterShopItems() {
        const searchQuery = shopSearchInput.value.toLowerCase().trim();
        const selectedCategory = shopSectionFilter.value;

        shopSectionsList.querySelectorAll('.shop-section').forEach(section => {
            const sectionCategory = section.getAttribute('data-category');
            const matchCategory = (selectedCategory === 'all' || sectionCategory === selectedCategory);

            const cards = section.querySelectorAll('.portrait-card, .wider-card, .pass-card');
            let visibleCardsCount = 0;

            cards.forEach(card => {
                const nameEl = card.querySelector('.card-name, .wider-card-name, .pass-card-title');
                const nameText = nameEl ? nameEl.textContent.toLowerCase() : '';
                const matchSearch = nameText.includes(searchQuery);

                if (matchSearch) {
                    card.style.display = '';
                    visibleCardsCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            section.style.display = (matchCategory && visibleCardsCount > 0) ? '' : 'none';
        });
    }

    function filterCollectionItems() {
        const searchQuery = colSearchInput.value.toLowerCase().trim();
        const selectedCategory = colSectionFilter.value;

        colSectionsList.querySelectorAll('.col-section').forEach(section => {
            const sectionCategory = section.getAttribute('data-category');
            const matchCategory = (selectedCategory === 'all' || sectionCategory === selectedCategory);

            const cards = section.querySelectorAll('.col-card');
            let visibleCardsCount = 0;

            cards.forEach(card => {
                const titleEl = card.querySelector('.col-card-title');
                const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
                const matchSearch = titleText.includes(searchQuery);

                if (matchSearch) {
                    card.style.display = '';
                    visibleCardsCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            section.style.display = (matchCategory && visibleCardsCount > 0) ? '' : 'none';
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

    // Mobile sidebar toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    // Hide sidebar on click outside when on narrow screens
    const gameArea = document.querySelector('.game-area');
    if (gameArea && sidebar) {
        gameArea.addEventListener('click', () => {
            if (window.innerWidth < 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Monitor resize movements to adjust grid configurations
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMapPageStructure();
        }, 100);
    });

    // ==================== INITIALIZATION ====================
    updateMapPageStructure();
    updateStatsUI();
    renderInventoryTray();
    renderShop();
    renderCollections();
});