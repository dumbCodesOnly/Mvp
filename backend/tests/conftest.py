import pytest
from app import create_app, db
from app.models import User

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def admin_client(app):
    """An admin test client for the app."""
    with app.app_context():
        admin = User(email='admin@example.com', is_admin=True, referral_code=User.generate_referral_code())
        admin.set_password('password')
        db.session.add(admin)
        db.session.commit()

    client = app.test_client()
    response = client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'password'})
    access_token = response.get_json()['access_token']
    client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
    return client
