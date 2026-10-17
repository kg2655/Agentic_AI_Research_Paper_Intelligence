import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.paper import AsyncTask
from app.models.schemas import AsyncTaskResponse

router = APIRouter()

@router.get("/{task_id}", response_model=AsyncTaskResponse)
def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """
    Poll the execution status of an asynchronous background Celery worker task.
    """
    task = db.query(AsyncTask).filter(AsyncTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Async task not found")

    result_data = None
    if task.result:
        try:
            result_data = json.loads(task.result)
        except Exception:
            result_data = {"raw": task.result}

    return AsyncTaskResponse(
        task_id=task.id,
        task_type=task.task_type,
        status=task.status,
        progress=task.progress,
        result=result_data,
        error=task.error
    )
