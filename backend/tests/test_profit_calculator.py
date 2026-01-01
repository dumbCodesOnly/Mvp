import pytest
from app.utils.profit_calculator import calculate_daily_btc, calculate_monthly_profit, calculate_roi_days, estimate_earnings

def test_calculate_daily_btc():
    """Test the calculation of daily BTC earnings."""
    daily_btc = calculate_daily_btc(100, 500000000)
    assert daily_btc > 0

def test_calculate_monthly_profit():
    """Test the calculation of monthly profit."""
    monthly_profit = calculate_monthly_profit(100, 500000000, 50000)
    assert monthly_profit > 0

def test_calculate_roi_days():
    """Test the calculation of ROI in days."""
    roi_days = calculate_roi_days(1000, 100, 500000000, 50000)
    assert roi_days > 0

def test_estimate_earnings():
    """Test the estimation of earnings."""
    earnings = estimate_earnings(100, 30, 500000000, 50000)
    assert 'total_usd' in earnings
    assert earnings['total_usd'] > 0

def test_calculate_daily_btc_zero_network_hashrate():
    """Test daily BTC calculation with zero network hashrate."""
    daily_btc = calculate_daily_btc(100, 0)
    assert daily_btc == 0

def test_calculate_roi_days_zero_daily_profit():
    """Test ROI calculation with zero daily profit."""
    roi_days = calculate_roi_days(1000, 0, 500000000, 50000)
    assert roi_days == 0
