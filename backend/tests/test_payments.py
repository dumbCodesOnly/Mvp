import pytest

def test_create_payment(client):
    """Test creating a new payment."""
    client.post('/api/auth/register', json={'email': 'test@example.com', 'password': 'password'})
    response = client.post('/api/auth/login', json={'email': 'test@example.com', 'password': 'password'})
    access_token = response.get_json()['access_token']

    response = client.post('/api/payments/', json={
        'amount_usd': 100
    }, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['amount_usd'] == 100

def test_get_user_payments(client):
    """Test retrieving a list of payments for a user."""
    client.post('/api/auth/register', json={'email': 'test@example.com', 'password': 'password'})
    response = client.post('/api/auth/login', json={'email': 'test@example.com', 'password': 'password'})
    access_token = response.get_json()['access_token']

    client.post('/api/payments/', json={
        'amount_usd': 100
    }, headers={'Authorization': f'Bearer {access_token}'})

    response = client.get('/api/payments/user', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert len(json_data) == 1
    assert json_data[0]['amount_usd'] == 100
