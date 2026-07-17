from app.core.security import verify_password

def test_user_registration(client):
    # Test registering a new user
    response = client.post(
        "/api/v1/users/",
        json={"email": "register@sololife.com", "password": "password123", "fullName": "New User"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "register@sololife.com"
    assert "id" in data

def test_user_login(client, test_user):
    # Test valid login credentials
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_user_login_invalid_password(client, test_user):
    # Test invalid login credentials
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "wrongpassword"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"

def test_read_user_me(client, test_user):
    # Log in to acquire access token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "password123"}
    )
    access_token = login_response.json()["access_token"]

    # Call protected endpoint
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email

def test_refresh_token_rotation(client, test_user):
    # Log in to acquire refresh token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "password123"}
    )
    refresh_token = login_response.json()["refresh_token"]

    # Call token refresh endpoint
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
