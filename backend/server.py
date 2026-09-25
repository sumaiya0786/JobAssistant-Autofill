"""
Thin reverse proxy: uvicorn serves this FastAPI app on 0.0.0.0:8001 (required by the
platform), and forwards every request to the real Node.js/Express backend running on
127.0.0.1:${NODE_PORT}. All business logic, models, auth and AI live in /app/server.
"""
import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse

NODE_PORT = os.environ.get("NODE_PORT", "5001")
NODE_BASE = f"http://127.0.0.1:{NODE_PORT}"

app = FastAPI(title="Job Assistant Proxy")
_client: httpx.AsyncClient | None = None

HOP_BY_HOP = {
    "content-length", "transfer-encoding", "connection", "keep-alive",
    "proxy-authenticate", "proxy-authorization", "te", "trailers", "upgrade", "host",
}


@app.on_event("startup")
async def _startup():
    global _client
    _client = httpx.AsyncClient(base_url=NODE_BASE, timeout=60.0)


@app.on_event("shutdown")
async def _shutdown():
    if _client:
        await _client.aclose()


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    url = "/" + path
    try:
        upstream = await _client.request(
            request.method,
            url,
            params=dict(request.query_params),
            headers=headers,
            content=body,
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "Backend service is starting, please retry in a moment."},
        )
    resp_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in HOP_BY_HOP}
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )
