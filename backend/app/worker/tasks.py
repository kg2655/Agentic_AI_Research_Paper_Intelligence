import time
import json
import logging
from app.worker.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.paper import Paper, AsyncTask
from app.services.vector_service import vector_service

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="process_paper_ingestion")
def process_paper_ingestion(self, task_id: str, paper_id: int):
    """
    Celery background worker task:
    1. Fetches paper from DB.
    2. Performs text cleaning, keyword extraction, and auto-summarization.
    3. Simulates/computes embedding vector generation.
    4. Updates task progress and DB records.
    """
    db = SessionLocal()
    try:
        task_record = db.query(AsyncTask).filter(AsyncTask.id == task_id).first()
        if task_record:
            task_record.status = "PROCESSING"
            task_record.progress = 25
            db.commit()

        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise ValueError(f"Paper with id {paper_id} not found.")

        # Simulate heavy compute step 1: Keyword extraction
        time.sleep(1.0)
        keywords = vector_service.extract_keywords(paper.abstract, top_k=6)
        paper.keywords = json.dumps(keywords)

        if task_record:
            task_record.progress = 60
            db.commit()

        # Simulate heavy compute step 2: Neural summarization & embedding creation
        time.sleep(1.0)
        if not paper.summary:
            paper.summary = (
                f"Auto-generated executive summary: {paper.abstract[:200]}... "
                f"This work emphasizes {', '.join(keywords[:3])}."
            )

        if task_record:
            task_record.progress = 90
            db.commit()

        # Finalize
        if task_record:
            task_record.status = "SUCCESS"
            task_record.progress = 100
            task_record.result = json.dumps({
                "paper_id": paper.id,
                "keywords": keywords,
                "summary_length": len(paper.summary)
            })

        db.commit()
        return {"status": "SUCCESS", "paper_id": paper_id, "keywords": keywords}

    except Exception as e:
        logger.error(f"Task {task_id} failed: {e}")
        db.rollback()
        task_record = db.query(AsyncTask).filter(AsyncTask.id == task_id).first()
        if task_record:
            task_record.status = "FAILED"
            task_record.error = str(e)
            db.commit()
        raise e
    finally:
        db.close()
