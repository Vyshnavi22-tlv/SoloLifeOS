def test_update_profile(client, test_user):
    # Log in
    login_res = client.post(
        "/api/v1/auth/login/access-token",
        data={"username": test_user.email, "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Call PUT profile update
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "test@sololife.com", "full_name": "Updated Test User"}
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Test User"

def test_export_user_data(client, test_user):
    # Log in
    login_res = client.post(
        "/api/v1/auth/login/access-token",
        data={"username": test_user.email, "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Call export data
    response = client.get(
        "/api/v1/users/me/export",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == test_user.email
    assert "modules" in data

def test_delete_user_account(client, test_user):
    # Log in
    login_res = client.post(
        "/api/v1/auth/login/access-token",
        data={"username": test_user.email, "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Delete account
    response = client.delete(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Account deleted successfully"
