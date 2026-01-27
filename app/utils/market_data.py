
import os
import requests
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np

# Load environment variables
load_dotenv()

# Constants
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "uploads")

MARKET_API_KEY = os.getenv("MARKET_API_KEY")
MARKETSTACK_BASE_URL = "http://api.marketstack.com/v1/eod"

def get_marketstack_symbol(symbol):
    """Convert symbol to Marketstack format (defaults to NSE)"""
    clean = symbol.replace('.XNSE', '').replace('.NS', '').replace('.NSE', '').replace('.BSE', '')
    return f"{clean}.XNSE"

def clean_symbol_from_file(filename):
    """Extract symbol from cleaned filename"""
    if filename.startswith('cleaned_'):
        symbol = filename[8:]  # Remove 'cleaned_'
    else:
        symbol = filename
    
    if symbol.endswith('.csv'):
        symbol = symbol[:-4]  # Remove '.csv'
    
    return symbol.upper()

def get_market_status():
    """Check if market is open/closed with detailed info"""
    now = datetime.now()
    is_weekend = now.weekday() >= 5
    
    # Market hours
    market_start = now.replace(hour=9, minute=15, second=0, microsecond=0)
    market_end = now.replace(hour=15, minute=30, second=0, microsecond=0)
    
    is_open = False
    if not is_weekend and market_start <= now <= market_end:
        is_open = True
    
    next_open_date = now
    if is_weekend:
        # Next Monday
        days_until_monday = (7 - now.weekday()) % 7
        next_open_date = now + timedelta(days=days_until_monday)
    elif now > market_end:
        # Tomorrow if weekday
        next_open_date = now + timedelta(days=1)
        if next_open_date.weekday() >= 5:
            # Skip to Monday
            days_until_monday = (7 - next_open_date.weekday()) % 7
            next_open_date += timedelta(days=days_until_monday)
    
    next_open_time = next_open_date.replace(hour=9, minute=15, second=0, microsecond=0)
    
    return {
        "isOpen": is_open,
        "isWeekend": is_weekend,
        "currentTime": now.isoformat(),
        "marketHours": {
            "start": "09:15",
            "end": "15:30"
        },
        "nextOpen": next_open_time.isoformat(),
        "closeTime": "15:30",
        "status": "open" if is_open else "closed"
    }

def fetch_marketstack_data(symbol, date_from=None, date_to=None, limit=100):
    """Generic MarketStack API fetcher"""
    if not MARKET_API_KEY:
        return None
    
    try:
        ms_symbol = get_marketstack_symbol(symbol)
        params = {
            "access_key": MARKET_API_KEY,
            "symbols": ms_symbol,
            "sort": "ASC",
            "limit": limit
        }
        
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        response = requests.get(MARKETSTACK_BASE_URL, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"MarketStack API Error: {e}")
        return None

def process_api_data(api_response):
    """Process MarketStack API response into standardized format"""
    if not api_response or "data" not in api_response:
        return []
    
    formatted_data = []
    for item in api_response["data"]:
        if item:
            formatted_data.append({
                "date": item.get("date", "")[:10],
                "time": item.get("date", "")[:10],  # Added time field
                "open": round(float(item.get("open") or 0), 2),
                "high": round(float(item.get("high") or 0), 2),
                "low": round(float(item.get("low") or 0), 2),
                "close": round(float(item.get("close") or 0), 2),
                "volume": int(item.get("volume") or 0),
                "source": "API"
            })
    return formatted_data

