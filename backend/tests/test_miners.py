import pytest

def test_create_miner(client, admin_token):
    """Test creating a new miner."""
    response = client.post('/api/miners/', headers={'Authorization': f'Bearer {admin_token}'}, json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['name'] == 'Test Miner'

def test_get_miners(client, admin_token):
    """Test retrieving a list of miners."""
    client.post('/api/miners/', headers={'Authorization': f'Bearer {admin_token}'}, json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    response = client.get('/api/miners/', headers={'Authorization': f'Bearer {admin_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert len(json_data) == 1
    assert json_data[0]['name'] == 'Test Miner'
