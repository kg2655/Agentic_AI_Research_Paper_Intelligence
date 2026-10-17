import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(512), index=True, nullable=False)
    abstract = Column(Text, nullable=False)
    authors = Column(String(512), default="Unknown")
    categories = Column(String(256), default="Computer Science")
    published_date = Column(String(64), default="")
    doi = Column(String(128), nullable=True)
    keywords = Column(Text, default="[]")  # JSON encoded list of keywords
    summary = Column(Text, nullable=True)
    citation_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    outgoing_citations = relationship(
        "Citation",
        foreign_keys="Citation.source_paper_id",
        back_populates="source_paper",
        cascade="all, delete-orphan"
    )
    incoming_citations = relationship(
        "Citation",
        foreign_keys="Citation.target_paper_id",
        back_populates="target_paper",
        cascade="all, delete-orphan"
    )


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    source_paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    target_paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)

    source_paper = relationship("Paper", foreign_keys=[source_paper_id], back_populates="outgoing_citations")
    target_paper = relationship("Paper", foreign_keys=[target_paper_id], back_populates="incoming_citations")


class AsyncTask(Base):
    __tablename__ = "async_tasks"

    id = Column(String(128), primary_key=True, index=True)
    task_type = Column(String(64), nullable=False)
    status = Column(String(32), default="PENDING")  # PENDING, PROCESSING, SUCCESS, FAILED
    progress = Column(Integer, default=0)
    result = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
