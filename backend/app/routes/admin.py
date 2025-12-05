import logging
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from datetime import datetime
from app.models import User, Miner, Rental, Payment, Referral, Payout

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            current_app.logger.warning(f'Admin access denied for user ID: {user_id}')
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@bp.route('/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    current_app.logger.info('=== Admin Dashboard Stats Request ===')
    
    total_users = User.query.count()
    total_miners = Miner.query.count()
    total_rentals = Rental.query.count()
    active_rentals = Rental.query.filter_by(is_active=True).count()
    
    total_revenue = db.session.query(func.sum(Payment.amount_usd)).filter(
        Payment.status == 'confirmed'
    ).scalar() or 0
    
    pending_payments = Payment.query.filter_by(status='pending').count()
    
    total_hashrate = db.session.query(func.sum(Rental.hashrate_allocated)).filter(
        Rental.is_active == True
    ).scalar() or 0
    
    total_referral_commission = db.session.query(func.sum(Referral.commission_earned_usd)).scalar() or 0
    
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    recent_rentals = Rental.query.order_by(Rental.created_at.desc()).limit(5).all()
    
    stats = {
        'users': {
            'total': total_users,
            'recent': [u.to_dict() for u in recent_users]
        },
        'miners': {
            'total': total_miners
        },
        'rentals': {
            'total': total_rentals,
            'active': active_rentals,
            'recent': [r.to_dict() for r in recent_rentals]
        },
        'revenue': {
            'total_usd': round(total_revenue, 2),
            'pending_payments': pending_payments,
            'referral_commissions': round(total_referral_commission, 2)
        },
        'hashrate': {
            'total_active_th': round(total_hashrate, 2)
        }
    }
    
    current_app.logger.info(f'Admin stats retrieved: {total_users} users, {total_rentals} rentals, ${total_revenue} revenue')
    return jsonify(stats), 200

@bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    current_app.logger.info('=== Admin Get All Users Request ===')
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    if search:
        query = query.filter(User.email.ilike(f'%{search}%'))
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = {
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }
    
    current_app.logger.info(f'Admin retrieved {len(users.items)} users (page {page})')
    return jsonify(result), 200

@bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    current_app.logger.info(f'=== Admin Get User Details: {user_id} ===')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_rentals = Rental.query.filter_by(user_id=user_id).all()
    user_payments = Payment.query.filter_by(user_id=user_id).all()
    user_referrals = Referral.query.filter_by(referrer_id=user_id).all()
    
    result = {
        'user': user.to_dict(),
        'rentals': [r.to_dict() for r in user_rentals],
        'payments': [p.to_dict() for p in user_payments],
        'referrals': [ref.to_dict() for ref in user_referrals],
        'stats': {
            'total_rentals': len(user_rentals),
            'active_rentals': len([r for r in user_rentals if r.is_active]),
            'total_spent_usd': sum(p.amount_usd for p in user_payments if p.status == 'confirmed'),
            'total_referrals': len(user_referrals),
            'referral_earnings_usd': sum(ref.commission_earned_usd for ref in user_referrals)
        }
    }
    
    current_app.logger.info(f'Admin retrieved details for user: {user.email}')
    return jsonify(result), 200

@bp.route('/users/<int:user_id>/toggle-admin', methods=['PUT'])
@admin_required
def toggle_user_admin(user_id):
    current_app.logger.info(f'=== Admin Toggle Admin Status: {user_id} ===')
    
    current_user_id = int(get_jwt_identity())
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot modify your own admin status'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_admin = not user.is_admin
    db.session.commit()
    
    current_app.logger.info(f'Admin status toggled for user {user.email}: is_admin={user.is_admin}')
    return jsonify({
        'message': f'Admin status updated for {user.email}',
        'user': user.to_dict()
    }), 200

@bp.route('/miners', methods=['GET'])
@admin_required
def get_all_miners_admin():
    current_app.logger.info('=== Admin Get All Miners Request ===')
    miners = Miner.query.order_by(Miner.created_at.desc()).all()
    
    result = []
    for miner in miners:
        miner_data = miner.to_dict()
        miner_data['rental_count'] = Rental.query.filter_by(miner_id=miner.id).count()
        miner_data['active_rentals'] = Rental.query.filter_by(miner_id=miner.id, is_active=True).count()
        result.append(miner_data)
    
    current_app.logger.info(f'Admin retrieved {len(miners)} miners')
    return jsonify(result), 200

@bp.route('/miners', methods=['POST'])
@admin_required
def create_miner():
    current_app.logger.info('=== Admin Create Miner Request ===')
    data = request.get_json()
    
    required_fields = ['name', 'model', 'hashrate_th', 'price_usd', 'efficiency', 'power_watts']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    miner = Miner(
        name=data['name'],
        model=data['model'],
        hashrate_th=float(data['hashrate_th']),
        price_usd=float(data['price_usd']),
        efficiency=float(data['efficiency']),
        power_watts=float(data['power_watts']),
        available_units=int(data.get('available_units', 100)),
        description=data.get('description', ''),
        image_url=data.get('image_url', '')
    )
    
    db.session.add(miner)
    db.session.commit()
    
    current_app.logger.info(f'Admin created miner: {miner.name} (ID: {miner.id})')
    return jsonify({
        'message': 'Miner created successfully',
        'miner': miner.to_dict()
    }), 201

@bp.route('/miners/<int:miner_id>', methods=['PUT'])
@admin_required
def update_miner(miner_id):
    current_app.logger.info(f'=== Admin Update Miner: {miner_id} ===')
    
    miner = Miner.query.get(miner_id)
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        miner.name = data['name']
    if 'model' in data:
        miner.model = data['model']
    if 'hashrate_th' in data:
        miner.hashrate_th = float(data['hashrate_th'])
    if 'price_usd' in data:
        miner.price_usd = float(data['price_usd'])
    if 'efficiency' in data:
        miner.efficiency = float(data['efficiency'])
    if 'power_watts' in data:
        miner.power_watts = float(data['power_watts'])
    if 'available_units' in data:
        miner.available_units = int(data['available_units'])
    if 'description' in data:
        miner.description = data['description']
    if 'image_url' in data:
        miner.image_url = data['image_url']
    
    db.session.commit()
    
    current_app.logger.info(f'Admin updated miner: {miner.name} (ID: {miner.id})')
    return jsonify({
        'message': 'Miner updated successfully',
        'miner': miner.to_dict()
    }), 200

@bp.route('/miners/<int:miner_id>', methods=['DELETE'])
@admin_required
def delete_miner(miner_id):
    current_app.logger.info(f'=== Admin Delete Miner: {miner_id} ===')
    
    miner = Miner.query.get(miner_id)
    if not miner:
        return jsonify({'error': 'Miner not found'}), 404
    
    active_rentals = Rental.query.filter_by(miner_id=miner_id, is_active=True).count()
    if active_rentals > 0:
        return jsonify({'error': f'Cannot delete miner with {active_rentals} active rentals'}), 400
    
    db.session.delete(miner)
    db.session.commit()
    
    current_app.logger.info(f'Admin deleted miner ID: {miner_id}')
    return jsonify({'message': 'Miner deleted successfully'}), 200

@bp.route('/rentals', methods=['GET'])
@admin_required
def get_all_rentals_admin():
    current_app.logger.info('=== Admin Get All Rentals Request ===')
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')
    
    query = Rental.query
    if status == 'active':
        query = query.filter_by(is_active=True)
    elif status == 'inactive':
        query = query.filter_by(is_active=False)
    
    rentals = query.order_by(Rental.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = {
        'rentals': [r.to_dict() for r in rentals.items],
        'total': rentals.total,
        'pages': rentals.pages,
        'current_page': page
    }
    
    current_app.logger.info(f'Admin retrieved {len(rentals.items)} rentals (page {page})')
    return jsonify(result), 200

@bp.route('/payments', methods=['GET'])
@admin_required
def get_all_payments_admin():
    current_app.logger.info('=== Admin Get All Payments Request ===')
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')
    
    query = Payment.query
    if status:
        query = query.filter_by(status=status)
    
    payments = query.order_by(Payment.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = {
        'payments': [p.to_dict() for p in payments.items],
        'total': payments.total,
        'pages': payments.pages,
        'current_page': page
    }
    
    current_app.logger.info(f'Admin retrieved {len(payments.items)} payments (page {page})')
    return jsonify(result), 200


@bp.route('/payouts', methods=['GET'])
@admin_required
def get_all_payouts_admin():
    current_app.logger.info('=== Admin Get All Payouts Request ===')
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')
    
    query = Payout.query
    if status:
        query = query.filter_by(status=status)
    
    payouts = query.order_by(Payout.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = []
    for payout in payouts.items:
        payout_data = payout.to_dict()
        user = User.query.get(payout.user_id)
        payout_data['user_email'] = user.email if user else None
        result.append(payout_data)
    
    response = {
        'payouts': result,
        'total': payouts.total,
        'pages': payouts.pages,
        'current_page': page,
        'pending_total': db.session.query(func.sum(Payout.amount_usd)).filter(
            Payout.status == 'pending'
        ).scalar() or 0
    }
    
    current_app.logger.info(f'Admin retrieved {len(payouts.items)} payouts (page {page})')
    return jsonify(response), 200


@bp.route('/payouts/<int:payout_id>/process', methods=['PUT'])
@admin_required
def process_payout(payout_id):
    current_app.logger.info(f'=== Admin Process Payout: {payout_id} ===')
    
    payout = Payout.query.get(payout_id)
    if not payout:
        return jsonify({'error': 'Payout not found'}), 404
    
    if payout.status != 'pending':
        return jsonify({'error': f'Payout already {payout.status}'}), 400
    
    payout.status = 'paid'
    payout.processed_at = datetime.utcnow()
    
    db.session.commit()
    
    current_app.logger.info(f'Admin processed payout ID: {payout_id}, Amount: ${payout.amount_usd}')
    return jsonify({
        'message': 'Payout processed successfully',
        'payout': payout.to_dict()
    }), 200


@bp.route('/payouts/process-all', methods=['PUT'])
@admin_required
def process_all_pending_payouts():
    current_app.logger.info('=== Admin Process All Pending Payouts ===')
    
    pending_payouts = Payout.query.filter_by(status='pending').all()
    
    if not pending_payouts:
        return jsonify({'message': 'No pending payouts to process'}), 200
    
    total_amount = 0
    for payout in pending_payouts:
        payout.status = 'paid'
        payout.processed_at = datetime.utcnow()
        total_amount += payout.amount_usd
    
    db.session.commit()
    
    current_app.logger.info(f'Admin processed {len(pending_payouts)} payouts, Total: ${total_amount}')
    return jsonify({
        'message': f'Processed {len(pending_payouts)} payouts',
        'total_amount_usd': round(total_amount, 2),
        'count': len(pending_payouts)
    }), 200
