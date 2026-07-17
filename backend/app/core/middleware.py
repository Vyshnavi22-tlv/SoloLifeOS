import time
import logging
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("security")

# Rate Limiter state in-memory
RATE_LIMIT_WINDOW = 60 # seconds
RATE_LIMIT_MAX_REQUESTS = 100 # requests per window
ip_request_history = defaultdict(list)

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        
        # 1. Rate Limiting sliding window checks
        now = time.time()
        # Clean old logs
        ip_request_history[client_ip] = [t for t in ip_request_history[client_ip] if now - t < RATE_LIMIT_WINDOW]
        
        if len(ip_request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            logger.warning(f"[RATE LIMIT EXCEEDED] IP: {client_ip} reached request threshold.")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down and try again."}
            )
        
        # Log active timestamp
        ip_request_history[client_ip].append(now)

        # 2. SQL Injection / XSS Path & Query parameters checking safeguard
        # Scan URL path and queries for SQL injection strings or scripts tags
        unsafe_payloads = [
            "union select", "select * from", "or 1=1", "drop table", "alter table",
            "<script", "javascript:", "onload=", "onerror="
        ]
        
        url_string = str(request.url).lower()
        if any(payload in url_string for payload in unsafe_payloads):
            logger.warning(f"[UNSAFE REQUEST REJECTED] IP: {client_ip} sent malicious request payload.")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Malicious payload detected in request parameters."}
            )

        # 3. Simple CSRF Header verification
        # For mutating requests, verify header matching or referer origin
        if request.method in ["POST", "PUT", "DELETE"]:
            origin = request.headers.get("origin")
            referer = request.headers.get("referer")
            
            # If origin is external (not localhost / default app server), verify credentials
            if origin and not any(h in origin for h in ["localhost", "127.0.0.1"]):
                csrf_token = request.headers.get("X-CSRF-Token")
                if not csrf_token:
                    logger.warning(f"[CSRF BLOCKED] Mutating request from origin: {origin} blocked due to missing CSRF token.")
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "CSRF token missing or invalid."}
                    )

        # Execute request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # 4. Secure Security Headers
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://openrouter.ai;"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # 5. Audit Logging user action
        logger.info(
            f"[AUDIT LOG] IP: {client_ip} | Method: {request.method} | "
            f"Path: {request.url.path} | Status: {response.status_code} | "
            f"Latency: {process_time:.4f}s"
        )

        return response
