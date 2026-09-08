// ==========================================
// 🍪 CookieRNG v1.1
// ==========================================


// ==========================================
// PLAYER DATA
// ==========================================

let coins = Number(localStorage.getItem("coins")) || 0;

let xp = Number(localStorage.getItem("xp")) || 0;

let level = Number(localStorage.getItem("level")) || 1;

let inventory = JSON.parse(
    localStorage.getItem("inventory")
) || {
    "Normal Cookie": 0,
    "Rainbow Cookie": 0,
    "Golden Cookie": 0
};


// ==========================================
// UPGRADES
// ==========================================

let luckLevel =
    Number(localStorage.getItem("luckLevel")) || 0;

let coinLevel =
    Number(localStorage.getItem("coinLevel")) || 0;

let speedLevel =
    Number(localStorage.getItem("speedLevel")) || 0;

let autoRoll =
    localStorage.getItem("autoRoll") === "true";

let multipleRolls =
    localStorage.getItem("multipleRolls") === "true";


// ==========================================
// ROLL SETTINGS
// ==========================================

let rollTime = Math.max(
    1000,
    3000 - (speedLevel * 500)
);

let rolling = false;

let autoRollTimer = null;


// ==========================================
// STREAK
// ==========================================

let streakType =
    localStorage.getItem("streakType") || null;

let streak =
    Number(localStorage.getItem("streak")) || 0;


// ==========================================
// MERCHANT
// ==========================================

let merchantPrices = JSON.parse(
    localStorage.getItem("merchantPrices")
) || {
    normal: 5,
    rainbow: 20,
    gold: 60
};

let merchantNextChange =
    Number(localStorage.getItem("merchantNextChange"))
    || Date.now() + 300000;


// ==========================================
// HTML ELEMENTS
// ==========================================

const rollButton =
    document.getElementById("rollButton");

const cookieDisplay =
    document.getElementById("cookieDisplay");

const resultText =
    document.getElementById("resultText");

const timer =
    document.getElementById("timer");

const streakText =
    document.getElementById("streakText");

const coinsDisplay =
    document.getElementById("coins");

const levelDisplay =
    document.getElementById("level");

const xpDisplay =
    document.getElementById("xp");

const xpNeededDisplay =
    document.getElementById("xpNeeded");

const xpFill =
    document.getElementById("xpFill");


// Inventory
const inventoryButton =
    document.getElementById("inventoryButton");

const inventoryPanel =
    document.getElementById("inventoryPanel");

const closeInventory =
    document.getElementById("closeInventory");

const inventoryList =
    document.getElementById("inventoryList");


// Shop
const shopButton =
    document.getElementById("shopButton");

const shopPanel =
    document.getElementById("shopPanel");

const closeShop =
    document.getElementById("closeShop");


// Merchant
const merchantButton =
    document.getElementById("merchantButton");

const merchantPanel =
    document.getElementById("merchantPanel");

const closeMerchant =
    document.getElementById("closeMerchant");


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    localStorage.setItem(
        "coins",
        coins
    );

    localStorage.setItem(
        "xp",
        xp
    );

    localStorage.setItem(
        "level",
        level
    );

    localStorage.setItem(
        "inventory",
        JSON.stringify(inventory)
    );

    localStorage.setItem(
        "luckLevel",
        luckLevel
    );

    localStorage.setItem(
        "coinLevel",
        coinLevel
    );

    localStorage.setItem(
        "speedLevel",
        speedLevel
    );

    localStorage.setItem(
        "autoRoll",
        autoRoll
    );

    localStorage.setItem(
        "multipleRolls",
        multipleRolls
    );

    localStorage.setItem(
        "streakType",
        streakType
    );

    localStorage.setItem(
        "streak",
        streak
    );

    localStorage.setItem(
        "merchantPrices",
        JSON.stringify(merchantPrices)
    );

    localStorage.setItem(
        "merchantNextChange",
        merchantNextChange
    );
}


