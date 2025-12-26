import os

# Directory where uploaded CSVs are stored
UPLOAD_DIR = "app/data/uploads"

# Words that mean "all stocks", not a specific company
GENERIC_KEYWORDS = {"stocks", "stock", "market", "nse", "shares", "all"}

def resolve_symbols(parsed_query: dict):
    """
    Resolve stock symbols from uploaded CSV filenames.

    Example:
    cleaned_AXISBANK.csv  → AXISBANK
    cleaned_ADANIPORTS.csv → ADANIPORTS
    """

    if not os.path.exists(UPLOAD_DIR):
        return []

    # 1️⃣ Extract symbols from filenames
    files = os.listdir(UPLOAD_DIR)
    symbols = [
        f.replace("cleaned_", "").replace(".csv", "")
        for f in files
        if f.endswith(".csv")
    ]

    # 2️⃣ Get keywords from parsed query
    raw_keywords = parsed_query.get("keywords", [])

    # Remove generic words like "stocks", "market"
    keywords = [
        k.lower() for k in raw_keywords
        if k.lower() not in GENERIC_KEYWORDS
    ]

    # 3️⃣ If no meaningful keywords → return ALL symbols
    if not keywords:
        return symbols

    # 4️⃣ Match keywords against symbols
    matched = []
    for sym in symbols:
        sym_lower = sym.lower()
        for kw in keywords:
            if kw in sym_lower:
                matched.append(sym)

    # 5️⃣ Remove duplicates
    return list(set(matched))
