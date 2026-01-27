
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app.utils.market_data import get_batch_latest_data, get_csv_data

print("Testing market_data.py...")
print(f"CWD: {os.getcwd()}")

# Try to find a CSV file to test with
data_dir = os.path.join("app", "data", "uploads")
if os.path.exists(data_dir):
    files = [f for f in os.listdir(data_dir) if f.startswith("cleaned_") and f.endswith(".csv")]
    if files:
        test_file = files[0]
        symbol = test_file.replace("cleaned_", "").replace(".csv", "")
        print(f"Found test symbol: {symbol}")
        
        # Test get_csv_data
        data = get_csv_data(symbol)
        print(f"get_csv_data({symbol}) returned {len(data)} records")
        if data:
            print(f"Latest: {data[-1]}")
            
        # Test get_batch_latest_data
        batch_res = get_batch_latest_data([symbol])
        print(f"get_batch_latest_data returned: {batch_res}")
    else:
        print("No CSV files found in app/data/uploads")
else:
    print(f"DATA_DIR not found at {data_dir}")