// ==========================================
// UI UPDATE
// ==========================================

function updateUI() {

    coinsDisplay.textContent =
        Math.floor(coins);

    levelDisplay.textContent =
        level;

    xpDisplay.textContent =
        xp;

    let needed =
        getXPNeeded(level);

    xpNeededDisplay.textContent =
        needed;

    let percentage =
        Math.min((xp / needed) * 100, 100);

    xpFill.style.width =
        percentage + "%";


    document.getElementById(
        "luckLevel"
    ).textContent = luckLevel;

    document.getElementById(
        "coinLevel"
    ).textContent = coinLevel;


    document.getElementById(
        "rollTimeDisplay"
    ).textContent =
        (rollTime / 1000).toFixed(1);


    document.getElementById(
        "autoStatus"
    ).textContent =
        autoRoll ? "Purchased" : "Locked";


    document.getElementById(
        "multiStatus"
    ).textContent =
        multipleRolls ? "Purchased" : "Locked";


    updateShopPrices();

    updateInventory();

    updateMerchant();

}


// ==========================================
// XP SYSTEM
// ==========================================

function getXPNeeded(currentLevel) {

    // Level 1 → 2 = 5 XP
    // Level 2 → 3 = 8 XP
    // Level 3 → 4 = 11 XP

    return 5 + ((currentLevel - 1) * 3);
}


function addXP(amount) {

    xp += amount;

    while (
        xp >= getXPNeeded(level)
    ) {

        xp -= getXPNeeded(level);

        level++;

        showLevelUp();
    }

    updateUI();

    saveGame();
}


function showLevelUp() {

    resultText.textContent =
        `⭐ LEVEL UP! Level ${level}!`;

    resultText.classList.remove(
        "level-up"
    );

    void resultText.offsetWidth;

    resultText.classList.add(
        "level-up"
    );
}


// ==========================================
// COOKIE ROLLING
// ==========================================

rollButton.addEventListener(
    "click",
    startRoll
);


function startRoll() {

    if (rolling) return;

    rolling = true;

    rollButton.disabled = true;

    resultText.textContent =
        "Rolling...";

    streakText.textContent = "";

    cookieDisplay.className =
        "cookie-display rolling";

    cookieDisplay.textContent =
        "🍪";


    let seconds =
        rollTime / 1000;

    timer.textContent =
        `Rolling... ${seconds.toFixed(1)}s`;


    let startTime =
        Date.now();


    let countdown =
        setInterval(() => {

            let elapsed =
                Date.now() - startTime;

            let remaining =
                Math.max(
                    0,
                    rollTime - elapsed
                );


            timer.textContent =
                `Rolling... ${(remaining / 1000).toFixed(1)}s`;


        }, 100);


    setTimeout(() => {

        clearInterval(countdown);

        finishRoll();

    }, rollTime);
}


// ==========================================
// FINISH ROLL
// ==========================================

