// ================================
// CookieRNG
// ================================

// Player data
let coins = Number(localStorage.getItem("coins")) || 100;

let inventory = JSON.parse(
    localStorage.getItem("inventory")
) || {
    "Normal Cookie": 0,
    "Rainbow Cookie": 0,
    "Golden Cookie": 0
};

let luckLevel = Number(localStorage.getItem("luckLevel")) || 0;
let coinLevel = Number(localStorage.getItem("coinLevel")) || 0;

let rolling = false;


// ================================
// HTML elements
// ================================

const rollButton = document.getElementById("rollButton");
const cookieDisplay = document.getElementById("cookieDisplay");
const resultText = document.getElementById("resultText");
const timer = document.getElementById("timer");

const coinCount = document.getElementById("coinCount");

const inventoryButton = document.getElementById("inventoryButton");
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInventory = document.getElementById("closeInventory");
const inventoryList = document.getElementById("inventoryList");

const shopButton = document.getElementById("shopButton");
const shopPanel = document.getElementById("shopPanel");
const closeShop = document.getElementById("closeShop");

const luckUpgrade = document.getElementById("luckUpgrade");
const coinUpgrade = document.getElementById("coinUpgrade");


// ================================
// Save game
// ================================

function saveGame() {

    localStorage.setItem("coins", coins);

    localStorage.setItem(
        "inventory",
        JSON.stringify(inventory)
    );

    localStorage.setItem("luckLevel", luckLevel);
    localStorage.setItem("coinLevel", coinLevel);
}


// ================================
// Update coins
// ================================

function updateCoins() {
    coinCount.textContent = coins;
}


// ================================
// Roll
// ================================

rollButton.addEventListener("click", startRoll);

function startRoll() {

    if (rolling) return;

    rolling = true;

    rollButton.disabled = true;

    resultText.textContent = "Rolling...";

    cookieDisplay.textContent = "🍪";
    cookieDisplay.className = "cookie-display rolling";

    let seconds = 3;

    timer.textContent = `${seconds}s`;

    const countdown = setInterval(() => {

        seconds--;

        if (seconds > 0) {
            timer.textContent = `${seconds}s`;
        }

    }, 1000);


    setTimeout(() => {

        clearInterval(countdown);

        finishRoll();

    }, 3000);
}


// ================================
// Choose cookie
// ================================

function finishRoll() {

    cookieDisplay.className = "cookie-display";

    let random = Math.random();

    // Luck upgrade improves rare chances
    let rainbowChance = 0.03 + (luckLevel * 0.01);
    let goldChance = 0.01 + (luckLevel * 0.005);

    let cookieType;

    if (random < goldChance) {

        cookieType = "Golden Cookie";

    } else if (random < goldChance + rainbowChance) {

        cookieType = "Rainbow Cookie";

    } else {

        cookieType = "Normal Cookie";

    }


    // Add to inventory
    inventory[cookieType]++;

    // Give coins
    let earnedCoins = 10 + (coinLevel * 5);

    if (cookieType === "Rainbow Cookie") {
        earnedCoins += 25;
    }

    if (cookieType === "Golden Cookie") {
        earnedCoins += 100;
    }

    coins += earnedCoins;


    // Display result
    if (cookieType === "Normal Cookie") {

        cookieDisplay.textContent = "🍪";

        resultText.textContent =
            "You rolled a Normal Cookie!";

    }

    else if (cookieType === "Rainbow Cookie") {

        cookieDisplay.textContent = "🍪";

        cookieDisplay.classList.add("rainbow-cookie");

        resultText.textContent =
            "🌈 RAINBOW COOKIE!";

    }

    else if (cookieType === "Golden Cookie") {

        cookieDisplay.textContent = "🍪";

        cookieDisplay.classList.add("gold-cookie");

        resultText.textContent =
            "🥇 GOLDEN COOKIE!";

    }


    timer.textContent = `+${earnedCoins} coins`;

    updateCoins();
    updateInventory();
    saveGame();

    rolling = false;

    rollButton.disabled = false;
}


// ================================
// Inventory
// ================================

inventoryButton.addEventListener("click", () => {

    inventoryPanel.classList.add("open");

    updateInventory();

});

closeInventory.addEventListener("click", () => {

    inventoryPanel.classList.remove("open");

});


function updateInventory() {

    inventoryList.innerHTML = "";

    for (const cookie in inventory) {

        const item = document.createElement("div");

        item.className = "inventory-item";

        item.innerHTML = `
            <span class="cookie-name">${getCookieIcon(cookie)} ${cookie}</span>
            <span>x${inventory[cookie]}</span>
        `;

        inventoryList.appendChild(item);
    }
}


function getCookieIcon(cookie) {

    if (cookie === "Rainbow Cookie") {
        return "🌈🍪";
    }

    if (cookie === "Golden Cookie") {
        return "🥇🍪";
    }

    return "🍪";
}


// ================================
// Shop
// ================================

shopButton.addEventListener("click", () => {

    shopPanel.classList.add("open");

});

closeShop.addEventListener("click", () => {

    shopPanel.classList.remove("open");

});


// ================================
// Luck upgrade
// ================================

luckUpgrade.addEventListener("click", () => {

    const price = 100 + (luckLevel * 100);

    if (coins >= price) {

        coins -= price;

        luckLevel++;

        luckUpgrade.textContent =
            `🪙 ${100 + (luckLevel * 100)}`;

        updateCoins();
        saveGame();

        alert("🍀 Luck upgraded!");

    } else {

        alert("You don't have enough coins!");

    }

});


// ================================
// Coin upgrade
// ================================

coinUpgrade.addEventListener("click", () => {

    const price = 150 + (coinLevel * 150);

    if (coins >= price) {

        coins -= price;

        coinLevel++;

        coinUpgrade.textContent =
            `🪙 ${150 + (coinLevel * 150)}`;

        updateCoins();
        saveGame();

        alert("💰 Coin bonus upgraded!");

    } else {

        alert("You don't have enough coins!");

    }

});


// ================================
// Start game
// ================================

updateCoins();
updateInventory();
