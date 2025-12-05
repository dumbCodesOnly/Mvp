import logging
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Payment, Rental, Miner, User, Referral, Payout

bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = int(get_jwt_identity())
    current_app.logger.info(f'=== Checkout Request by User ID: {user_id} ===')
    data = request.get_json()
    
    miner_id = data.get('miner_id')
    hashrate = data.get('hashrate_allocated')
    duration_days = data.get('duration_days', 30)
    crypto_type = data.get('crypto_type', 'BTC')
    
    if not miner_id:
        return jsonify({'error': 'Miner ID is required'}), 400
    
    if duration_days is not None and (duration_days < 1 or duration_days > 365):
        return jsonify({'error': 'Duration must be between 1 and 365 days'}), 400
    
    miner = Miner.query.get(miner_id)
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    if miner.available_units <= 0:
        return jsonify({'error': 'No units available for this miner'}), 400
    
    if hashrate is None:
        hashrate = miner.hashrate_th
    
    if hashrate <= 0 or hashrate > miner.hashrate_th:
        return jsonify({'error': f'Hashrate must be between 0 and {miner.hashrate_th} TH/s'}), 400
    
    hashrate_ratio = hashrate / miner.hashrate_th
    total_price = miner.price_usd * hashrate_ratio * (duration_days / 30)
    monthly_fee = miner.price_usd * 0.05 * hashrate_ratio
    
    if total_price <= 0:
        return jsonify({'error': 'Invalid order total'}), 400
    
    rental = Rental(
        user_id=user_id,
        miner_id=miner_id,
        hashrate_allocated=hashrate,
        duration_days=duration_days,
        monthly_fee_usd=monthly_fee,
        is_active=False
    )
    db.session.add(rental)
    db.session.flush()
    
    payment = Payment(
        user_id=user_id,
        rental_id=rental.id,
        amount_usd=round(total_price, 2),
        crypto_type=crypto_type,
        status='pending'
    )
    db.session.add(payment)
    db.session.commit()
    
    current_app.logger.info(f'Checkout completed: Rental ID={rental.id}, Payment ID={payment.id}, Amount=${total_price:.2f}')
    
    return jsonify({
        'rental': rental.to_dict(),
        'payment': payment.to_dict(),
        'miner': miner.to_dict(),
        'total_price_usd': round(total_price, 2),
        'message': 'Order created successfully. Complete payment to activate your rental.'
    }), 201


@bp.route('/<int:payment_id>/simulate-confirm', methods=['PUT'])
@jwt_required()
def simulate_payment_confirm(payment_id):
    user_id = int(get_jwt_identity())
    current_app.logger.info(f'=== Simulate Payment Confirmation: {payment_id} by User {user_id} ===')
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    
    if payment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if payment.status == 'confirmed':
        return jsonify({'error': 'Payment already confirmed'}), 400
    
    payment.status = 'confirmed'
    payment.confirmed_at = datetime.utcnow()
    payment.tx_hash = f'sim_{secrets.token_hex(32)}'
    
    if payment.rental_id:
        rental = Rental.query.get(payment.rental_id)
        if rental:
            rental.is_active = True
            rental.start_date = datetime.utcnow()
            rental.end_date = rental.start_date + timedelta(days=rental.duration_days)
            
            miner = Miner.query.get(rental.miner_id)
            if miner and miner.available_units > 0:
                miner.available_units -= 1
            
            rental_user = User.query.get(rental.user_id)
            if rental_user and rental_user.referred_by:
                referral_percent = current_app.config.get('REFERRAL_PERCENT', 3.0)
                if miner:
                    commission_amount = (payment.amount_usd * referral_percent) / 100
                    
                    referral = Referral.query.filter_by(
                        referrer_id=rental_user.referred_by,
                        referred_id=rental_user.id
                    ).first()
                    
                    if not referral:
                        referral = Referral(
                            referrer_id=rental_user.referred_by,
                            referred_id=rental_user.id,
                            commission_earned_usd=0.0
                        )
                        db.session.add(referral)
                        db.session.flush()
                        current_app.logger.info(f'Created new referral record for referrer {rental_user.referred_by}')
                    
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
            
            current_app.logger.info(f'Rental activated: ID={rental.id}')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Payment confirmed and rental activated',
        'payment': payment.to_dict()
    }), 200


@bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = int(get_jwt_identity())
    current_app.logger.info(f'=== Create Payment Request by User ID: {user_id} ===')
    data = request.get_json()
    
    payment = Payment(
        user_id=user_id,
        rental_id=data.get('rental_id'),
        amount_usd=data['amount_usd'],
        crypto_type=data.get('crypto_type', 'BTC'),
        status='pending'
    )
    
    db.session.add(payment)
    db.session.commit()
    current_app.logger.info(f'Payment created: ID={payment.id}, Amount=${payment.amount_usd}, Type={payment.crypto_type}')
    
    return jsonify(payment.to_dict()), 201

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_payments():
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching payments for user ID: {user_id}')
    payments = Payment.query.filter_by(user_id=user_id).all()
    current_app.logger.info(f'Retrieved {len(payments)} payments for user {user_id}')
    
    return jsonify([payment.to_dict() for payment in payments]), 200

@bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching payment ID: {payment_id} for user: {user_id}')
    payment = Payment.query.get(payment_id)
    
    if not payment:
        current_app.logger.warning(f'Payment not found: ID {payment_id}')
        return jsonify({'error': 'Payment not found'}), 404
    
    if payment.user_id != user_id:
        current_app.logger.warning(f'Unauthorized payment access: User {user_id} tried to access payment {payment_id}')
        return jsonify({'error': 'Unauthorized'}), 403
    
    current_app.logger.debug(f'Payment retrieved: ID {payment_id}')
    return jsonify(payment.to_dict()), 200

@bp.route('/webhook', methods=['POST'])
def payment_webhook():
    current_app.logger.info('=== Payment Webhook Received ===')
    data = request.get_json()
    
    tx_hash = data.get('tx_hash')
    status = data.get('status')
    current_app.logger.debug(f'Webhook data: tx_hash={tx_hash}, status={status}')
    
    payment = Payment.query.filter_by(tx_hash=tx_hash).first()
    
    if payment and status == 'confirmed':
        current_app.logger.info(f'Payment confirmed: ID={payment.id}, tx_hash={tx_hash}')
        payment.status = 'confirmed'
        payment.confirmed_at = db.func.now()
        
        if payment.rental_id:
            rental = Rental.query.get(payment.rental_id)
            if rental:
                rental.is_active = True
                current_app.logger.info(f'Rental activated via webhook: Rental ID={rental.id}')
        
        db.session.commit()
    else:
        current_app.logger.warning(f'Webhook ignored: Payment not found or status is {status}')
    
    return jsonify({'message': 'Webhook received'}), 200