function finishRoll() {

    cookieDisplay.className =
        "cookie-display";


    let results = [];


    // Normal roll
    results.push(
        chooseCookie()
    );


    // Multiple Rolls
    if (multipleRolls) {

        results.push(
            chooseCookie()
        );

    }


    // Give cookies
    results.forEach(
        cookie => {

            inventory[cookie]++;

        }
    );


    // Calculate rewards
    let totalCoins = 0;

    let totalXP = 0;


    results.forEach(
        cookie => {

            if (
                cookie === "Normal Cookie"
            ) {

                totalCoins +=
                    5;

                totalXP +=
                    1;

            }

            else if (
                cookie === "Rainbow Cookie"
            ) {

                totalCoins +=
                    25;

                totalXP +=
                    5;

            }

            else if (
                cookie === "Golden Cookie"
            ) {

                totalCoins +=
                    120;

                totalXP +=
                    10;

            }

        }
    );


    // Coin upgrade
    totalCoins *=
        1 + (coinLevel * 0.10);


    // ======================================
    // STREAK LOGIC
    // ======================================

    let rareCookie =
        getRelevantRareCookie(results);


    let streakBonus = 0;


    if (rareCookie) {

        if (
            streakType === rareCookie
        ) {

            streak++;

        }

        else {

            streakType =
                rareCookie;

            streak = 1;

        }


        streakBonus =
            streak * 10;

    }

    else {

        // Normal cookie alone does NOT
        // break an existing streak.

        // However, if the roll contains
        // no rare cookie, the streak ends.

        streakType = null;

        streak = 0;

    }


    totalCoins +=
        streakBonus;


    coins +=
        Math.floor(totalCoins);


    // Add XP
    addXP(totalXP);


    // Display result
    displayRollResults(
        results,
        totalCoins,
        streakBonus
    );


    updateUI();

    saveGame();


    rolling = false;

    rollButton.disabled = false;


    // Auto Roll
    if (autoRoll) {

        clearTimeout(autoRollTimer);

        autoRollTimer =
            setTimeout(
                startRoll,
                250
            );

    }

}


// ==========================================
// CHOOSE COOKIE
// ==========================================

function chooseCookie() {

    let random =
        Math.random();


    // Base chances
    let goldenChance =
        0.01 +
        (luckLevel * 0.005);


    let rainbowChance =
        0.03 +
        (luckLevel * 0.01);


    if (
        random < goldenChance
    ) {

        return "Golden Cookie";

    }


    if (
        random <
        goldenChance + rainbowChance
    ) {

        return "Rainbow Cookie";

    }


    return "Normal Cookie";
}


// ==========================================
// STREAK COOKIE
// ==========================================

function getRelevantRareCookie(
    results
) {

    // Golden takes priority if both
    // rare cookies appear.

    if (
        results.includes(
            "Golden Cookie"
        )
    ) {

        return "Golden Cookie";

    }


    if (
        results.includes(
            "Rainbow Cookie"
        )
    ) {

        return "Rainbow Cookie";

    }


    return null;
}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayRollResults(
    results,
    totalCoins,
    streakBonus
) {

    let hasGolden =
        results.includes(
            "Golden Cookie"
        );

    let hasRainbow =
        results.includes(
            "Rainbow Cookie"
        );


    // Multiple cookies
    if (results.length === 2) {

        cookieDisplay.textContent =
            results
                .map(
                    cookie =>
                        getCookieIcon(cookie)
                )
                .join(" ");

    }

    else {

        cookieDisplay.textContent =
            getCookieIcon(
                results[0]
            );

    }


    // Special effects
    if (hasGolden) {

        cookieDisplay.classList.add(
            "gold-cookie"
        );

        resultText.textContent =
            "🥇 GOLDEN COOKIE!";

    }

    else if (hasRainbow) {

        cookieDisplay.classList.add(
            "rainbow-cookie"
        );

        resultText.textContent =
            "🌈 RAINBOW COOKIE!";

    }

    else {

        resultText.textContent =
            "🍪 Normal Cookie!";

    }


    timer.textContent =
        `🪙 +${Math.floor(totalCoins)} coins`;


    if (streak > 0) {

        streakText.textContent =
            `🔥 Streak ${streak}! +${streakBonus} bonus`;

    }

    else {

        streakText.textContent =
            "";

    }

}


// ==========================================
// COOKIE ICONS
// ==========================================

function getCookieIcon(cookie) {

    if (
        cookie === "Rainbow Cookie"
    ) {

        return "🌈🍪";

    }


    if (
        cookie === "Golden Cookie"
    ) {

        return "🥇🍪";

    }


    return "🍪";
}


// ==========================================
// INVENTORY
// ==========================================

inventoryButton.addEventListener(
    "click",
    () => {

        inventoryPanel.classList.add(
            "open"
        );

        updateInventory();

    }
);


