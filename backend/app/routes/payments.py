import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Payment, Rental

bp = Blueprint('payments', __name__, url_prefix='/api/payments')

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
