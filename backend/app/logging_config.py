import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    log_level = logging.DEBUG if app.debug else logging.INFO
    
    log_format = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s (%(funcName)s:%(lineno)d): %(message)s'
    )
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(log_format)
    
    os.makedirs('logs', exist_ok=True)
    file_handler = RotatingFileHandler(
        'logs/cloudminer.log',
        maxBytes=10485760,
        backupCount=10
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(log_format)
    
    app.logger.addHandler(console_handler)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(log_level)
    
    app.logger.info('=' * 80)
    app.logger.info('CloudMiner Application Starting')
    app.logger.info(f'Debug Mode: {app.debug}')
    app.logger.info(f'Log Level: {logging.getLevelName(log_level)}')
    app.logger.info('=' * 80)
