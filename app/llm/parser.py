import os
import json
import re
from google import genai
from google.genai import types
from app.llm.prompt import PROMPT_TEMPLATE

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

INTENT_SYNONYMS = {
    "high_price": ["high", "highest", "top", "expensive", "costliest"],
    "low_price": ["low", "lowest", "cheap", "cheapest", "lowet"],
    "high_volume": ["most traded", "high volume", "top volume"],
    "low_volume": ["low volume", "least traded"],
}

GENERIC_WORDS = {
    "stock", "stocks", "market", "nse", "shares",
    "show", "me", "get", "find", "give", "list"
}

SMALL_TALK = {
    "hi", "hello", "hey", "hii", "hlo",
    "good morning", "good evening", "good afternoon"
}

# ---------------- HELPERS ----------------

def extract_limit(text: str):
    match = re.search(r'(top|first)\s*(\d+)', text)
    return int(match.group(2)) if match else None


def detect_intent(text: str):
    for intent, words in INTENT_SYNONYMS.items():
        if any(w in text for w in words):
            return intent
    return None


def extract_keywords(text: str):
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [
        w for w in words
        if w not in GENERIC_WORDS
        and w not in sum(INTENT_SYNONYMS.values(), [])
    ]

# ---------------- MAIN ----------------

def parse_query(query: str) -> dict:
    q = query.strip().lower()

    # 1️⃣ Small talk
    if q in SMALL_TALK:
        return {"ignore": True}

    # 2️⃣ ALWAYS extract limit first
    limit = extract_limit(q)

    # 3️⃣ Detect intent & keywords
    intent = detect_intent(q)
    keywords = extract_keywords(q)

    # 4️⃣ Rule-based response (no LLM)
    if intent or keywords:
        return {
            "intent": intent,
            "keywords": keywords,
            "filters": [],
            "limit": limit
        }

    # 5️⃣ LLM fallback
    prompt = PROMPT_TEMPLATE.replace("{query}", query)

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=512
        )
    )

    raw = response.text.strip()

    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(raw)

    parsed.setdefault("filters", [])
    parsed.setdefault("keywords", [])
    parsed.setdefault("limit", limit)

    return parsed
