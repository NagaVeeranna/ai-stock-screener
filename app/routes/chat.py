from flask import Blueprint, request, jsonify
import traceback

from app.llm.parser import parse_query
from app.screener.runner import run_screener
from app.services.stock_resolver import resolve_symbols
from app.services.chat_intelligence import handle_small_talk

chat_bp = Blueprint("chat_bp", __name__)

# ---------- SAFE CONVERTERS ----------

def safe_float(val):
    try:
        return float(val)
    except Exception:
        return 0.0

def safe_int(val):
    try:
        return int(val)
    except Exception:
        return 0

# ------------------------------------

@chat_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        query = data.get("query") or data.get("message")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # 1️⃣ Small talk / greetings
        small_talk = handle_small_talk(query)
        if small_talk:
            return jsonify({
                "message": small_talk["response"],
                "data": []
            })

        # 2️⃣ Parse query
        parsed = parse_query(query)
        print("🧠 PARSED QUERY:", parsed)

        filters = parsed.get("filters", [])
        keywords = parsed.get("keywords", [])
        intent = parsed.get("intent")
        limit = parsed.get("limit") or 5

        # 3️⃣ Resolve symbols
        symbols = resolve_symbols(parsed)

        # 👉 IMPORTANT FIX:
        # Intent-based queries without symbols = ALL stocks
        if intent and not symbols:
            symbols = None

        # 4️⃣ Run screener
        results = run_screener(filters, symbols)

        if not results:
            return jsonify({
                "message": "No stocks matched your criteria",
                "data": []
            })

        # 5️⃣ Intent-based sorting
        if intent == "high_price":
            results = sorted(
                results,
                key=lambda x: safe_float(x.get("close")),
                reverse=True
            )

        elif intent == "low_price":
            results = sorted(
                results,
                key=lambda x: safe_float(x.get("close"))
            )

        elif intent == "high_volume":
            results = sorted(
                results,
                key=lambda x: safe_int(x.get("volume")),
                reverse=True
            )

        elif intent == "low_volume":
            results = sorted(
                results,
                key=lambda x: safe_int(x.get("volume"))
            )

        # 6️⃣ Apply limit (FROM PARSER)
        results = results[:limit]

        return jsonify({
            "message": f"Found {len(results)} matching stocks",
            "query": query,
            "intent": intent,
            "limit": limit,
            "symbols_used": symbols,
            "data": results
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "Failed to process query",
            "details": str(e)
        }), 500
