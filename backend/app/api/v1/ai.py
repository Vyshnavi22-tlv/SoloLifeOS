from typing import Any, List
from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import openai
from app.api import deps
from app.models.user import User
from app.core.config import settings

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: List[Message]
    model: str = "meta-llama/llama-3-8b-instruct:free"

@router.post("/chat")
async def chat_ai(
    payload: ChatPayload,
    current_user: User = Depends(deps.get_current_user),
    x_openrouter_key: str = Header(None, alias="X-OpenRouter-Key")
) -> Any:
    # Use headers key, otherwise config settings key
    api_key = x_openrouter_key or settings.OPENROUTER_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OpenRouter API Key not set. Please set the key in the settings page."
        )

    # Initialize AsyncOpenAI client targeting OpenRouter
    client = openai.AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key
    )

    async def stream_generator():
        try:
            response = await client.chat.completions.create(
                model=payload.model,
                messages=[m.model_dump() for m in payload.messages],
                stream=True,
                extra_headers={
                    "HTTP-Referer": "https://sololifeos.local",
                    "X-Title": "Solo Life OS Assistant"
                }
            )
            async for chunk in response:
                content = chunk.choices[0].delta.content or ""
                if content:
                    yield content
        except Exception as e:
            yield f"[ERROR]: Failed streaming from OpenRouter. {str(e)}"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
