import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import Rental, Miner, User, Referral, Payout

bp = Blueprint('rentals', __name__, url_prefix='/api/rentals')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_rental():
    user_id = int(get_jwt_identity())
    current_app.logger.info(f'=== Create Rental Request by User ID: {user_id} ===')
    data = request.get_json()
    
    miner = Miner.query.get(data['miner_id'])
    if not miner:
        current_app.logger.warning(f'Rental creation failed: Miner ID {data["miner_id"]} not found')
        return jsonify({'error': 'Miner not found'}), 404
    
    hashrate = data.get('hashrate_allocated', miner.hashrate_th)
    duration_days = data.get('duration_days', 30)
    current_app.logger.debug(f'Creating rental: Miner={miner.name}, Hashrate={hashrate} TH/s, Duration={duration_days} days')
    
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
    current_app.logger.info(f'Rental created (ID: {rental.id}) for user {user_id}')
    
    return jsonify(rental.to_dict()), 201

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_rentals():
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching rentals for user ID: {user_id}')
    rentals = Rental.query.filter_by(user_id=user_id).all()
    current_app.logger.info(f'Retrieved {len(rentals)} rentals for user {user_id}')
    
    return jsonify([rental.to_dict() for rental in rentals]), 200

@bp.route('/<int:rental_id>', methods=['GET'])
@jwt_required()
def get_rental(rental_id):
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching rental ID: {rental_id} for user: {user_id}')
    rental = Rental.query.get(rental_id)
    
    if not rental:
        current_app.logger.warning(f'Rental not found: ID {rental_id}')
        return jsonify({'error': 'Rental not found'}), 404
    
    if rental.user_id != user_id:
        current_app.logger.warning(f'Unauthorized rental access attempt: User {user_id} tried to access rental {rental_id}')
        return jsonify({'error': 'Unauthorized'}), 403
    
    current_app.logger.debug(f'Rental retrieved: ID {rental_id}')
    return jsonify(rental.to_dict()), 200

@bp.route('/<int:rental_id>/activate', methods=['PUT'])
@jwt_required()
def activate_rental(rental_id):
    user_id = int(get_jwt_identity())
    current_app.logger.info(f'=== Activate Rental Request: ID {rental_id} by User {user_id} ===')
    user = User.query.get(user_id)
    
    rental = Rental.query.get(rental_id)
    
    if not rental:
        current_app.logger.warning(f'Activation failed: Rental ID {rental_id} not found')
        return jsonify({'error': 'Rental not found'}), 404
    
    if rental.user_id != user_id and not user.is_admin:
        current_app.logger.warning(f'Unauthorized activation attempt: User {user_id} tried to activate rental {rental_id}')
        return jsonify({'error': 'Unauthorized'}), 403
    
    rental.is_active = True
    rental.start_date = datetime.utcnow()
    rental.end_date = rental.start_date + timedelta(days=rental.duration_days)
    
    rental_user = User.query.get(rental.user_id)
    if rental_user and rental_user.referred_by:
        referral_percent = current_app.config.get('REFERRAL_PERCENT', 3.0)
        miner = Miner.query.get(rental.miner_id)
        if miner:
            commission_amount = (miner.price_usd * referral_percent) / 100
            
            referral = Referral.query.filter_by(
                referrer_id=rental_user.referred_by,
                referred_id=rental_user.id
            ).first()
            
            if referral:
                referral.commission_earned_usd += commission_amount
                
                payout = Payout(
                    user_id=rental_user.referred_by,
                    referral_id=referral.id,
                    rental_id=rental.id,
                    amount_usd=commission_amount,
                    payout_type='referral_commission',
                    status='pending'
                )
                db.session.add(payout)
                current_app.logger.info(f'Referral commission credited: ${commission_amount:.2f} to user {rental_user.referred_by}')
    
    db.session.commit()
    current_app.logger.info(f'Rental activated: ID {rental_id}, Start: {rental.start_date}, End: {rental.end_date}')
    
    return jsonify(rental.to_dict()), 200
