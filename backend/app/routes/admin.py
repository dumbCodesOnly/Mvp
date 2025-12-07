import logging
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from datetime import datetime
from app.models import User, Miner, Rental, Payment, Referral, Payout, SystemSettings

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


@bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    current_app.logger.info('=== Admin Get Settings ===')
    settings = SystemSettings.get_all_settings()
    return jsonify(settings), 200


@bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    current_app.logger.info('=== Admin Update Settings ===')
    data = request.get_json()
    
    updated = []
    for key, value in data.items():
        if isinstance(value, dict):
            SystemSettings.set_setting(key, value.get('value', ''), value.get('description'))
        else:
            SystemSettings.set_setting(key, value)
        updated.append(key)
    
    current_app.logger.info(f'Admin updated settings: {updated}')
    return jsonify({
        'message': 'Settings updated successfully',
        'updated_keys': updated
    }), 200


@bp.route('/settings/<string:key>', methods=['PUT'])
@admin_required
def update_single_setting(key):
    current_app.logger.info(f'=== Admin Update Setting: {key} ===')
    data = request.get_json()
    
    value = data.get('value')
    description = data.get('description')
    
    if value is None:
        return jsonify({'error': 'Value is required'}), 400
    
    setting = SystemSettings.set_setting(key, value, description)
    current_app.logger.info(f'Admin updated setting {key} = {value}')
    
    return jsonify({
        'message': f'Setting {key} updated successfully',
        'setting': setting.to_dict()
    }), 200


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    current_app.logger.info(f'=== Admin Delete User: {user_id} ===')
    
    current_user_id = int(get_jwt_identity())
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    Payout.query.filter_by(user_id=user_id).delete()
    Referral.query.filter_by(referrer_id=user_id).delete()
    Referral.query.filter_by(referred_id=user_id).delete()
    Payment.query.filter_by(user_id=user_id).delete()
    Rental.query.filter_by(user_id=user_id).delete()
    
    db.session.delete(user)
    db.session.commit()
    
    current_app.logger.info(f'Admin deleted user ID: {user_id}')
    return jsonify({'message': 'User and all related data deleted successfully'}), 200


@bp.route('/rentals/<int:rental_id>', methods=['DELETE'])
@admin_required
def delete_rental(rental_id):
    current_app.logger.info(f'=== Admin Delete Rental: {rental_id} ===')
    
    rental = Rental.query.get(rental_id)
    if not rental:
        return jsonify({'error': 'Rental not found'}), 404
    
    Payment.query.filter_by(rental_id=rental_id).delete()
    Payout.query.filter_by(rental_id=rental_id).delete()
    
    db.session.delete(rental)
    db.session.commit()
    
    current_app.logger.info(f'Admin deleted rental ID: {rental_id}')
    return jsonify({'message': 'Rental and related payments deleted successfully'}), 200


@bp.route('/payments/<int:payment_id>', methods=['DELETE'])
@admin_required
def delete_payment(payment_id):
    current_app.logger.info(f'=== Admin Delete Payment: {payment_id} ===')
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    
    db.session.delete(payment)
    db.session.commit()
    
    current_app.logger.info(f'Admin deleted payment ID: {payment_id}')
    return jsonify({'message': 'Payment deleted successfully'}), 200


@bp.route('/payments/<int:payment_id>/status', methods=['PUT'])
@admin_required
def update_payment_status(payment_id):
    current_app.logger.info(f'=== Admin Update Payment Status: {payment_id} ===')
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['pending', 'confirmed', 'failed', 'refunded']:
        return jsonify({'error': 'Invalid status'}), 400
    
    payment.status = new_status
    if new_status == 'confirmed':
        payment.confirmed_at = datetime.utcnow()
        if payment.rental:
            payment.rental.is_active = True
            payment.rental.start_date = datetime.utcnow()
    
    db.session.commit()
    
    current_app.logger.info(f'Admin updated payment {payment_id} status to {new_status}')
    return jsonify({
        'message': 'Payment status updated successfully',
        'payment': payment.to_dict()
    }), 200