closeInventory.addEventListener(
    "click",
    () => {

        inventoryPanel.classList.remove(
            "open"
        );

    }
);


function updateInventory() {

    inventoryList.innerHTML = "";


    for (
        const cookie in inventory
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "inventory-item";


        item.innerHTML = `
            <span class="cookie-name">
                ${getCookieIcon(cookie)}
                ${cookie}
            </span>

            <span>
                x${inventory[cookie]}
            </span>
        `;


        inventoryList.appendChild(
            item
        );

    }

}


// ==========================================
// SHOP
// ==========================================

shopButton.addEventListener(
    "click",
    () => {

        shopPanel.classList.add(
            "open"
        );

    }
);


closeShop.addEventListener(
    "click",
    () => {

        shopPanel.classList.remove(
            "open"
        );

    }
);


// ==========================================
// SHOP PRICES
// ==========================================

function updateShopPrices() {

    document.getElementById(
        "speedUpgrade"
    ).textContent =
        `🪙 ${100 + speedLevel * 100}`;


    document.getElementById(
        "luckUpgrade"
    ).textContent =
        `🪙 ${100 + luckLevel * 100}`;


    document.getElementById(
        "coinUpgrade"
    ).textContent =
        `🪙 ${150 + coinLevel * 150}`;


    document.getElementById(
        "autoUpgrade"
    ).textContent =
        autoRoll
            ? "Owned"
            : "🪙 500";


    document.getElementById(
        "multiUpgrade"
    ).textContent =
        multipleRolls
            ? "Owned"
            : "🪙 5000";

}


// ==========================================
// FASTER ROLLS
// ==========================================

document.getElementById(
    "speedUpgrade"
).addEventListener(
    "click",
    () => {

        if (speedLevel >= 4) {

            alert(
                "⚡ Your rolls are already at maximum speed!"
            );

            return;

        }


        let price =
            100 + (speedLevel * 100);


        if (coins < price) {

            alert(
                "You don't have enough coins!"
            );

            return;

        }


        coins -= price;

        speedLevel++;


        rollTime =
            Math.max(
                1000,
                3000 - speedLevel * 500
            );


        alert(
            `⚡ Roll speed upgraded!`
        );


        updateUI();

        saveGame();

    }
);


// ==========================================
// AUTO ROLL
// ==========================================

document.getElementById(
    "autoUpgrade"
).addEventListener(
    "click",
    () => {

        if (autoRoll) {

            alert(
                "🔄 Auto Roll is already unlocked!"
            );

            return;

        }


        if (coins < 500) {

            alert(
                "You don't have enough coins!"
            );

            return;

        }


        coins -= 500;

        autoRoll = true;


        alert(
            "🔄 Auto Roll unlocked!"
        );


        updateUI();

        saveGame();

    }
);


// ==========================================
// MULTIPLE ROLLS
// ==========================================

document.getElementById(
    "multiUpgrade"
).addEventListener(
    "click",
    () => {

        if (multipleRolls) {

            alert(
                "🍪🍪 Multiple Rolls is already unlocked!"
            );

            return;

        }


        if (coins < 5000) {

            alert(
                "You don't have enough coins!"
            );

            return;

        }


        coins -= 5000;

        multipleRolls = true;


        alert(
            "🍪🍪 Multiple Rolls unlocked!"
        );


        updateUI();

        saveGame();

    }
);


// ==========================================
// LUCK UPGRADE
// ==========================================

document.getElementById(
    "luckUpgrade"
).addEventListener(
    "click",
    () => {

        let price =
            100 + (luckLevel * 100);


        if (coins < price) {

            alert(
                "You don't have enough coins!"
            );

            return;

        }


        coins -= price;

        luckLevel++;


        alert(
            "🍀 Luck upgraded!"
        );


        updateUI();

        saveGame();

    }
);


// ==========================================
// COIN BONUS
// ==========================================

