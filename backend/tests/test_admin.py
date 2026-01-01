import pytest
from app import db
from app.models import User, Miner, Rental, Payment, Payout

@pytest.fixture
def test_user(client):
    """Fixture to create a regular user."""
    user = User(email='test@example.com', referral_code='TESTCODE')
    user.set_password('password')
    db.session.add(user)
    db.session.commit()
    return user

def test_get_dashboard_stats(client, admin_token):
    """Test retrieving dashboard stats."""
    response = client.get('/api/admin/stats', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'users' in json_data
    assert 'miners' in json_data
    assert 'rentals' in json_data

def test_get_all_users(client, admin_token, test_user):
    """Test retrieving all users."""
    response = client.get('/api/admin/users', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['total'] == 2

def test_get_user_details(client, admin_token, test_user):
    """Test retrieving details for a specific user."""
    response = client.get(f'/api/admin/users/{test_user.id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['user']['email'] == 'test@example.com'

def test_toggle_user_admin(client, admin_token, test_user):
    """Test toggling a user's admin status."""
    response = client.put(f'/api/admin/users/{test_user.id}/toggle-admin', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    db.session.refresh(test_user)
    assert test_user.is_admin

def test_create_and_delete_miner(client, admin_token):
    """Test creating and then deleting a miner."""
    # Create
    create_response = client.post('/api/admin/miners', headers={'Authorization': f'Bearer {admin_token}'}, json={
        'name': 'Temp Miner', 'model': 'T2', 'hashrate_th': 120,
        'price_usd': 1500, 'efficiency': 25, 'power_watts': 3000
    })
    assert create_response.status_code == 201
    miner_id = create_response.get_json()['miner']['id']

    # Delete
    delete_response = client.delete(f'/api/admin/miners/{miner_id}', headers={'Authorization': f'Bearer {admin_token}'})
    assert delete_response.status_code == 200

def test_get_all_rentals_admin(client, admin_token, test_user):
    """Test retrieving all rentals as admin."""
    miner = Miner(name='Test Miner', model='T1', hashrate_th=100, price_usd=1000, efficiency=30, power_watts=3000)
    db.session.add(miner)
    db.session.commit()
    rental = Rental(user_id=test_user.id, miner_id=miner.id, hashrate_allocated=50, duration_days=30, monthly_fee_usd=50)
    db.session.add(rental)
    db.session.commit()

    response = client.get('/api/admin/rentals', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['total'] == 1

def test_get_all_payments_admin(client, admin_token, test_user):
    """Test retrieving all payments as admin."""
    payment = Payment(user_id=test_user.id, amount_usd=100, status='confirmed')
    db.session.add(payment)
    db.session.commit()

    response = client.get('/api/admin/payments', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['total'] == 1

def test_process_payouts(client, admin_token, test_user):
    """Test processing payouts."""
    payout = Payout(user_id=test_user.id, amount_usd=50, status='pending')
    db.session.add(payout)
    db.session.commit()

    response = client.put(f'/api/admin/payouts/{payout.id}/process', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    db.session.refresh(payout)
    assert payout.status == 'paid'

def test_update_settings(client, admin_token):
    """Test updating system settings."""
    response = client.put('/api/admin/settings', headers={'Authorization': f'Bearer {admin_token}'}, json={
        'referral_percentage': '7.5'
    })
    assert response.status_code == 200
