/* ==========================================================
   CRYPTO RADAR PRO
   Version 1.0
   Developed by Merve Kaçaranlıoğlu Topçu
========================================================== */

const API_URL = "/api/veri";

let marketData = [];
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

/* Saat */

function updateClock() {

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleTimeString("tr-TR");

}

setInterval(updateClock,1000);
updateClock();


/* Loader */

function showLoader(){

    document.getElementById("loader").classList.remove("hidden");

}

function hideLoader(){

    document.getElementById("loader").classList.add("hidden");

}


/* Toast */

function toast(message){

    const toast=document.getElementById("toast");

    toast.innerHTML=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}


/* API */

async function loadMarket(){

    try{

        const response = await fetch(API_URL);

if (!response.ok) {
    throw new Error("API bağlantısı başarısız.");
}

        const json=await response.json();

        if(json.status==="success"){

            marketData=json.coins;

            drawMarket();

            updateCards();

            document.getElementById("lastUpdate").innerHTML=
                new Date().toLocaleTimeString("tr-TR");

        }

    }

    catch(error){

        console.error(error);

        toast("Sunucu bağlantısı kurulamadı.");

    }

    finally{

    }

}
/* ==========================================================
   TABLOYU ÇİZ
========================================================== */

function drawMarket() {

    const tbody = document.getElementById("marketTable");

    tbody.innerHTML = "";

    marketData.forEach((coin) => {

        let signal = "Bekle";
        let badgeClass = "wait";

        if (coin.change >= 0.50) {
            signal = "🚀 Güçlü AL";
            badgeClass = "strong-buy";
        } else if (coin.change >= 0.10) {
            signal = "🔥 AL";
            badgeClass = "buy";
        } else if (coin.change <= -0.50) {
            signal = "💥 Güçlü SAT";
            badgeClass = "strong-sell";
        } else if (coin.change <= -0.10) {
            signal = "🚨 SAT";
            badgeClass = "sell";
        }

        tbody.innerHTML += `
        <tr>

            <td>${coin.symbol}</td>

            <td>${coin.formatted_price}</td>

            <td class="${coin.change >= 0 ? "green" : "red"}">
                ${coin.change.toFixed(2)}%
            </td>

            <td>
                <span class="badge ${badgeClass}">
                    ${signal}
                </span>
            </td>

            <td>

                <button class="btn-buy"
                    onclick="openBuyModal('${coin.symbol}',${coin.price})"

                    AL

                </button>

            </td>

        </tr>
        `;

    });

}


/* ==========================================================
   DASHBOARD KARTLARI
========================================================== */

function updateCards() {

    document.getElementById("coinCount").innerHTML =
        marketData.length;

    let buy = 0;
    let sell = 0;

    marketData.forEach((coin) => {

        if (coin.change >= 0.10)
            buy++;

        if (coin.change <= -0.10)
            sell++;

    });

    document.getElementById("buyCount").innerHTML = buy;
    document.getElementById("sellCount").innerHTML = sell;

}

/* ==========================================================
   BUY MODAL
========================================================== */

let selectedCoin = null;
let selectedPrice = 0;

function openBuyModal(symbol, price){

    selectedCoin = symbol;
    selectedPrice = price;

    document.getElementById("modalCoinName").innerHTML =
        symbol;

    document.getElementById("buyAmount").value = "";

    document.getElementById("targetPercent").value = 10;

    document.getElementById("stopPercent").value = 5;

    document.getElementById("buyModal").classList.remove("hidden");

}

function closeBuyModal(){

    document.getElementById("buyModal").classList.add("hidden");

}
/* ==========================================================
   ALIŞ
========================================================== */

function buyCoin(symbol, price) {

    portfolio.push({

        symbol: symbol,

        buyPrice: price,

        buyDate: new Date().toLocaleString("tr-TR")

    });

    localStorage.setItem(
        "portfolio",
        JSON.stringify(portfolio)
    );

    drawPortfolio();

    toast(symbol + " portföye eklendi.");

}


/* ==========================================================
   PORTFÖY
========================================================== */

function drawPortfolio() {

    const tbody =
        document.getElementById("portfolioTable");

    if (portfolio.length === 0) {

        tbody.innerHTML =
            `<tr><td colspan="5">
            Henüz açık işlem bulunmuyor.
            </td></tr>`;

        return;

    }

    tbody.innerHTML = "";

    portfolio.forEach((item, index) => {

        let current = item.buyPrice;

        const found = marketData.find(
            c => c.symbol === item.symbol
        );

        if (found)
            current = found.price;

        const profit =
            ((current - item.buyPrice) /
            item.buyPrice) * 100;

        tbody.innerHTML += `

        <tr>

            <td>${item.symbol}</td>

            <td>${item.buyPrice.toFixed(2)} ₺</td>

            <td>${current.toFixed(2)} ₺</td>

            <td class="${profit >= 0 ? "green" : "red"}">

                ${profit.toFixed(2)}%

            </td>

            <td>

                <button class="btn-sell"
                    onclick="sellCoin(${index})">

                    SAT

                </button>

            </td>

        </tr>

        `;

    });

}


/* ==========================================================
   SATIŞ
========================================================== */

function sellCoin(index) {

    const item = portfolio[index];

    let current = item.buyPrice;

    const found =
        marketData.find(c => c.symbol === item.symbol);

    if (found)
        current = found.price;

    const profit =
        ((current - item.buyPrice) /
        item.buyPrice) * 100;

    history.unshift({

        date: new Date().toLocaleString("tr-TR"),

        symbol: item.symbol,

        buy: item.buyPrice,

        sell: current,

        result: profit

    });

    portfolio.splice(index,1);

    localStorage.setItem(
        "portfolio",
        JSON.stringify(portfolio)
    );

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    drawPortfolio();

    drawHistory();

    toast(item.symbol + " satıldı.");

}


/* ==========================================================
   GEÇMİŞ
========================================================== */

function drawHistory(){

    const tbody =
        document.getElementById("historyTable");

    if(history.length===0){

        tbody.innerHTML=
        `<tr><td colspan="5">
        Henüz işlem geçmişi bulunmuyor.
        </td></tr>`;

        return;

    }

    tbody.innerHTML="";

    history.forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.date}</td>

            <td>${item.symbol}</td>

            <td>${item.buy.toFixed(2)} ₺</td>

            <td>${item.sell.toFixed(2)} ₺</td>

            <td class="${item.result>=0?"green":"red"}">

                ${item.result.toFixed(2)}%

            </td>

        </tr>

        `;

    });

}


/* ==========================================================
   BAŞLAT
========================================================== */

drawPortfolio();

drawHistory();

showLoader();

loadMarket().then(() => {
    hideLoader();
});

setInterval(loadMarket, 5000);