def get_csv_data(symbol, start_date=None, end_date=None):
    """Robust CSV loader with filename auto-detection"""
    symbol = symbol.upper()
    csv_path = None

    if not os.path.exists(DATA_DIR):
        print("CSV directory not found:", DATA_DIR)
        return []

    # 🔍 Auto-detect CSV file (case-insensitive)
    for file in os.listdir(DATA_DIR):
        if file.lower() == f"cleaned_{symbol.lower()}.csv":
            csv_path = os.path.join(DATA_DIR, file)
            break

    if not csv_path:
        print(f"CSV not found for symbol: {symbol}")
        return []

    try:
        df = pd.read_csv(csv_path)

        if df.empty or 'date' not in df.columns or 'close' not in df.columns:
            print("Invalid CSV structure:", csv_path)
            return []

        df['date'] = pd.to_datetime(df['date'])

        if start_date:
            df = df[df['date'] >= pd.Timestamp(start_date)]
        if end_date:
            df = df[df['date'] <= pd.Timestamp(end_date)]

        df = df.sort_values('date')

        formatted = []
        for _, row in df.iterrows():
            formatted.append({
                "date": row['date'].strftime('%Y-%m-%d'),
                "time": row['date'].strftime('%Y-%m-%d'),
                "open": round(float(row.get('open', row['close'])), 2),
                "high": round(float(row.get('high', row['close'])), 2),
                "low": round(float(row.get('low', row['close'])), 2),
                "close": round(float(row['close']), 2),
                "volume": int(row.get('volume', 0)),
                "source": "CSV"
            })

        return formatted

    except Exception as e:
        print(f"CSV read error for {symbol}: {e}")
        return []

def get_latest_stock_data(symbol):
    """
    Get the latest stock data for a single symbol.
    Tries API first, then CSV.
    Returns a dictionary with current price, change, etc.
    """
    clean_sym = symbol.strip().upper()
    
    # Try API first
    api_response = fetch_marketstack_data(clean_sym, limit=2) # Get last 2 for change calc
    if api_response and "data" in api_response and len(api_response["data"]) > 0:
        data = api_response["data"]
        # MarketStack returns newest to oldest (limit=2 means today and yesterday)
        # BUT sorting is ASC in fetch_marketstack_data params? 
        # Wait, fetch_marketstack_data sets sort="ASC".
        # So it returns oldest to newest. 
        # If I requested limit=2 with ASC, I might get very old data if I didn't specify date_from!
        # Ah, fetch_marketstack_data default limit=100.
        
        # Correct logic for latest data extraction:
        # We need the *latest* data. 
        # MarketStack default sort is DESC usually, but I set ASC in fetch_marketstack_data.
        # If I want latest, I should probably ask for DESC or just take the last element of ASC.
        # But if I don't provide date_from, ASC will give me data from 100 years ago? No, MarketStack usually defaults to recent.
        pass
    
    # Actually, let's reuse the logic from get_today_stock in analytics.py but simplified.
    # It calls fetch_marketstack_data(clean_sym, limit=31)
    
    # For Watchlist, we just need the LATEST price.
    # So limit=2 is enough if we can get the latest.
    
    # Let's write a batch fetcher instead of single.
    pass

import concurrent.futures

def get_batch_latest_data(symbols):
    """
    Fetch latest data for multiple symbols.
    Returns a dict: { "SYMBOL": { price: 100, change: 2.5, ... } }
    """
    results = {}
    
    if not symbols:
        return {}
        
    # Optimization: Pre-scan directory to avoid repeated listdir calls
    symbol_to_file_map = {}
    if os.path.exists(DATA_DIR):
        for f in os.listdir(DATA_DIR):
            if f.startswith("cleaned_") and f.endswith(".csv"):
                # Clean filename to get symbol
                raw_sym = f.replace("cleaned_", "").replace(".csv", "")
                symbol_to_file_map[raw_sym.upper()] = os.path.join(DATA_DIR, f)

    # Parallelize the fetching process to speed up response time
    # Using thread pool but passing the resolved path
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        # Create a dictionary to map future to symbol
        future_to_symbol = {
            executor.submit(
                get_latest_stock_data_single, 
                sym, 
                symbol_to_file_map.get(sym.strip().upper())
            ): sym 
            for sym in symbols
        }
        
        for future in concurrent.futures.as_completed(future_to_symbol):
            sym = future_to_symbol[future]
            try:
                data = future.result()
                results[sym] = data
            except Exception as exc:
                print(f"Error fetching data for {sym}: {exc}")
                results[sym] = {
                    "price": 0,
                    "changePercent": 0,
                    "symbol": sym,
                    "source": "error"
                }

    return results

