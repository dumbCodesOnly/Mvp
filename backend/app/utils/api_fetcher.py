import requests
import logging
from datetime import datetime, timedelta
from threading import Lock

logger = logging.getLogger(__name__)

cache = {}
CACHE_DURATION = timedelta(minutes=10)

class CircuitBreaker:
    def __init__(self, name, failure_threshold=5, recovery_timeout=60, half_open_max_calls=3):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'CLOSED'
        self.half_open_calls = 0
        self.lock = Lock()
    
    def can_execute(self):
        with self.lock:
            if self.state == 'CLOSED':
                return True
            elif self.state == 'OPEN':
                if self._should_attempt_reset():
                    self.state = 'HALF_OPEN'
                    self.half_open_calls = 0
                    logger.info(f'Circuit {self.name}: OPEN -> HALF_OPEN (attempting recovery)')
                    return True
                return False
            elif self.state == 'HALF_OPEN':
                if self.half_open_calls < self.half_open_max_calls:
                    self.half_open_calls += 1
                    return True
                return False
        return False
    
    def _should_attempt_reset(self):
        if self.last_failure_time is None:
            return True
        return (datetime.utcnow() - self.last_failure_time).total_seconds() >= self.recovery_timeout
    
    def record_success(self):
        with self.lock:
            if self.state == 'HALF_OPEN':
                logger.info(f'Circuit {self.name}: HALF_OPEN -> CLOSED (recovery successful)')
            self.failure_count = 0
            self.state = 'CLOSED'
            self.half_open_calls = 0
    
    def record_failure(self):
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = datetime.utcnow()
            
            if self.state == 'HALF_OPEN':
                self.state = 'OPEN'
                logger.warning(f'Circuit {self.name}: HALF_OPEN -> OPEN (recovery failed)')
            elif self.failure_count >= self.failure_threshold:
                self.state = 'OPEN'
                logger.warning(f'Circuit {self.name}: CLOSED -> OPEN (failure threshold reached: {self.failure_count})')
    
    def get_state(self):
        return {
            'name': self.name,
            'state': self.state,
            'failure_count': self.failure_count,
            'last_failure': self.last_failure_time.isoformat() if self.last_failure_time else None
        }

circuit_breakers = {
    'binance': CircuitBreaker('binance', failure_threshold=3, recovery_timeout=60),
    'coinbase': CircuitBreaker('coinbase', failure_threshold=3, recovery_timeout=60),
    'coingecko': CircuitBreaker('coingecko', failure_threshold=3, recovery_timeout=120),
    'blockchain_info': CircuitBreaker('blockchain_info', failure_threshold=3, recovery_timeout=60),
    'mempool': CircuitBreaker('mempool', failure_threshold=3, recovery_timeout=60)
}

FALLBACK_VALUES = {
    'btc_price': 50000.0,
    'network_hashrate': 500_000_000.0,
    'difficulty': {'difficulty': 50_000_000_000_000, 'adjustment': 0}
}

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

def _fetch_from_binance():
    """Fetch BTC price from Binance API (primary source - very high rate limits)"""
    cb = circuit_breakers['binance']
    
    if not cb.can_execute():
        logger.debug('Circuit breaker OPEN for Binance API')
        return None
    
    try:
        logger.info('Fetching BTC price from Binance API')
        response = requests.get(
            'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
            timeout=10
        )
        
        if response.status_code == 429:
            logger.warning('Binance API rate limited (429)')
            cb.record_failure()
            return None
        
        response.raise_for_status()
        data = response.json()
        price = float(data['price'])
        logger.info(f'BTC price from Binance: ${price:,.2f}')
        cb.record_success()
        return price
    except Exception as e:
        logger.error(f"Error fetching from Binance: {e}")
        cb.record_failure()
        return None

def _fetch_from_coinbase():
    """Fetch BTC price from Coinbase API (secondary source - 10k requests/hour)"""
    cb = circuit_breakers['coinbase']
    
    if not cb.can_execute():
        logger.debug('Circuit breaker OPEN for Coinbase API')
        return None
    
    try:
        logger.info('Fetching BTC price from Coinbase API')
        response = requests.get(
            'https://api.coinbase.com/v2/prices/BTC-USD/spot',
            timeout=10
        )
        
        if response.status_code == 429:
            logger.warning('Coinbase API rate limited (429)')
            cb.record_failure()
            return None
        
        response.raise_for_status()
        data = response.json()
        price = float(data['data']['amount'])
        logger.info(f'BTC price from Coinbase: ${price:,.2f}')
        cb.record_success()
        return price
    except Exception as e:
        logger.error(f"Error fetching from Coinbase: {e}")
        cb.record_failure()
        return None

