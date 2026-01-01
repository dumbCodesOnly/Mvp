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
