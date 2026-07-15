from flask import Flask, render_template, jsonify
from flask_cors import CORS
import ccxt

app = Flask(__name__)
CORS(app)

# BtcTurk bağlantısı
exchange = ccxt.btcturk()

# Son fiyatları hafızada tut
price_memory = {}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/status")
def status():
    return jsonify({
        "status": "online",
        "exchange": "BtcTurk",
        "version": "1.0"
    })


@app.route("/api/veri")
def market_data():

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

            if previous == 0:
                previous = price

            change = ((price - previous) / previous) * 100

            price_memory[symbol] = price

            coins.append({

                "symbol": symbol,

                "price": float(price),

                "formatted_price": f"{price:,.2f} ₺",

                "change": round(change, 2)

            })

        coins.sort(
            key=lambda x: x["change"],
            reverse=True
        )

        return jsonify({

            "status": "success",

            "coins": coins,

            "count": len(coins)

        })

    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500


@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "status": "error",

        "message": "Sayfa bulunamadı."

    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({

        "status": "error",

        "message": "Sunucu hatası."

    }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000,
        debug=True
    )
