from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Payment, Rental

bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = get_jwt_identity()
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
    
    return jsonify(payment.to_dict()), 201

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_payments():
    user_id = get_jwt_identity()
    payments = Payment.query.filter_by(user_id=user_id).all()
    
    return jsonify([payment.to_dict() for payment in payments]), 200

@bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    
    if payment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(payment.to_dict()), 200

@bp.route('/webhook', methods=['POST'])
def payment_webhook():
    data = request.get_json()
    
    tx_hash = data.get('tx_hash')
    status = data.get('status')
    
    payment = Payment.query.filter_by(tx_hash=tx_hash).first()
    
    if payment and status == 'confirmed':
        payment.status = 'confirmed'
        payment.confirmed_at = db.func.now()
        
        if payment.rental_id:
            rental = Rental.query.get(payment.rental_id)
            if rental:
                rental.is_active = True
        
        db.session.commit()
    
    return jsonify({'message': 'Webhook received'}), 200
