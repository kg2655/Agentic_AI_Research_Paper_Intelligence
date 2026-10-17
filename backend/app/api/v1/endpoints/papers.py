import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.paper import Paper, AsyncTask
from app.models.schemas import PaperCreate, PaperResponse, PaperListResponse, SearchResult
from app.services.vector_service import vector_service

router = APIRouter()

def format_paper_response(p: Paper) -> PaperResponse:
    try:
        kw = json.loads(p.keywords) if p.keywords else []
    except Exception:
        kw = [k.strip() for k in p.keywords.split(",") if k.strip()] if p.keywords else []

    return PaperResponse(
        id=p.id,
        title=p.title,
        abstract=p.abstract,
        authors=p.authors,
        categories=p.categories,
        published_date=p.published_date,
        doi=p.doi,
        keywords=kw,
        summary=p.summary,
        citation_count=p.citation_count or 0,
        created_at=p.created_at
    )

@router.get("/", response_model=PaperListResponse)
def list_papers(
    skip: int = 0,
    limit: int = 20,
    query: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List and search research papers with optional text query and category filtering."""
    db_query = db.query(Paper)

    if category:
        db_query = db_query.filter(Paper.categories.ilike(f"%{category}%"))

    all_papers = db_query.all()

    if query:
        ranked = vector_service.rank_papers(query, all_papers, top_k=limit)
        results = [format_paper_response(p) for p, _ in ranked]
        return PaperListResponse(total=len(results), papers=results)

    total = len(all_papers)
    paged = all_papers[skip: skip + limit]
    return PaperListResponse(
        total=total,
        papers=[format_paper_response(p) for p in paged]
    )

@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single research paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return format_paper_response(paper)

@router.post("/", response_model=PaperResponse, status_code=status.HTTP_201_CREATED)
def create_paper(
    paper_in: PaperCreate,
    async_processing: bool = Query(True, description="Dispatch async Celery worker for ingestion"),
    db: Session = Depends(get_db)
):
    """
    Ingest a new research paper.
    If async_processing is True, enqueues a Celery task with Redis broker
    to extract keywords and compute vector embeddings asynchronously.
    """
    paper = Paper(
        title=paper_in.title,
        abstract=paper_in.abstract,
        authors=paper_in.authors or "Unknown",
        categories=paper_in.categories or "Computer Science",
        published_date=paper_in.published_date or "",
        doi=paper_in.doi
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    if async_processing:
        task_id = str(uuid.uuid4())
        async_task = AsyncTask(
            id=task_id,
            task_type="paper_ingestion",
            status="PENDING",
            progress=0
        )
        db.add(async_task)
        db.commit()

        # Attempt to dispatch to Celery; fallback to synchronous processing if Celery worker is offline
        try:
            from app.worker.tasks import process_paper_ingestion
            process_paper_ingestion.delay(task_id, paper.id)
        except Exception:
            # Fallback inline processing
            keywords = vector_service.extract_keywords(paper.abstract, top_k=5)
            paper.keywords = json.dumps(keywords)
            paper.summary = paper.abstract[:200] + "..."
            async_task.status = "SUCCESS"
            async_task.progress = 100
            db.commit()
            db.refresh(paper)
    else:
        # Synchronous
        keywords = vector_service.extract_keywords(paper.abstract, top_k=5)
        paper.keywords = json.dumps(keywords)
        paper.summary = paper.abstract[:200] + "..."
        db.commit()
        db.refresh(paper)

    return format_paper_response(paper)

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_sample_papers(db: Session = Depends(get_db)):
    """Seed initial research papers from ArXiv / Medical / AI domains."""
    existing = db.query(Paper).count()
    if existing > 0:
        return {"message": f"Database already populated with {existing} papers."}

    sample_papers = [
        {
            "title": "Attention Is All You Need",
            "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
            "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit",
            "categories": "cs.CL, cs.LG",
            "published_date": "2017-06-12",
            "doi": "10.48550/arXiv.1706.03762",
            "citation_count": 95000,
            "keywords": json.dumps(["transformer", "attention mechanism", "neural networks", "sequence transduction", "encoder decoder"])
        },
        {
            "title": "Deep Learning for Medical Image Reconstruction: A Survey",
            "abstract": "Deep learning has emerged as a prominent technique for medical image reconstruction across MRI, CT, and Ultrasound modalities. In this review, we categorize physics-driven deep neural networks, unrolled iterative networks, and generative adversarial models used to accelerate acquisition and reduce radiation exposure while maintaining high diagnostic fidelity.",
            "authors": "Guang-Hong Chen, Michael Lustig, Jong Chul Ye",
            "categories": "eess.IV, cs.CV",
            "published_date": "2020-03-15",
            "doi": "10.1109/TMI.2020.2987541",
            "citation_count": 1420,
            "keywords": json.dumps(["medical imaging", "mri reconstruction", "deep learning", "convolutional neural networks", "ct imaging"])
        },
        {
            "title": "Language Models are Few-Shot Learners (GPT-3)",
            "abstract": "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance.",
            "authors": "Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah",
            "categories": "cs.CL, cs.AI",
            "published_date": "2020-05-28",
            "doi": "10.48550/arXiv.2005.14165",
            "citation_count": 28400,
            "keywords": json.dumps(["few-shot learning", "large language models", "gpt-3", "in-context learning", "nlp"])
        },
        {
            "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
            "abstract": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
            "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
            "categories": "cs.CL",
            "published_date": "2018-10-11",
            "doi": "10.48550/arXiv.1810.04805",
            "citation_count": 82000,
            "keywords": json.dumps(["bert", "bidirectional transformers", "pre-training", "language representation", "masked language model"])
        },
        {
            "title": "Deep Residual Learning for Image Recognition (ResNet)",
            "abstract": "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.",
            "authors": "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
            "categories": "cs.CV",
            "published_date": "2015-12-10",
            "doi": "10.48550/arXiv.1512.03385",
            "citation_count": 160000,
            "keywords": json.dumps(["residual learning", "resnet", "image recognition", "deep neural networks", "computer vision"])
        }
    ]

    for item in sample_papers:
        paper = Paper(**item)
        db.add(paper)
    
    db.commit()
    return {"message": f"Successfully seeded {len(sample_papers)} papers."}
