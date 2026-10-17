from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.paper import Paper
from app.models.schemas import AgentChatRequest, AgentChatResponse
from app.services.agent_service import agent_service

router = APIRouter()

@router.post("/chat", response_model=AgentChatResponse)
def chat_with_agent(
    req: AgentChatRequest,
    db: Session = Depends(get_db)
):
    """
    Interact with the Agentic AI Research Intelligence system.
    Dynamically routes queries to tools:
    - search_and_summarize
    - extract_keywords
    - compare_papers
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty.")

    all_papers = db.query(Paper).all()
    if not all_papers:
        raise HTTPException(
            status_code=400, 
            detail="No papers found in the database. Please seed or upload papers first."
        )

    response = agent_service.run_agent(req.message, all_papers)
    return response