def _fetch_from_coingecko():
    """Fetch BTC price from CoinGecko API (tertiary fallback - limited rate)"""
    cb = circuit_breakers['coingecko']
    
    if not cb.can_execute():
        logger.debug('Circuit breaker OPEN for CoinGecko API')
        return None
    
    try:
        logger.info('Fetching BTC price from CoinGecko API')
        response = requests.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
            timeout=10
        )
        
        if response.status_code == 429:
            logger.warning('CoinGecko API rate limited (429)')
            cb.record_failure()
            return None
        
        response.raise_for_status()
        data = response.json()
        price = float(data['bitcoin']['usd'])
        logger.info(f'BTC price from CoinGecko: ${price:,.2f}')
        cb.record_success()
        return price
    except Exception as e:
        logger.error(f"Error fetching from CoinGecko: {e}")
        cb.record_failure()
        return None

def get_btc_price():
    def fetch():
        price = _fetch_from_coinbase()
        if price is not None:
            return price
        
        logger.info('Coinbase unavailable, trying Binance...')
        price = _fetch_from_binance()
        if price is not None:
            return price
        
        logger.info('Binance unavailable, trying CoinGecko...')
        price = _fetch_from_coingecko()
        if price is not None:
            return price
        
        if 'btc_price' in cache:
            logger.warning('All APIs failed, using cached BTC price')
            return cache['btc_price'][0]
        
        logger.warning(f'Using fallback BTC price: ${FALLBACK_VALUES["btc_price"]:,.0f}')
        return FALLBACK_VALUES['btc_price']
    
    return get_cached_or_fetch('btc_price', fetch)

def get_network_hashrate():
    def fetch():
        cb = circuit_breakers['blockchain_info']
        
        if not cb.can_execute():
            logger.warning(f'Circuit breaker OPEN for Blockchain.info API, using cached/fallback value')
            if 'network_hashrate' in cache:
                return cache['network_hashrate'][0]
            return FALLBACK_VALUES['network_hashrate']
        
        try:
            logger.info('Fetching network hashrate from Blockchain.info')
            response = requests.get('https://blockchain.info/q/hashrate', timeout=10)
            
            if response.status_code == 429:
                logger.warning('Blockchain.info API rate limited (429)')
                cb.record_failure()
                if 'network_hashrate' in cache:
                    return cache['network_hashrate'][0]
                return FALLBACK_VALUES['network_hashrate']
            
            response.raise_for_status()
            hashrate_gh = float(response.text)
            hashrate_th = hashrate_gh / 1_000
            logger.info(f'Network hashrate fetched: {hashrate_th:,.0f} TH/s')
            cb.record_success()
            return hashrate_th
        except Exception as e:
            logger.error(f"Error fetching network hashrate: {e}", exc_info=True)
            cb.record_failure()
            if 'network_hashrate' in cache:
                logger.warning('Using cached network hashrate due to API error')
                return cache['network_hashrate'][0]
            logger.warning(f'Using fallback network hashrate: {FALLBACK_VALUES["network_hashrate"]:,.0f} TH/s')
            return FALLBACK_VALUES['network_hashrate']
    
    return get_cached_or_fetch('network_hashrate', fetch)

def get_mining_difficulty():
    def fetch():
        cb = circuit_breakers['mempool']
        
        if not cb.can_execute():
            logger.warning(f'Circuit breaker OPEN for Mempool.space API, using cached/fallback value')
            if 'difficulty' in cache:
                return cache['difficulty'][0]
            return FALLBACK_VALUES['difficulty']
        
        try:
            logger.info('Fetching mining difficulty from Mempool.space')
            response = requests.get('https://mempool.space/api/v1/mining/hashrate/difficulty', timeout=10)
            
            if response.status_code == 429:
                logger.warning('Mempool.space API rate limited (429)')
                cb.record_failure()
                if 'difficulty' in cache:
                    return cache['difficulty'][0]
                return FALLBACK_VALUES['difficulty']
            
            response.raise_for_status()
            data = response.json()
            difficulty_data = {
                'difficulty': data.get('currentDifficulty', 50_000_000_000_000),
                'adjustment': data.get('difficultyChange', 0)
            }
            logger.info(f'Difficulty fetched: {difficulty_data["difficulty"]:,.0f}, Adjustment: {difficulty_data["adjustment"]}%')
            cb.record_success()
            return difficulty_data
        except Exception as e:
            logger.error(f"Error fetching difficulty: {e}", exc_info=True)
            cb.record_failure()
            if 'difficulty' in cache:
                logger.warning('Using cached difficulty due to API error')
                return cache['difficulty'][0]
            logger.warning('Using fallback difficulty values')
            return FALLBACK_VALUES['difficulty']
    
    return get_cached_or_fetch('difficulty', fetch)

def get_network_stats():
    return {
        'btc_price': get_btc_price(),
        'network_hashrate_th': get_network_hashrate(),
        'difficulty': get_mining_difficulty()
    }

def get_circuit_breaker_status():
    return {name: cb.get_state() for name, cb in circuit_breakers.items()}
