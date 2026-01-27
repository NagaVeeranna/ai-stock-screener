from flask import Blueprint, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

gateway_bp = Blueprint("gateway", __name__)

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="ai_screener_db",
        user="postgres",
        password="12345",
        port="5432"
    )

from app.utils.market_data import get_batch_latest_data

@gateway_bp.route("/watchlist/<int:user_id>", methods=["GET"])
def get_watchlist(user_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT symbol FROM watchlist WHERE user_id = %s", (user_id,))
        watchlist_items = cur.fetchall()
        
        # Extract symbols
        symbols = [item['symbol'] for item in watchlist_items]
        
        # Fetch data for all symbols
        market_data = get_batch_latest_data(symbols)
        
        # Enriched watchlist
        enriched_watchlist = []
        for item in watchlist_items:
            sym = item['symbol']
            data = market_data.get(sym, {})
            enriched_watchlist.append({
                "symbol": sym,
                "price": data.get("price", 0),
                "changePercent": data.get("changePercent", 0),
                "source": data.get("source", "none")
            })
            
        return jsonify({"watchlist": enriched_watchlist}), 200
    finally:
        cur.close()
        conn.close()

@gateway_bp.route("/watchlist/add", methods=["POST"])
def add_to_watchlist():
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO watchlist (user_id, symbol) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (data['user_id'], data['symbol'])
        )
        conn.commit()
        return jsonify({"message": "Added"}), 201
    finally:
        cur.close()
        conn.close()