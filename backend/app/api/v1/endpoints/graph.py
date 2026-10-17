from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.paper import Paper, Citation
from app.models.schemas import GraphDataResponse
from app.services.graph_service import graph_service

router = APIRouter()

@router.get("/", response_model=GraphDataResponse)
def get_graph_data(db: Session = Depends(get_db)):
    """
    Retrieve citation and co-occurrence graph data for Neo4j / visual network explorer.
    Returns paper nodes, author edges, and citation relationships.
    """
    papers = db.query(Paper).all()
    citations = db.query(Citation).all()
    return graph_service.get_citation_graph(papers, citations)
