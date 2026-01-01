import os
import logging
from datetime import timedelta


def get_database_uri():
    uri = os.environ.get('DATABASE_URL')
    if uri:
        if uri.startswith('postgres://'):
            uri = uri.replace('postgres://', 'postgresql+psycopg://', 1)
        elif uri.startswith('postgresql://'):
            uri = uri.replace('postgresql://', 'postgresql+psycopg://', 1)
    else:
        # Use SQLite for local development if DATABASE_URL is not set
        basedir = os.path.abspath(os.path.dirname(__file__))
        uri = 'sqlite:///' + os.path.join(basedir, 'app.db')
        logging.info(f"DATABASE_URL not set, falling back to SQLite: {uri}")
    return uri


class Config:
    SECRET_KEY = os.environ.get('SESSION_SECRET') or os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = get_database_uri()
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


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
