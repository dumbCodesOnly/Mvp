import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Referral

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    current_app.logger.info('=== User Registration Request ===')
    data = request.get_json()
    current_app.logger.debug(f'Registration data received: {data.get("email") if data else "No data"}')
    
    if not data or not data.get('email') or not data.get('password'):
        current_app.logger.warning('Registration failed: Missing email or password')
        return jsonify({'error': 'Email and password required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        current_app.logger.warning(f'Registration failed: Email {data["email"]} already registered')
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        referral_code=User.generate_referral_code()
    )
    user.set_password(data['password'])
    current_app.logger.info(f'New user created: {user.email}')
    
    if data.get('referral_code'):
        referrer = User.query.filter_by(referral_code=data['referral_code']).first()
        if referrer:
            user.referred_by = referrer.id
            current_app.logger.info(f'User referred by: {referrer.email} (code: {data["referral_code"]})')
    
    db.session.add(user)
    db.session.commit()
    current_app.logger.info(f'User {user.email} saved to database with ID: {user.id}')
    
    if user.referred_by:
        referral = Referral(referrer_id=user.referred_by, referred_id=user.id)
        db.session.add(referral)
        db.session.commit()
        current_app.logger.info(f'Referral record created for user ID: {user.id}')
    
    access_token = create_access_token(identity=user.id)
    current_app.logger.info(f'Access token generated for user: {user.email}')
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    current_app.logger.info('=== User Login Request ===')
    data = request.get_json()
    current_app.logger.debug(f'Login attempt for email: {data.get("email") if data else "No data"}')
    
    if not data or not data.get('email') or not data.get('password'):
        current_app.logger.warning('Login failed: Missing email or password')
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        current_app.logger.warning(f'Login failed: Invalid credentials for {data["email"]}')
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user.id)
    current_app.logger.info(f'User {user.email} logged in successfully (ID: {user.id})')
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    current_app.logger.debug(f'Profile request for user ID: {user_id}')
    user = User.query.get(user_id)
    
    if not user:
        current_app.logger.error(f'Profile request failed: User ID {user_id} not found')
        return jsonify({'error': 'User not found'}), 404
    
    current_app.logger.debug(f'Profile retrieved for user: {user.email}')
    return jsonify(user.to_dict()), 200
