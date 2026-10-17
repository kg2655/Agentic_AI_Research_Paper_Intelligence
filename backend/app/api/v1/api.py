from fastapi import APIRouter
from app.api.v1.endpoints import papers, agent, graph, tasks

api_router = APIRouter()

api_router.include_router(papers.router, prefix="/papers", tags=["Papers"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Agent"])
api_router.include_router(graph.router, prefix="/graph", tags=["Citation Graph"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Async Tasks (Celery)"])
