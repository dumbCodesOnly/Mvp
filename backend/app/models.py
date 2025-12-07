from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import string

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    referral_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    referred_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    rentals = db.relationship('Rental', backref='user', lazy='dynamic')
    payments = db.relationship('Payment', backref='user', lazy='dynamic')
    referrals_made = db.relationship('Referral', foreign_keys='Referral.referrer_id', backref='referrer', lazy='dynamic')
    referrals_received = db.relationship('Referral', foreign_keys='Referral.referred_id', backref='referred', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def generate_referral_code():
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(chars) for _ in range(8))
            if not User.query.filter_by(referral_code=code).first():
                return code
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'referral_code': self.referral_code,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }

class Miner(db.Model):
    __tablename__ = 'miners'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    hashrate_th = db.Column(db.Float, nullable=False)
    price_usd = db.Column(db.Float, nullable=False)
    efficiency = db.Column(db.Float, nullable=False)
    power_watts = db.Column(db.Float, nullable=False)
    available_units = db.Column(db.Integer, default=100)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    rentals = db.relationship('Rental', backref='miner', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model,
            'hashrate_th': self.hashrate_th,
            'price_usd': self.price_usd,
            'efficiency': self.efficiency,
            'power_watts': self.power_watts,
            'available_units': self.available_units,
            'description': self.description,
            'image_url': self.image_url
        }

class Rental(db.Model):
    __tablename__ = 'rentals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    miner_id = db.Column(db.Integer, db.ForeignKey('miners.id'), nullable=False)
    hashrate_allocated = db.Column(db.Float, nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=False)
    total_profit_btc = db.Column(db.Float, default=0.0)
    monthly_fee_usd = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='rental', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'miner_id': self.miner_id,
            'miner_name': self.miner.name if self.miner else None,
            'hashrate_allocated': self.hashrate_allocated,
            'duration_days': self.duration_days,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'total_profit_btc': self.total_profit_btc,
            'monthly_fee_usd': self.monthly_fee_usd,
            'created_at': self.created_at.isoformat()
        }

class Referral(db.Model):
    __tablename__ = 'referrals'
    
    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    referred_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    commission_earned_usd = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'referrer_id': self.referrer_id,
            'referred_id': self.referred_id,
            'commission_earned_usd': self.commission_earned_usd,
            'created_at': self.created_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rental_id = db.Column(db.Integer, db.ForeignKey('rentals.id'), nullable=True)
    amount_usd = db.Column(db.Float, nullable=False)
    crypto_type = db.Column(db.String(20), default='BTC')
    tx_hash = db.Column(db.String(256), nullable=True)
    status = db.Column(db.String(20), default='pending')
    confirmed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'rental_id': self.rental_id,
            'amount_usd': self.amount_usd,
            'crypto_type': self.crypto_type,
            'tx_hash': self.tx_hash,
            'status': self.status,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'created_at': self.created_at.isoformat()
        }


class Payout(db.Model):
    __tablename__ = 'payouts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    referral_id = db.Column(db.Integer, db.ForeignKey('referrals.id'), nullable=True)
    rental_id = db.Column(db.Integer, db.ForeignKey('rentals.id'), nullable=True)
    amount_usd = db.Column(db.Float, nullable=False)
    payout_type = db.Column(db.String(20), default='referral_commission')
    status = db.Column(db.String(20), default='pending')
    processed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('payouts', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'referral_id': self.referral_id,
            'rental_id': self.rental_id,
            'amount_usd': self.amount_usd,
            'payout_type': self.payout_type,
            'status': self.status,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat()
        }


class SystemSettings(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.String(500), nullable=False)
    description = db.Column(db.String(500))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @staticmethod
    def get_setting(key, default=None):
        setting = SystemSettings.query.filter_by(key=key).first()
        return setting.value if setting else default
    
    @staticmethod
    def set_setting(key, value, description=None):
        setting = SystemSettings.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
            if description:
                setting.description = description
        else:
            setting = SystemSettings(key=key, value=str(value), description=description)
            db.session.add(setting)
        db.session.commit()
        return setting
    
    @staticmethod
    def get_all_settings():
        settings = SystemSettings.query.all()
        return {s.key: {'value': s.value, 'description': s.description, 'updated_at': s.updated_at.isoformat() if s.updated_at else None} for s in settings}
    
    @staticmethod
    def initialize_defaults():
        defaults = {
            'referral_percentage': ('5.0', 'Referral commission percentage (e.g., 5.0 means 5%)'),
            'profit_percentage': ('10.0', 'Daily profit percentage for mining rentals'),
            'min_withdrawal': ('50.0', 'Minimum withdrawal amount in USD'),
            'maintenance_fee_percentage': ('2.0', 'Maintenance fee percentage deducted from profits'),
            'btc_mining_reward': ('0.00001', 'Base BTC reward per TH/s per day')
        }
        for key, (value, description) in defaults.items():
            if not SystemSettings.query.filter_by(key=key).first():
                setting = SystemSettings(key=key, value=value, description=description)
                db.session.add(setting)
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
