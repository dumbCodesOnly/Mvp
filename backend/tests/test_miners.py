import pytest

def test_create_miner(admin_client):
    """Test creating a new miner."""
    response = admin_client.post('/api/miners/', json={
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

def test_get_miners(admin_client):
    """Test retrieving a list of miners."""
    admin_client.post('/api/miners/', json={
        'name': 'Test Miner',
        'model': 'Model X',
        'hashrate_th': 100,
        'price_usd': 1000,
        'efficiency': 30,
        'power_watts': 3000
    })
    response = admin_client.get('/api/miners/')
    assert response.status_code == 200
    json_data = response.get_json()
    assert len(json_data) == 1
    assert json_data[0]['name'] == 'Test Miner'