def get_latest_stock_data_single(symbol, csv_path_hint=None):
    """
    Helper to get latest data for one symbol (API > CSV).
    Returns dict with price, changePercent, etc.
    """
    clean_sym = symbol.strip().upper()
    
    # Default result
    result = {
        "price": 0,
        "changePercent": 0,
        "symbol": clean_sym,
        "source": "none"
    }

    # API
    if MARKET_API_KEY:
        try:
            # Get last 2 days for change calculation
            # We want the LATEST data. 
            # If we sort DESC, we get latest first.
            
            ms_symbol = get_marketstack_symbol(clean_sym)
            params = {
                "access_key": MARKET_API_KEY,
                "symbols": ms_symbol,
                "limit": 2,
                "sort": "DESC" # Get newest first
            }
            res = requests.get(MARKETSTACK_BASE_URL, params=params, timeout=5)
            if res.status_code == 200:
                json_data = res.json()
                if "data" in json_data and json_data["data"]:
                    items = json_data["data"]
                    latest = items[0]
                    
                    price = float(latest.get("close") or 0)
                    prev_close = price
                    
                    if len(items) > 1:
                        prev = items[1]
                        prev_close = float(prev.get("close") or price)
                        
                    change = price - prev_close
                    percent_change = (change / prev_close * 100) if prev_close else 0
                    
                    result["price"] = round(price, 2)
                    result["changePercent"] = round(percent_change, 2)
                    result["source"] = "api"
                    return result
        except Exception as e:
            # print(f"API Error for {symbol}: {e}")
            pass

    # CSV Fallback
    # Use the hint if provided, otherwise standard search
    if csv_path_hint:
        # Optimization: Use fast read_last_lines instead of pandas
        # This prevents reading the entire history for just the latest price
        try:
            last_lines = read_last_lines(csv_path_hint, n=2)
            if last_lines and len(last_lines) > 0:
                current_line = last_lines[-1].split(',')
                # Validate line has enough columns (close is index 8)
                if len(current_line) > 8:
                    price = float(current_line[8])
                    
                    prev_close = price
                    if len(last_lines) > 1:
                        prev_line = last_lines[-2].split(',')
                        if len(prev_line) > 8:
                            prev_close = float(prev_line[8])
                            
                    change = price - prev_close
                    percent_change = (change / prev_close * 100) if prev_close else 0
                    
                    result["price"] = round(price, 2)
                    result["changePercent"] = round(percent_change, 2)
                    result["source"] = "csv_fast"
                    return result
        except Exception as e:
            print(f"Fast CSV read error for {clean_sym}: {e}")
            # Fallback to standard method if parsing fails
            pass
            
        csv_data = get_csv_data_from_path(csv_path_hint, clean_sym)
    else:
        csv_data = get_csv_data(clean_sym)
        
    if csv_data:
        # csv_data is sorted by date ascending (oldest to newest)
        latest = csv_data[-1]
        price = latest["close"]
        
        prev_close = price
        if len(csv_data) > 1:
             prev = csv_data[-2]
             prev_close = prev["close"]
             
        change = price - prev_close
        percent_change = (change / prev_close * 100) if prev_close else 0
        
        result["price"] = round(price, 2)
        result["changePercent"] = round(percent_change, 2)
        result["source"] = "csv"
        
    return result

def read_last_lines(filename, n=2):
    """Read specifically the last n lines of a file efficiently"""
    if not os.path.exists(filename):
        return []
        
    try:
        with open(filename, 'rb') as f:
            try:
                f.seek(-2048, 2) # Go back 2KB from end
            except OSError:
                f.seek(0) # If file is smaller
                
            last_chunk = f.read().decode('utf-8', errors='ignore')
            lines = last_chunk.strip().split('\n')
            
            # Ensure we don't return the header if file is tiny
            if len(lines) > n:
                return lines[-n:]
            return lines
    except Exception:
        return []

def get_csv_data_from_path(csv_path, symbol):
    """Helper to read CSV from directly known path"""
    try:
        df = pd.read_csv(csv_path)

        if df.empty or 'date' not in df.columns or 'close' not in df.columns:
            return []

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        formatted = []
        for _, row in df.iterrows():
            formatted.append({
                "date": row['date'].strftime('%Y-%m-%d'),
                "time": row['date'].strftime('%Y-%m-%d'),
                "open": round(float(row.get('open', row['close'])), 2),
                "high": round(float(row.get('high', row['close'])), 2),
                "low": round(float(row.get('low', row['close'])), 2),
                "close": round(float(row['close']), 2),
                "volume": int(row.get('volume', 0)),
                "source": "CSV"
            })

        return formatted

    except Exception as e:
        print(f"CSV read error for {symbol}: {e}")
        return []
