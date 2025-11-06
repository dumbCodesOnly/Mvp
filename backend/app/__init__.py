from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    from app.routes import auth, miners, rentals, referrals, payments, stats
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(miners.bp)
    app.register_blueprint(rentals.bp)
    app.register_blueprint(referrals.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(stats.bp)
    
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'message': 'Bitcoin Cloud Mining API is running'}
    
    return app
