import requests
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

cache = {}
CACHE_DURATION = timedelta(minutes=5)

def get_cached_or_fetch(key, fetch_func):
    now = datetime.utcnow()
    
    if key in cache:
        cached_data, cached_time = cache[key]
        if now - cached_time < CACHE_DURATION:
            age_seconds = (now - cached_time).total_seconds()
            logger.debug(f'Cache hit for {key} (age: {age_seconds:.1f}s)')
            return cached_data
    
    logger.debug(f'Cache miss for {key}, fetching fresh data')
    data = fetch_func()
    cache[key] = (data, now)
    return data

def get_btc_price():
    def fetch():
        try:
            logger.info('Fetching BTC price from CoinDesk API')
            response = requests.get('https://api.coindesk.com/v1/bpi/currentprice.json', timeout=10)
            response.raise_for_status()
            data = response.json()
            price = float(data['bpi']['USD']['rate'].replace(',', ''))
            logger.info(f'BTC price fetched successfully: ${price:,.2f}')
            return price
        except Exception as e:
            logger.error(f"Error fetching BTC price: {e}", exc_info=True)
            logger.warning('Using fallback BTC price: $50,000')
            return 50000.0
    
    return get_cached_or_fetch('btc_price', fetch)

def get_network_hashrate():
    def fetch():
        try:
            logger.info('Fetching network hashrate from Blockchain.info')
            response = requests.get('https://blockchain.info/q/hashrate', timeout=10)
            response.raise_for_status()
            hashrate_gh = float(response.text)
            hashrate_th = hashrate_gh / 1_000
            logger.info(f'Network hashrate fetched: {hashrate_th:,.0f} TH/s')
            return hashrate_th
        except Exception as e:
            logger.error(f"Error fetching network hashrate: {e}", exc_info=True)
            logger.warning('Using fallback network hashrate: 500,000,000 TH/s')
            return 500_000_000.0
    
    return get_cached_or_fetch('network_hashrate', fetch)

def get_mining_difficulty():
    def fetch():
        try:
            logger.info('Fetching mining difficulty from Mempool.space')
            response = requests.get('https://mempool.space/api/v1/mining/hashrate/difficulty', timeout=10)
            response.raise_for_status()
            data = response.json()
            difficulty_data = {
                'difficulty': data.get('currentDifficulty', 50_000_000_000_000),
                'adjustment': data.get('difficultyChange', 0)
            }
            logger.info(f'Difficulty fetched: {difficulty_data["difficulty"]:,.0f}, Adjustment: {difficulty_data["adjustment"]}%')
            return difficulty_data
        except Exception as e:
            logger.error(f"Error fetching difficulty: {e}", exc_info=True)
            logger.warning('Using fallback difficulty values')
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