@bp.route('/referrals/<int:referral_id>', methods=['DELETE'])
@admin_required
def delete_referral(referral_id):
    current_app.logger.info(f'=== Admin Delete Referral: {referral_id} ===')
    
    referral = Referral.query.get(referral_id)
    if not referral:
        return jsonify({'error': 'Referral not found'}), 404
    
    Payout.query.filter_by(referral_id=referral_id).delete()
    
    db.session.delete(referral)
    db.session.commit()
    
    current_app.logger.info(f'Admin deleted referral ID: {referral_id}')
    return jsonify({'message': 'Referral deleted successfully'}), 200


@bp.route('/database/cleanup', methods=['POST'])
@admin_required
def cleanup_database():
    current_app.logger.info('=== Admin Database Cleanup ===')
    data = request.get_json()
    
    cleanup_type = data.get('type', 'all')
    results = {}
    
    if cleanup_type in ['all', 'failed_payments']:
        count = Payment.query.filter_by(status='failed').delete()
        results['failed_payments_deleted'] = count
    
    if cleanup_type in ['all', 'old_inactive_rentals']:
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(days=365)
        count = Rental.query.filter(
            Rental.is_active == False,
            Rental.end_date < cutoff
        ).delete()
        results['old_inactive_rentals_deleted'] = count
    
    if cleanup_type in ['all', 'orphan_payouts']:
        orphans = Payout.query.filter(
            ~Payout.user_id.in_(db.session.query(User.id))
        ).delete(synchronize_session='fetch')
        results['orphan_payouts_deleted'] = orphans
    
    db.session.commit()
    
    current_app.logger.info(f'Admin cleanup completed: {results}')
    return jsonify({
        'message': 'Database cleanup completed',
        'results': results
    }), 200


@bp.route('/database/stats', methods=['GET'])
@admin_required
def get_database_stats():
    current_app.logger.info('=== Admin Get Database Stats ===')
    
    stats = {
        'users': {
            'total': User.query.count(),
            'admins': User.query.filter_by(is_admin=True).count()
        },
        'miners': {
            'total': Miner.query.count()
        },
        'rentals': {
            'total': Rental.query.count(),
            'active': Rental.query.filter_by(is_active=True).count(),
            'inactive': Rental.query.filter_by(is_active=False).count()
        },
        'payments': {
            'total': Payment.query.count(),
            'pending': Payment.query.filter_by(status='pending').count(),
            'confirmed': Payment.query.filter_by(status='confirmed').count(),
            'failed': Payment.query.filter_by(status='failed').count()
        },
        'referrals': {
            'total': Referral.query.count()
        },
        'payouts': {
            'total': Payout.query.count(),
            'pending': Payout.query.filter_by(status='pending').count(),
            'paid': Payout.query.filter_by(status='paid').count()
        }
    }
    
    return jsonify(stats), 200


@bp.route('/users/<int:user_id>/balance', methods=['PUT'])
@admin_required
def update_user_balance(user_id):
    current_app.logger.info(f'=== Admin Update User Balance: {user_id} ===')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    referrals = Referral.query.filter_by(referrer_id=user_id).all()
    if data.get('commission_earned_usd') is not None:
        for referral in referrals:
            referral.commission_earned_usd = float(data['commission_earned_usd']) / len(referrals) if referrals else 0
    
    db.session.commit()
    
    current_app.logger.info(f'Admin updated balance for user {user_id}')
    return jsonify({
        'message': 'User balance updated successfully',
        'user': user.to_dict()
    }), 200


@bp.route('/rentals/<int:rental_id>', methods=['PUT'])
@admin_required
def update_rental(rental_id):
    current_app.logger.info(f'=== Admin Update Rental: {rental_id} ===')
    
    rental = Rental.query.get(rental_id)
    if not rental:
        return jsonify({'error': 'Rental not found'}), 404
    
    data = request.get_json()
    
    if 'is_active' in data:
        rental.is_active = data['is_active']
    if 'total_profit_btc' in data:
        rental.total_profit_btc = float(data['total_profit_btc'])
    if 'hashrate_allocated' in data:
        rental.hashrate_allocated = float(data['hashrate_allocated'])
    if 'duration_days' in data:
        rental.duration_days = int(data['duration_days'])
    if 'monthly_fee_usd' in data:
        rental.monthly_fee_usd = float(data['monthly_fee_usd'])
    
    db.session.commit()
    
    current_app.logger.info(f'Admin updated rental {rental_id}')
    return jsonify({
        'message': 'Rental updated successfully',
        'rental': rental.to_dict()
    }), 200
