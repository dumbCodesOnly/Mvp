import requests
from datetime import datetime, timedelta

cache = {}
CACHE_DURATION = timedelta(minutes=5)

def get_cached_or_fetch(key, fetch_func):
    now = datetime.utcnow()
    
    if key in cache:
        cached_data, cached_time = cache[key]
        if now - cached_time < CACHE_DURATION:
            return cached_data
    
    data = fetch_func()
    cache[key] = (data, now)
    return data

def get_btc_price():
    def fetch():
        try:
            response = requests.get('https://api.coindesk.com/v1/bpi/currentprice.json', timeout=10)
            response.raise_for_status()
            data = response.json()
            return float(data['bpi']['USD']['rate'].replace(',', ''))
        except Exception as e:
            print(f"Error fetching BTC price: {e}")
            return 50000.0
    
    return get_cached_or_fetch('btc_price', fetch)

def get_network_hashrate():
    def fetch():
        try:
            response = requests.get('https://blockchain.info/q/hashrate', timeout=10)
            response.raise_for_status()
            hashrate_gh = float(response.text)
            hashrate_th = hashrate_gh / 1_000
            return hashrate_th
        except Exception as e:
            print(f"Error fetching network hashrate: {e}")
            return 500_000_000.0
    
    return get_cached_or_fetch('network_hashrate', fetch)

def get_mining_difficulty():
    def fetch():
        try:
            response = requests.get('https://mempool.space/api/v1/mining/hashrate/difficulty', timeout=10)
            response.raise_for_status()
            data = response.json()
            return {
                'difficulty': data.get('currentDifficulty', 50_000_000_000_000),
                'adjustment': data.get('difficultyChange', 0)
            }
        except Exception as e:
            print(f"Error fetching difficulty: {e}")
            return {
                'difficulty': 50_000_000_000_000,
                'adjustment': 0
            }
    
    return get_cached_or_fetch('difficulty', fetch)

def get_network_stats():
    return {
        'btc_price': get_btc_price(),
        'network_hashrate_th': get_network_hashrate(),
        'difficulty': get_mining_difficulty()
    }
