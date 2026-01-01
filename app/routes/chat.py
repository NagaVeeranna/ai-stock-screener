from flask import Blueprint, request, jsonify
import traceback

# Core logic imports
from app.llm.parser import parse_query
from app.screener.runner import run_screener
from app.services.stock_resolver import resolve_symbols
from app.services.chat_intelligence import handle_small_talk

chat_bp = Blueprint("chat_bp", __name__)

# --- UTILITIES ---

def safe_numeric(val, default=0, dtype=float):
    """Safely converts values for robust sorting, handling NaN and empty strings."""
    if val is None or val == "":
        return default
    try:
        return dtype(val)
    except (ValueError, TypeError):
        return default

# --- CORE LOGIC HANDLERS ---

def apply_intent_sorting(results, intent):
    """
    Centralized sorting logic based on AI-detected intent. 
    """
    if not intent:
        return results
        
    sort_config = {
        "low_price":     {"key": lambda x: safe_numeric(x.get("close")), "reverse": False},
        "high_price":    {"key": lambda x: safe_numeric(x.get("close")), "reverse": True},
        "high_volume":   {"key": lambda x: safe_numeric(x.get("volume"), dtype=int), "reverse": True},
        "low_volume":    {"key": lambda x: safe_numeric(x.get("volume"), dtype=int), "reverse": False},
        "high_delivery": {"key": lambda x: safe_numeric(x.get("%deliverble")), "reverse": True},
        "high_turnover": {"key": lambda x: safe_numeric(x.get("turnover")), "reverse": True},
        "high_trades":   {"key": lambda x: safe_numeric(x.get("trades"), dtype=int), "reverse": True}
    }
    
    config = sort_config.get(intent)
    if config:
        return sorted(results, key=config["key"], reverse=config["reverse"])
    return results

# --- MAIN ROUTE ---

@chat_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        query = data.get("query") or data.get("message")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # 1. Immediate Intercept: Greetings / Small Talk
        small_talk = handle_small_talk(query)
        if small_talk:
            return jsonify({"message": small_talk["response"], "data": []})

        # 2. NLP Processing & Intent Extraction
        parsed = parse_query(query)
        intent = parsed.get("intent")
        filters = parsed.get("filters", [])
        keywords = parsed.get("keywords", [])
        
        # ✅ FIX: CAPTURE FROM UI TOGGLES
        # data.get("quarters") captures the manual button click from the UI.
        # parsed.get("quarters") captures it if the user typed "last 4 quarters".
        quarters = data.get("quarters") or parsed.get("quarters") 
        
        # 3. Symbol Resolution
        symbols = resolve_symbols(parsed)
        
        # 🛡️ LOGIC GUARD: Symbol Search
        if keywords and not symbols:
            return jsonify({
                "message": f"I couldn't find data for '{', '.join(keywords)}'.",
                "data": [],
                "status": "not_found"
            })

        # Global scan logic
        if not keywords and not symbols and intent:
            symbols = None 

        # 4. Data Retrieval with Quarterly Support
        results = run_screener(filters, symbols, quarters=quarters)

        if not results:
            return jsonify({
                "message": "No stocks matched your criteria for the selected period.",
                "data": []
            })

        # 5. Result Optimization
        results = apply_intent_sorting(results, intent)
        
        limit_val = parsed.get("limit")
        limit = int(limit_val) if limit_val and str(limit_val).isdigit() else None
        
        total_found = len(results)
        if limit:
            results = results[:limit]

        # 6. Dynamic Response Construction
        period_msg = f"over the last {quarters} quarters" if quarters else "current"
        intent_label = intent.replace("_", " ") if intent else "matching"
        message = f"Found {len(results)} {intent_label} stocks {period_msg}."

        return jsonify({
            "message": message,
            "query": query,
            "intent": intent,
            "quarters": quarters,
            "data": results,
            "count": len(results),
            "total_universe": total_found
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An internal error occurred.", "details": str(e)}), 500