def handle_small_talk(query: str):
    q = query.lower().strip()

    greetings = {"hi", "hello", "hey", "hii", "hlo"}

    # 🚫 If query contains stock-related words, DO NOT greet
    stock_words = {"stock", "stocks", "price", "volume", "high", "low", "top"}

    if q in greetings:
        return {
            "response": (
                "Hi 👋 I’m your AI Stock Screener.\n\n"
               
            )
        }

    return None
