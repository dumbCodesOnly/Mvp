import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Referral

bp = Blueprint('referrals', __name__, url_prefix='/api/referrals')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_referrals():
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching referrals for user ID: {user_id}')
    referrals = Referral.query.filter_by(referrer_id=user_id).all()
    
    result = []
    for ref in referrals:
        referred_user = User.query.get(ref.referred_id)
        result.append({
            **ref.to_dict(),
            'referred_email': referred_user.email if referred_user else None
        })
    
    current_app.logger.info(f'Retrieved {len(referrals)} referrals for user {user_id}')
    return jsonify(result), 200

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_referral_stats():
    user_id = int(get_jwt_identity())
    current_app.logger.debug(f'Fetching referral stats for user ID: {user_id}')
    user = User.query.get(user_id)
    
    if not user:
        current_app.logger.error(f'User not found for ID: {user_id}')
        return jsonify({'error': 'User not found'}), 404
    
    referrals = Referral.query.filter_by(referrer_id=user_id).all()
    total_commission = sum(ref.commission_earned_usd for ref in referrals)
    
    current_app.logger.info(f'Referral stats: User {user_id}, Count={len(referrals)}, Commission=${total_commission}')
    return jsonify({
        'referral_code': user.referral_code,
        'total_referrals': len(referrals),
        'total_commission_usd': total_commission
    }), 200
