from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import Rental, Miner, User

bp = Blueprint('rentals', __name__, url_prefix='/api/rentals')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_rental():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    miner = Miner.query.get(data['miner_id'])
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    hashrate = data.get('hashrate_allocated', miner.hashrate_th)
    duration_days = data.get('duration_days', 30)
    
    rental = Rental(
        user_id=user_id,
        miner_id=data['miner_id'],
        hashrate_allocated=hashrate,
        duration_days=duration_days,
        monthly_fee_usd=data.get('monthly_fee_usd', 0),
        is_active=False
    )
    
    db.session.add(rental)
    db.session.commit()
    
    return jsonify(rental.to_dict()), 201

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_rentals():
    user_id = get_jwt_identity()
    rentals = Rental.query.filter_by(user_id=user_id).all()
    
    return jsonify([rental.to_dict() for rental in rentals]), 200

@bp.route('/<int:rental_id>', methods=['GET'])
@jwt_required()
def get_rental(rental_id):
    user_id = get_jwt_identity()
    rental = Rental.query.get(rental_id)
    
    if not rental:
        return jsonify({'error': 'Rental not found'}), 404
    
    if rental.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(rental.to_dict()), 200

@bp.route('/<int:rental_id>/activate', methods=['PUT'])
@jwt_required()
def activate_rental(rental_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    rental = Rental.query.get(rental_id)
    
    if not rental:
        return jsonify({'error': 'Rental not found'}), 404
    
    if rental.user_id != user_id and not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    rental.is_active = True
    rental.start_date = datetime.utcnow()
    rental.end_date = rental.start_date + timedelta(days=rental.duration_days)
    
    db.session.commit()
    
    return jsonify(rental.to_dict()), 200
