from unittest.mock import AsyncMock, patch

def test_ai_chat_missing_api_key(client, test_user):
    # Log in
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Call chat endpoint without api keys
    response = client.post(
        "/api/v1/ai/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"messages": [{"role": "user", "content": "Hello!"}]}
    )
    assert response.status_code == 400
    assert "OpenRouter API Key not set" in response.json()["detail"]

@patch("openai.resources.chat.completions.AsyncCompletions.create")
def test_ai_chat_streaming_success(mock_create, client, test_user):
    # Mocking openai response async iterator chunks
    async def mock_chunks():
        class MockChoice:
            def __init__(self, text):
                class MockDelta:
                    content = text
                self.delta = MockDelta()

        class MockChunk:
            choices = [MockChoice("Hello")]

        yield MockChunk()
        
        class MockChunkEmpty:
            choices = [MockChoice("")]
            
        yield MockChunkEmpty()

    mock_create.return_value = mock_chunks()

    # Log in
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Call AI chat with mock keys
    response = client.post(
        "/api/v1/ai/chat",
        headers={
            "Authorization": f"Bearer {token}",
            "X-OpenRouter-Key": "mock_api_key"
        },
        json={"messages": [{"role": "user", "content": "Hi!"}]}
    )
    
    assert response.status_code == 200
    # Stream returns chunks
    assert "Hello" in response.text
