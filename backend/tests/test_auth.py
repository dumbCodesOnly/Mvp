import pytest
from app.models import User

def test_register_user(client):
    """Test user registration."""
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['message'] == 'User registered successfully'

def test_register_existing_user(client):
    """Test registering a user with an email that already exists."""
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == 'Email already registered'

def test_login_user(client):
    """Test user login."""
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'access_token' in json_data

def test_login_with_incorrect_password(client):
    """Test logging in with an incorrect password."""
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    json_data = response.get_json()
    assert json_data['error'] == 'Invalid email or password'

def test_get_profile(client):
    """Test getting a user's profile."""
    client.post('/api/auth/register', json={'email': 'test@example.com', 'password': 'password'})
    response = client.post('/api/auth/login', json={'email': 'test@example.com', 'password': 'password'})
    access_token = response.get_json()['access_token']

    response = client.get('/api/auth/profile', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['email'] == 'test@example.com'
