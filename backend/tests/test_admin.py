import pytest

def test_get_users(admin_client):
    """Test retrieving a list of users."""
    response = admin_client.get('/api/admin/users')
    assert response.status_code == 200
    json_data = response.get_json()
    assert len(json_data['users']) == 1
    assert json_data['users'][0]['email'] == 'admin@example.com'

def test_toggle_user_admin(admin_client):
    """Test toggling a user's admin status."""
    response = admin_client.put('/api/admin/users/1/toggle-admin')
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == 'Cannot modify your own admin status'

def test_delete_user(admin_client):
    """Test deleting a user."""
    response = admin_client.delete('/api/admin/users/1')
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == 'Cannot delete your own account'

def test_create_miner_admin(admin_client):
    """Test creating a new miner as an admin."""
    response = admin_client.post('/api/admin/miners', json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['miner']['name'] == 'Test Miner'

def test_update_miner_admin(admin_client):
    """Test updating a miner as an admin."""
    admin_client.post('/api/admin/miners', json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    response = admin_client.put('/api/admin/miners/1', json={'name': 'Updated Miner'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['miner']['name'] == 'Updated Miner'

def test_delete_miner_admin(admin_client):
    """Test deleting a miner as an admin."""
    admin_client.post('/api/admin/miners', json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    response = admin_client.delete('/api/admin/miners/1')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['message'] == 'Miner deleted successfully'
