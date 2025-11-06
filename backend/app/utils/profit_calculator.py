from app.config import Config

def calculate_daily_btc(user_hashrate_th, network_hashrate_th):
    if network_hashrate_th == 0:
        return 0.0
    
    hashrate_share = user_hashrate_th / network_hashrate_th
    
    daily_blocks = Config.BLOCKS_PER_DAY
    block_reward = Config.BTC_BLOCK_REWARD
    
    daily_btc = hashrate_share * daily_blocks * block_reward
    
    return daily_btc

def calculate_monthly_profit(user_hashrate_th, network_hashrate_th, btc_price_usd):
    daily_btc = calculate_daily_btc(user_hashrate_th, network_hashrate_th)
    
    monthly_btc = daily_btc * 30
    
    maintenance_fee = Config.MAINTENANCE_FEE_PERCENT / 100
    net_btc = monthly_btc * (1 - maintenance_fee)
    
    monthly_profit_usd = net_btc * btc_price_usd
    
    return monthly_profit_usd

def calculate_roi_days(investment_usd, user_hashrate_th, network_hashrate_th, btc_price_usd):
    daily_btc = calculate_daily_btc(user_hashrate_th, network_hashrate_th)
    
    if daily_btc == 0:
        return 0
    
    maintenance_fee = Config.MAINTENANCE_FEE_PERCENT / 100
    net_daily_btc = daily_btc * (1 - maintenance_fee)
    
    daily_profit_usd = net_daily_btc * btc_price_usd
    
    if daily_profit_usd == 0:
        return 0
    
    roi_days = investment_usd / daily_profit_usd
    
    return int(roi_days)

def estimate_earnings(hashrate_th, duration_days, network_hashrate_th, btc_price_usd):
    daily_btc = calculate_daily_btc(hashrate_th, network_hashrate_th)
    
    maintenance_fee = Config.MAINTENANCE_FEE_PERCENT / 100
    net_daily_btc = daily_btc * (1 - maintenance_fee)
    
    total_btc = net_daily_btc * duration_days
    total_usd = total_btc * btc_price_usd
    
    return {
        'daily_btc': net_daily_btc,
        'monthly_btc': net_daily_btc * 30,
        'total_btc': total_btc,
        'total_usd': total_usd,
        'maintenance_fee_percent': Config.MAINTENANCE_FEE_PERCENT
    }