document.getElementById(
    "coinUpgrade"
).addEventListener(
    "click",
    () => {

        let price =
            150 + (coinLevel * 150);


        if (coins < price) {

            alert(
                "You don't have enough coins!"
            );

            return;

        }


        coins -= price;

        coinLevel++;


        alert(
            "💰 Coin Bonus upgraded!"
        );


        updateUI();

        saveGame();

    }
);


// ==========================================
// COOKIE MERCHANT
// ==========================================

merchantButton.addEventListener(
    "click",
    () => {

        merchantPanel.classList.add(
            "open"
        );

        updateMerchant();

    }
);


closeMerchant.addEventListener(
    "click",
    () => {

        merchantPanel.classList.remove(
            "open"
        );

    }
);


// ==========================================
// MERCHANT PRICE CHANGES
// ==========================================

function changeMerchantPrices() {

    merchantPrices.normal =
        randomMerchantPrice(5);

    merchantPrices.rainbow =
        randomMerchantPrice(20);

    merchantPrices.gold =
        randomMerchantPrice(60);


    merchantNextChange =
        Date.now() + 300000;


    saveGame();

    updateMerchant();

}


function randomMerchantPrice(
    basePrice
) {

    // Random change between
    // -20% and +20%

    let percentage =
        (Math.random() * 40) - 20;


    let price =
        basePrice *
        (1 + percentage / 100);


    return Math.max(
        1,
        Math.round(price)
    );

}


// ==========================================
// MERCHANT UI
// ==========================================

function updateMerchant() {

    // Check whether prices should change
    if (
        Date.now() >= merchantNextChange
    ) {

        changeMerchantPrices();

    }


    document.getElementById(
        "normalPrice"
    ).textContent =
        merchantPrices.normal;


    document.getElementById(
        "rainbowPrice"
    ).textContent =
        merchantPrices.rainbow;


    document.getElementById(
        "goldPrice"
    ).textContent =
        merchantPrices.gold;


    document.getElementById(
        "normalOwned"
    ).textContent =
        inventory["Normal Cookie"];


    document.getElementById(
        "rainbowOwned"
    ).textContent =
        inventory["Rainbow Cookie"];


    document.getElementById(
        "goldOwned"
    ).textContent =
        inventory["Golden Cookie"];

}


// ==========================================
// MERCHANT COUNTDOWN
// ==========================================

setInterval(
    () => {

        let remaining =
            Math.max(
                0,
                merchantNextChange -
                Date.now()
            );


        let totalSeconds =
            Math.floor(
                remaining / 1000
            );


        let minutes =
            Math.floor(
                totalSeconds / 60
            );


        let seconds =
            totalSeconds % 60;


        document.getElementById(
            "merchantTimer"
        ).textContent =
            `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`;


        if (
            remaining <= 0
        ) {

            changeMerchantPrices();

        }

    },
    1000
);


// ==========================================
// SELL COOKIES
// ==========================================

function sellCookie(
    cookieName,
    price
) {

    if (
        inventory[cookieName] <= 0
    ) {

        alert(
            `You don't have any ${cookieName}s!`
        );

        return;

    }


    inventory[cookieName]--;

    coins += price;


    updateUI();

    saveGame();

}


// Normal
document.getElementById(
    "sellNormal"
).addEventListener(
    "click",
    () => {

        sellCookie(
            "Normal Cookie",
            merchantPrices.normal
        );

    }
);


// Rainbow
document.getElementById(
    "sellRainbow"
).addEventListener(
    "click",
    () => {

        sellCookie(
            "Rainbow Cookie",
            merchantPrices.rainbow
        );

    }
);


// Golden
document.getElementById(
    "sellGold"
).addEventListener(
    "click",
    () => {

        sellCookie(
            "Golden Cookie",
            merchantPrices.gold
        );

    }
);


// ==========================================
// START GAME
// ==========================================

updateUI();

saveGame();
