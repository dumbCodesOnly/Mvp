import pytest
from app import create_app, db
from app.models import User

@pytest.fixture(scope='function')
def app():
    """Create and configure a new app instance for each test."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def admin_user(client):
    """Fixture to create an admin user."""
    response = client.post('/api/auth/register', json={
        'email': 'admin@example.com',
        'password': 'password'
    })
    user = User.query.filter_by(email='admin@example.com').first()
    user.is_admin = True
    db.session.commit()
    return user

@pytest.fixture
def admin_token(client, admin_user):
    """Fixture to get an admin token."""
    response = client.post('/api/auth/login', json={
        'email': 'admin@example.com',
        'password': 'password'
    })
    return response.get_json()['access_token']
