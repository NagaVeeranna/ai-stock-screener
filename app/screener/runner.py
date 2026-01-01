import pandas as pd
import os

UPLOAD_DIR = "app/data/uploads"
NUMERIC_COLS = ["open", "high", "low", "close", "volume", "vwap", "turnover", "trades", "%deliverble"]
INVALID_SYMBOLS = {"STOCKS", "ALL", "MARKET", "SHARES"}

def run_screener(filters, symbols=None, quarters=None):
    results = []

    if not os.path.exists(UPLOAD_DIR):
        return results

    if symbols:
        symbols = [s.upper() for s in symbols]

    for file in os.listdir(UPLOAD_DIR):
        if not file.endswith(".csv"):
            continue

        symbol = file.replace("cleaned_", "").replace(".csv", "").upper()

        if not symbol or symbol in INVALID_SYMBOLS:
            continue

        if symbols and symbol not in symbols:
            continue

        df = pd.read_csv(os.path.join(UPLOAD_DIR, file))

        if df.empty:
            continue

        # 🔒 Numeric normalization
        for col in NUMERIC_COLS:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # 📅 Date parsing
        date_col = next((c for c in df.columns if c.lower() == "date"), None)
        if date_col:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True, format='mixed')
            df = df.dropna(subset=[date_col]) 
            df = df.sort_values(date_col)

        # ✅ FIXED: Quarterly Aggregation Logic
        if quarters and date_col:
            df = df.set_index(date_col)
            # QE = Quarter End. We take the 'last' price to represent the end of that quarter
            df = df.resample('QE').agg({
                'close': 'last',      
                'open': 'first',      
                'volume': 'sum',      
                'high': 'max',        
                'low': 'min',         
                'turnover': 'sum',    
                'trades': 'sum'       
            }).dropna()
            
            # Take only the requested number of quarters
            df = df.tail(quarters).reset_index()
            df = df.rename(columns={'index': date_col})

        # Apply standard filters
        for f in filters:
            field, op, val = f["field"], f["operator"], f["value"]
            if field not in df.columns: continue
            if op == "<": df = df[df[field] < val]
            elif op == ">": df = df[df[field] > val]
            elif op == "==": df = df[df[field] == val]
            elif op == "<=": df = df[df[field] <= val]
            elif op == ">=": df = df[df[field] >= val]

        if df.empty:
            continue

        # ✅ DYNAMIC OUTPUT LOGIC
        # If symbols are provided, we are on the StockDetail page and need ALL rows for the chart
        if symbols and len(symbols) > 0:
            history_records = df.to_dict('records')
            for record in history_records:
                record["symbol"] = symbol
                if date_col in record:
                    # Format date for frontend JS compatibility
                    record[date_col] = record[date_col].strftime('%Y-%m-%d')
            results.extend(history_records)
        else:
            # DASHBOARD MODE: Return only the final aggregated row
            latest = df.iloc[-1].to_dict()
            latest["symbol"] = symbol
            
            # Numeric cleanup for JSON stability
            latest["close"] = float(latest.get("close", 0)) if pd.notna(latest.get("close")) else 0.0
            latest["volume"] = int(latest.get("volume", 0)) if pd.notna(latest.get("volume")) else 0
            
            if latest["close"] > 0:
                results.append(latest)

    return results