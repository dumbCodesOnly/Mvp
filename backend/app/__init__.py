import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from app.config import config
from app.logging_config import setup_logging

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
    
    setup_logging(app)
    
    app.logger.info('Initializing database extensions')
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    app.logger.info('Database and security extensions initialized')
    
    app.logger.info('Registering blueprints')
    from app.routes import auth, miners, rentals, referrals, payments, stats, admin
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(miners.bp)
    app.register_blueprint(rentals.bp)
    app.register_blueprint(referrals.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(stats.bp)
    app.register_blueprint(admin.bp)
    app.logger.info('All blueprints registered successfully')
    
    @app.route('/api/health')
    def health():
        app.logger.debug('Health check endpoint called')
        return {'status': 'healthy', 'message': 'Bitcoin Cloud Mining API is running'}
    
    return app
