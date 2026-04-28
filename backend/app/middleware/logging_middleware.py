import logging
import time
from typing import Any

logger = logging.getLogger("app.middleware")


class LoggingMiddleware:
    def __init__(self, app: Any) -> None:
        self.app = app

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path: str = scope.get("path", "")
        if path == "/health":
            await self.app(scope, receive, send)
            return

        method: str = scope.get("method", "")
        start_time = time.time()
        status_code = 200

        async def wrapped_send(message: dict[str, Any]) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message.get("status", 200)
            await send(message)

        await self.app(scope, receive, wrapped_send)

        duration = time.time() - start_time
        logger.info(
            "%s %s - %s - %.4fs",
            method,
            path,
            status_code,
            duration,
        )
