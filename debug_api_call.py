
import requests
import time

start = time.time()
try:
    print("Sending request...")
    res = requests.get("http://localhost:5000/gateway/watchlist/5", timeout=15)
    print(f"Status: {res.status_code}")
    print(f"Time: {time.time() - start:.2f}s")
    # print(res.json()) # Don't print huge json
    data = res.json()
    if 'watchlist' in data:
        print(f"Items: {len(data['watchlist'])}")
        if len(data['watchlist']) > 0:
            print(f"First item: {data['watchlist'][0]}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Time: {time.time() - start:.2f}s")
