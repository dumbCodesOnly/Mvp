from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Miner, User
from app.utils.profit_calculator import calculate_monthly_profit, calculate_daily_btc
from app.utils.api_fetcher import get_btc_price, get_network_hashrate

bp = Blueprint('miners', __name__, url_prefix='/api/miners')

@bp.route('/', methods=['GET'])
def get_miners():
    miners = Miner.query.all()
    return jsonify([miner.to_dict() for miner in miners]), 200

@bp.route('/<int:miner_id>', methods=['GET'])
def get_miner(miner_id):
    miner = Miner.query.get(miner_id)
    
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    return jsonify(miner.to_dict()), 200

@bp.route('/<int:miner_id>/estimate', methods=['POST'])
def estimate_profit(miner_id):
    miner = Miner.query.get(miner_id)
    
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    data = request.get_json()
    hashrate = data.get('hashrate', miner.hashrate_th)
    duration_days = data.get('duration_days', 30)
    
    try:
        btc_price = get_btc_price()
        network_hashrate = get_network_hashrate()
        
        daily_btc = calculate_daily_btc(hashrate, network_hashrate)
        monthly_profit = calculate_monthly_profit(hashrate, network_hashrate, btc_price)
        
        total_days = duration_days
        total_btc = daily_btc * total_days
        total_usd = total_btc * btc_price
        
        return jsonify({
            'hashrate_th': hashrate,
            'duration_days': duration_days,
            'btc_price': btc_price,
            'network_hashrate_th': network_hashrate,
            'daily_btc': daily_btc,
            'monthly_btc': daily_btc * 30,
            'monthly_usd': monthly_profit,
            'total_btc': total_btc,
            'total_usd': total_usd,
            'roi_days': int(miner.price_usd / (daily_btc * btc_price)) if daily_btc > 0 else 0
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_miner():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    miner = Miner(
        name=data['name'],
        model=data['model'],
        hashrate_th=data['hashrate_th'],
        price_usd=data['price_usd'],
        efficiency=data['efficiency'],
        power_watts=data['power_watts'],
        available_units=data.get('available_units', 100),
        description=data.get('description', ''),
        image_url=data.get('image_url', '')
    )
    
    db.session.add(miner)
    db.session.commit()
    
    return jsonify(miner.to_dict()), 201

@bp.route('/<int:miner_id>', methods=['PUT'])
@jwt_required()
def update_miner(miner_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    miner = Miner.query.get(miner_id)
    
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    data = request.get_json()
    
    miner.name = data.get('name', miner.name)
    miner.model = data.get('model', miner.model)
    miner.hashrate_th = data.get('hashrate_th', miner.hashrate_th)
    miner.price_usd = data.get('price_usd', miner.price_usd)
    miner.efficiency = data.get('efficiency', miner.efficiency)
    miner.power_watts = data.get('power_watts', miner.power_watts)
    miner.available_units = data.get('available_units', miner.available_units)
    miner.description = data.get('description', miner.description)
    miner.image_url = data.get('image_url', miner.image_url)
    
    db.session.commit()
    
    return jsonify(miner.to_dict()), 200
