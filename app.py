from flask import Flask, render_template, jsonify
from flask_cors import CORS
import ccxt

app = Flask(__name__)
CORS(app)

exchange = ccxt.btcturk()

# Geçici fiyat hafızası
price_memory = {}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def status():
    return jsonify({
        "status": "online",
        "exchange": "BtcTurk"
    })


@app.route("/api/veri")
def veri():

    global price_memory

    try:

        tickers = exchange.fetch_tickers()

        coins = []

        for symbol, ticker in tickers.items():

            if "/TRY" not in symbol:
                continue

            price = ticker.get("last")

            if price is None:
                continue

            previous = price_memory.get(symbol, price)

            change = ((price - previous) / previous) * 100 if previous else 0

            price_memory[symbol] = price

            coins.append({
                "symbol": symbol,
                "price": price,
                "formatted_price": f"{price:,.2f} ₺",
                "change": round(change, 3)
            })

        coins = sorted(coins, key=lambda x: x["change"], reverse=True)

        return jsonify({
            "status": "success",
            "coins": coins
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
