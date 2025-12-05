import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get('SESSION_SECRET') or os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    MAINTENANCE_FEE_PERCENT = float(os.environ.get('MAINTENANCE_FEE_PERCENT', 5.0))
    REFERRAL_PERCENT = float(os.environ.get('REFERRAL_PERCENT', 3.0))
    PAYMENT_GATEWAY_API_KEY = os.environ.get('PAYMENT_GATEWAY_API_KEY', '')
    
    BTC_BLOCK_REWARD = 3.125
    BLOCKS_PER_DAY = 144
    BLOCKS_PER_MONTH = 4320


class DevelopmentConfig(Config):
    DEBUG = True
    

class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
