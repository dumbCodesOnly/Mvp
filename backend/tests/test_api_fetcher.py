import pytest
import requests
import time
from unittest.mock import MagicMock
from app.utils.api_fetcher import get_btc_price, get_network_hashrate, get_mining_difficulty, CircuitBreaker, cache, circuit_breakers

@pytest.fixture(autouse=True)
def setup_teardown():
    """Fixture to clear cache and reset circuit breakers before and after each test."""
    cache.clear()
    for cb in circuit_breakers.values():
        cb.state = 'CLOSED'
        cb.failure_count = 0
    yield
    cache.clear()
    for cb in circuit_breakers.values():
        cb.state = 'CLOSED'
        cb.failure_count = 0

def test_get_btc_price_success_coinbase(monkeypatch):
    """Test successful BTC price fetching from Coinbase."""
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {'data': {'amount': '51000.00'}}
    monkeypatch.setattr(requests, 'get', lambda *args, **kwargs: mock_response)

    price = get_btc_price()
    assert price == 51000.00

def test_get_btc_price_fallback_to_binance(monkeypatch):
    """Test fallback to Binance when Coinbase fails."""
    mock_binance_response = MagicMock()
    mock_binance_response.raise_for_status.return_value = None
    mock_binance_response.json.return_value = {'price': '52000.00'}

    def mock_get(url, *args, **kwargs):
        if 'coinbase' in url:
            raise requests.exceptions.RequestException("Coinbase failed")
        elif 'binance' in url:
            return mock_binance_response
        else:
            raise requests.exceptions.RequestException("Other API failed")

    monkeypatch.setattr(requests, 'get', mock_get)

    price = get_btc_price()
    assert price == 52000.00

def test_get_btc_price_all_fail_fallback(monkeypatch):
    """Test fallback to default value when all APIs fail."""
    def mock_get_fail(*args, **kwargs):
        raise requests.exceptions.RequestException("API failed")
    monkeypatch.setattr(requests, 'get', mock_get_fail)

    price = get_btc_price()
    assert price == 50000.0

def test_get_network_hashrate_success(monkeypatch):
    """Test successful network hashrate fetching."""
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.text = '600000000'
    monkeypatch.setattr(requests, 'get', lambda *args, **kwargs: mock_response)

    hashrate = get_network_hashrate()
    assert hashrate == 600000.0

def test_get_network_hashrate_fail_fallback(monkeypatch):
    """Test network hashrate fallback on failure."""
    def mock_get_fail(*args, **kwargs):
        raise requests.exceptions.RequestException("API Error")
    monkeypatch.setattr(requests, 'get', mock_get_fail)
    hashrate = get_network_hashrate()
    assert hashrate == 500_000_000.0

def test_get_mining_difficulty_success(monkeypatch):
    """Test successful mining difficulty fetching."""
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {'currentDifficulty': 60e12, 'difficultyChange': 1.2}
    monkeypatch.setattr(requests, 'get', lambda *args, **kwargs: mock_response)

    difficulty = get_mining_difficulty()
    assert difficulty['difficulty'] == 60e12

def test_circuit_breaker_opens_on_failures():
    """Test that the CircuitBreaker opens after enough failures."""
    cb = CircuitBreaker('test_breaker', failure_threshold=2, recovery_timeout=60)

    assert cb.state == 'CLOSED'
    cb.record_failure()
    assert cb.state == 'CLOSED'
    cb.record_failure()
    assert cb.state == 'OPEN'
    assert not cb.can_execute()

def test_circuit_breaker_half_open_and_close():
    """Test the transition from OPEN to HALF_OPEN and then to CLOSED."""
    cb = CircuitBreaker('test_breaker', failure_threshold=1, recovery_timeout=0.1)

    cb.record_failure()
    assert cb.state == 'OPEN'

    time.sleep(0.2)

    assert cb.can_execute()
    assert cb.state == 'HALF_OPEN'

    cb.record_success()
    assert cb.state == 'CLOSED'
