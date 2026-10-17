from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PaperBase(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Attention Is All You Need"})
    abstract: str = Field(..., json_schema_extra={"example": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks..."})
    authors: Optional[str] = "Ashish Vaswani, Noam Shazeer, Niki Parmar"
    categories: Optional[str] = "cs.CL, cs.LG"
    published_date: Optional[str] = "2017-06-12"
    doi: Optional[str] = "10.48550/arXiv.1706.03762"

class PaperCreate(PaperBase):
    pass

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    authors: Optional[str] = None
    categories: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None

class PaperResponse(PaperBase):
    id: int
    keywords: List[str] = []
    summary: Optional[str] = None
    citation_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}

class PaperListResponse(BaseModel):
    total: int
    papers: List[PaperResponse]

# Search & Retrieval Schemas
class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10
    category: Optional[str] = None

class SearchResult(BaseModel):
    paper: PaperResponse
    similarity_score: float

# Agent Schemas
class AgentChatRequest(BaseModel):
    message: str = Field(..., json_schema_extra={"example": "Extract the top 5 keywords from the paper on Medical Imaging."})
    paper_id: Optional[int] = None
    history: Optional[List[Dict[str, str]]] = []

class ToolExecutionLog(BaseModel):
    tool_name: str
    tool_args: Dict[str, Any]
    output: Any

class AgentChatResponse(BaseModel):
    response: str
    tool_calls: List[ToolExecutionLog] = []
    sources: List[int] = []

# Celery Async Task Schemas
class AsyncTaskResponse(BaseModel):
    task_id: str
    task_type: str
    status: str
    progress: int
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Graph Schema (Neo4j / Network)
class GraphNode(BaseModel):
    id: str
    label: str
    title: str
    category: Optional[str] = None
    citation_count: Optional[int] = 0

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
